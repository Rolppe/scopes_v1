// Rekisterisynkan äppipää (LOCALREGISTER-APPI 14.10.2026, scopes/localregister/MUOTO.md §2–§5): paikallinen kopio
// yksiköistä, synkka palvelun /api/lr/-polkuja vasten ja ristiriitojen ratkaisu (K4). Sivujärjestelmä: alkuperäiset
// rekisterit ja git pysyvät totuutena, äppi muokkaa vain kaksoiskappaletta (MUOTO §7).
//
// Tiivisteet lasketaan merkki merkiltä kuten palvelun lr.mjs (`tiivisteRivi`, `rekisterinTiiviste`, `tiivisteet`),
// jotta muuttumaton tila maksaa yhden kyselyn: juuritiiviste sama → valmis. Järjestys on JavaScriptin oletus
// (UTF-16-yksiköt), ei Swiftin Unicode-vertailu.
//
// Ristiriita (molemmat muuttaneet samaa riviä): äppi lähettää oman versionsa, palvelu tallentaa sen rinnakkaiseksi,
// ja äppi hakee palvelun yksikön sellaisenaan. Silloin molemmilla on sama `rinnakkaiset`-lista samassa järjestyksessä
// ja tiivisteet täsmäävät. Ratkaisu saa vektorin, joka on ≥ kaikkia rinnakkaisia, joten se leviää ilman uutta riitaa.
import CryptoKit
import Foundation
import Network
import SwiftUI

typealias LrVektori = [String: Int]

struct LrSisar: Codable, Hashable {
    var sisalto: String
    var poistettu: Bool
    var versio: LrVektori
    var muutettu: String?
    var muuttaja: String?
}

// Palvelun `lahdeSisalto`/`lahdeVersio` ovat gitin puolen kenttiä, jotka pysyvät palvelulla: dekoodaus ohittaa ne.
struct LrYksikko: Codable, Identifiable, Hashable {
    var id: String
    var rekisteri: String
    var laji: String
    var osio: String?
    var jarjestys: String
    var sisalto: String
    var versio: LrVektori
    var muutettu: String?
    var muuttaja: String?
    var poistettu: Bool
    var rinnakkaiset: [LrSisar]?

    var riidassa: Bool { !(rinnakkaiset ?? []).isEmpty }
}

struct LrMeta: Codable, Hashable {
    var rekisteri: String
    var versio: LrVektori
    var poistettu: Bool
}

struct LrRekisteri: Codable {
    var meta: LrMeta
    var yksikot: [String: LrYksikko]
}

struct LrTiivisteet: Decodable {
    let laite: String
    let juuri: String
    let rekisterit: [String: String]
    let valiMin: Int
}

struct LrListaRivi: Decodable {
    let id: String
    let versio: LrVektori
    let rinnakkaiset: [LrVektori]
}

struct LrLista: Decodable {
    let meta: LrMeta
    let yksikot: [LrListaRivi]
}

struct LrHaku: Decodable { let yksikot: [LrYksikko] }

struct LrLahetys: Decodable {
    let otettu: Int
    let ohitettu: Int
    let ristiriidat: [String]
}

enum LrSuhde { case sama, uudempi, vanhempi, rinnakkainen }

enum LrLaskenta {
    // JavaScriptin `Array.prototype.sort` ilman vertailijaa: UTF-16-yksiköt.
    static func ennen(_ a: String, _ b: String) -> Bool { a.utf16.lexicographicallyPrecedes(b.utf16) }

    // lr.mjs `vertaa`: a suhteessa b:hen.
    static func vertaa(_ a: LrVektori, _ b: LrVektori) -> LrSuhde {
        var suurempi = false, pienempi = false
        for k in Set(a.keys).union(b.keys) {
            let x = a[k] ?? 0, y = b[k] ?? 0
            if x > y { suurempi = true }
            if x < y { pienempi = true }
        }
        return suurempi && pienempi ? .rinnakkainen : suurempi ? .uudempi : pienempi ? .vanhempi : .sama
    }

    static func vektori(_ v: LrVektori) -> String { v.keys.sorted(by: ennen).map { "\($0)=\(v[$0]!)" }.joined(separator: ",") }

    static func sha(_ s: String) -> String { SHA256.hash(data: Data(s.utf8)).map { String(format: "%02x", $0) }.joined() }

    static func tiiviste(_ r: LrRekisteri) -> String {
        let rivit = r.yksikot.values.map { y in
            "\(y.id):\(vektori(y.versio))" + (y.rinnakkaiset ?? []).map { "|\(vektori($0.versio))" }.joined()
        }.sorted(by: ennen)
        return sha((["_meta:\(vektori(r.meta.versio))"] + rivit).joined(separator: "\n"))
    }

    static func juuri(_ t: [String: String]) -> String {
        sha(t.keys.sorted(by: ennen).map { "\($0):\(t[$0]!)" }.joined(separator: "\n"))
    }

    // Yksiköt rekisterin järjestyksessä (lr.mjs `jarjestyksessa`).
    static func jarjestyksessa(_ ys: some Sequence<LrYksikko>) -> [LrYksikko] {
        ys.sorted { $0.jarjestys != $1.jarjestys ? ennen($0.jarjestys, $1.jarjestys) : ennen($0.id, $1.id) }
    }
}

@MainActor final class Lr: ObservableObject {
    static let jaettu = Lr()

    enum Syy { case yhteys, ajastin, muutos, toiminto, kasin }

    @Published private(set) var rekisterit: [String: LrRekisteri] = [:]
    @Published private(set) var ladattu = false
    @Published private(set) var kaynnissa = false
    @Published private(set) var viimeisin: Date?
    @Published private(set) var tulos: String?
    @Published private(set) var virhe: String?
    @Published private(set) var muutoksia = false
    @Published private(set) var laite: String

    private var laskuri: Int
    private var valiMin = 10
    private var viimeTyhja: Date?
    private var muutosLaskuri = 0
    private var uudelleen = false
    private var valimuisti: [String: String] = [:]
    private var asetukset: Asetukset?
    private var viive: Task<Void, Never>?
    private var ajastin: Task<Void, Never>?
    private var verkkoOli: Bool?
    private let verkko = NWPathMonitor()
    private let hakemisto: URL
    private let kirjoitus = DispatchQueue(label: "com.example.skoopit.lr")

    private struct Laite: Codable { var laite: String; var laskuri: Int }

    init(ymparisto: [String: String] = ProcessInfo.processInfo.environment) {
        hakemisto = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("localregister", isDirectory: true)
        // UI-testi aloittaa tyhjästä kopiosta ja uudesta laitteesta.
        if ymparisto["SCOPES_LR_NOLLAA"] == "1" { try? FileManager.default.removeItem(at: hakemisto) }
        try? FileManager.default.createDirectory(at: hakemisto, withIntermediateDirectories: true)
        let tiedosto = hakemisto.appendingPathComponent("laite.json")
        if let data = try? Data(contentsOf: tiedosto), let l = try? JSONDecoder().decode(Laite.self, from: data) {
            laite = l.laite
            laskuri = l.laskuri
        } else {
            // Tunnus `<laite>-<laskuri>` on yksilöllinen vain, jos laitteen nimi on (MUOTO §2): simulaattori ja puhelin
            // ovat eri laitteita, joten nimeen satunnainen pääte. Palvelu hyväksyy vain [a-z0-9].
            let merkit = Array("abcdefghijklmnopqrstuvwxyz0123456789")
            laite = "iphone" + String((0..<4).map { _ in merkit.randomElement()! })
            laskuri = 0
            tallennaLaite()
        }
    }

    // MARK: Käynnistys ja laukaisijat (MUOTO §5)

    func kaynnista(_ asetukset: Asetukset) {
        guard self.asetukset == nil else { return }
        self.asetukset = asetukset
        verkko.pathUpdateHandler = { [weak self] p in
            let yhteys = p.status == .satisfied
            Task { @MainActor in self?.verkkoMuuttui(yhteys) }
        }
        verkko.start(queue: DispatchQueue(label: "com.example.skoopit.lr.verkko"))
        Task {
            let hak = hakemisto
            let luetut = await Task.detached { Self.lue(hak) }.value
            rekisterit = luetut
            ladattu = true
            laukaise(.yhteys)
            kaynnistaAjastin()
        }
    }

    func vaihe(_ v: ScenePhase) {
        if v == .active {
            laukaise(.yhteys)
            kaynnistaAjastin()
        } else {
            ajastin?.cancel()
            ajastin = nil
        }
    }

    private func verkkoMuuttui(_ yhteys: Bool) {
        defer { verkkoOli = yhteys }
        if yhteys && verkkoOli == false { laukaise(.yhteys) }
    }

    // Uudelleentarkistus etualalla palvelun ilmoittamin välein (valiMin, käyttäjä 14.10.2026: 10 min).
    private func kaynnistaAjastin() {
        guard ajastin == nil, ladattu else { return }
        ajastin = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(Double((self?.valiMin ?? 10) * 60)))
                if Task.isCancelled { break }
                self?.laukaise(.ajastin)
            }
        }
    }

    // Paikallinen muutos lähtee 5 s viiveellä (naputtelusarja yhtenä). Yhteys ja ajastin eivät tarkista uudelleen,
    // jos edellinen tarkistus oli tyhjä alle vähimmäisvälin sitten eikä paikallisia muutoksia ole (K1).
    // Pakkaus, purku ja käsin painettu synkka ajetaan aina (V4).
    func laukaise(_ syy: Syy) {
        switch syy {
        case .muutos:
            viive?.cancel()
            viive = Task { [weak self] in
                try? await Task.sleep(for: .seconds(5))
                if Task.isCancelled { return }
                await self?.synkkaa()
            }
        case .yhteys, .ajastin:
            if !muutoksia, let t = viimeTyhja, Date().timeIntervalSince(t) < Double(valiMin * 60) { return }
            Task { await synkkaa() }
        case .toiminto, .kasin:
            Task { await synkkaa() }
        }
    }

    // MARK: Synkka

    func synkkaa() async {
        guard ladattu, let asetukset, asetukset.valmis else { return }
        if kaynnissa { uudelleen = true; return }
        kaynnissa = true
        repeat {
            uudelleen = false
            do {
                try await kierros(Asiakas(osoite: asetukset.osoite, avain: asetukset.avain))
                virhe = nil
            } catch {
                virhe = error.localizedDescription
            }
        } while uudelleen
        kaynnissa = false
    }

    private func kierros(_ a: Asiakas) async throws {
        let alussa = muutosLaskuri
        let t = try await a.lrTiivisteet()
        valiMin = max(1, t.valiMin)
        if LrLaskenta.juuri(tiivisteet()) == t.juuri {
            if muutosLaskuri == alussa { muutoksia = false }
            viimeTyhja = Date()
            valmis("ei muutoksia")
            return
        }
        // Äppi ei vielä luo rekistereitä (REKISTERI.md Avoimet asiat, Reunatapaus): vain palvelun tuntemat rekisterit.
        let omat = tiivisteet()
        let eroavat = t.rekisterit.keys.filter { t.rekisterit[$0] != omat[$0] }.sorted(by: LrLaskenta.ennen)
        let listat = try await a.lrListat(eroavat)

        var lahetettavat: [LrYksikko] = []
        var haettavat: [String: [String]] = [:]
        var kuva: [String: LrVektori] = [:] // "polku\nid" → paikallinen versio suunnitteluhetkellä
        var muuttuneet = Set<String>()
        for polku in eroavat {
            guard let lista = listat[polku] else { continue }
            var r = rekisterit[polku] ?? LrRekisteri(meta: lista.meta, yksikot: [:])
            if rekisterit[polku] == nil || r.meta != lista.meta && LrLaskenta.vertaa(lista.meta.versio, r.meta.versio) != .vanhempi {
                r.meta = lista.meta
                rekisterit[polku] = r
                muuttuneet.insert(polku)
            }
            let palvelin = Dictionary(lista.yksikot.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
            for y in r.yksikot.values {
                guard let p = palvelin[y.id] else { lahetettavat.append(siirtoon(y)); continue }
                let s = LrLaskenta.vertaa(y.versio, p.versio)
                if s == .uudempi || s == .rinnakkainen { lahetettavat.append(siirtoon(y)) }
            }
            for p in lista.yksikot {
                let oma = r.yksikot[p.id]
                let s = oma.map { LrLaskenta.vertaa($0.versio, p.versio) }
                let eriRiita = oma.map { ($0.rinnakkaiset ?? []).map(\.versio) != p.rinnakkaiset } ?? true
                if s == nil || s == .vanhempi || s == .rinnakkainen || s == .sama && eriRiita {
                    haettavat[polku, default: []].append(p.id)
                    if let oma { kuva["\(polku)\n\(p.id)"] = oma.versio }
                }
            }
        }

        var lahetetty = 0
        for era in stride(from: 0, to: lahetettavat.count, by: 300) {
            let osa = Array(lahetettavat[era..<min(era + 300, lahetettavat.count)])
            let v = try await a.lrLaheta(osa)
            lahetetty += v.otettu
            // Palvelu tallensi rinnakkaisen: haetaan sen yksikkö, jotta riitalista on sama molemmilla.
            for id in v.ristiriidat {
                guard let y = osa.first(where: { $0.id == id }) else { continue }
                if !(haettavat[y.rekisteri]?.contains(id) ?? false) {
                    haettavat[y.rekisteri, default: []].append(id)
                    kuva["\(y.rekisteri)\n\(id)"] = y.versio
                }
            }
        }

        var haettu = 0
        for (polku, idt) in haettavat {
            for era in stride(from: 0, to: idt.count, by: 400) {
                let tulleet = try await a.lrHae(polku, Array(idt[era..<min(era + 400, idt.count)]))
                guard var r = rekisterit[polku] else { continue }
                for y in tulleet {
                    // Käyttäjä muokkasi riviä kesken synkan: muutos jää seuraavalle kierrokselle.
                    if r.yksikot[y.id]?.versio != kuva["\(polku)\n\(y.id)"] { continue }
                    r.yksikot[y.id] = y
                    haettu += 1
                }
                rekisterit[polku] = r
                muuttuneet.insert(polku)
            }
        }
        for p in muuttuneet { valimuisti[p] = nil }
        tallenna(muuttuneet)
        if muutosLaskuri == alussa { muutoksia = false }

        // Todennus: sama juuritiiviste molemmilla = synkka valmis.
        let jalkeen = try await a.lrTiivisteet()
        let yhteneva = LrLaskenta.juuri(tiivisteet()) == jalkeen.juuri
        valmis("haettu \(haettu), lähetetty \(lahetetty), ristiriitoja \(ristiriidat.count)" + (yhteneva ? ", yhtenevä" : ", tiivisteet eroavat"))
    }

    private func valmis(_ teksti: String) {
        viimeisin = Date()
        tulos = teksti
    }

    private func siirtoon(_ y: LrYksikko) -> LrYksikko {
        var s = y
        s.rinnakkaiset = nil
        return s
    }

    private func tiivisteet() -> [String: String] {
        var t: [String: String] = [:]
        for (polku, r) in rekisterit {
            if valimuisti[polku] == nil { valimuisti[polku] = LrLaskenta.tiiviste(r) }
            t[polku] = valimuisti[polku]
        }
        return t
    }

    // MARK: Muokkaus (K3) ja ristiriidan ratkaisu (K4)

    // Uusi versio on ≥ yksikön ja kaikkien sen rinnakkaisten vektoreita, joten se myös ratkaisee ristiriidan.
    func muokkaa(_ polku: String, _ id: String, sisalto: String, poistettu: Bool = false) {
        guard var r = rekisterit[polku], var y = r.yksikot[id] else { return }
        var v = y.versio
        for s in y.rinnakkaiset ?? [] { v.merge(s.versio, uniquingKeysWith: max) }
        laskuri += 1
        tallennaLaite()
        v[laite] = laskuri
        y.sisalto = sisalto
        y.poistettu = poistettu
        y.versio = v
        y.muutettu = ISO8601DateFormatter().string(from: Date())
        y.muuttaja = laite
        y.rinnakkaiset = nil
        r.yksikot[id] = y
        rekisterit[polku] = r
        valimuisti[polku] = nil
        tallenna([polku])
        muutosLaskuri += 1
        muutoksia = true
        laukaise(.muutos)
    }

    var ristiriidat: [LrYksikko] {
        rekisterit.values.flatMap { $0.yksikot.values.filter(\.riidassa) }.sorted { LrLaskenta.ennen($0.id, $1.id) }
    }

    var yksikkoja: Int { rekisterit.values.reduce(0) { $0 + $1.yksikot.count } }

    func rivit(_ polku: String) -> [LrYksikko] {
        LrLaskenta.jarjestyksessa((rekisterit[polku]?.yksikot.values).map(Array.init) ?? []).filter { !$0.poistettu || $0.riidassa }
    }

    // MARK: Levy: Application Support/localregister/rekisterit/<polku>.json

    private nonisolated static func lue(_ hakemisto: URL) -> [String: LrRekisteri] {
        let juuri = hakemisto.appendingPathComponent("rekisterit", isDirectory: true)
        guard let kaikki = FileManager.default.enumerator(at: juuri, includingPropertiesForKeys: nil) else { return [:] }
        var ulos: [String: LrRekisteri] = [:]
        for case let url as URL in kaikki where url.pathExtension == "json" {
            if let data = try? Data(contentsOf: url), let r = try? JSONDecoder().decode(LrRekisteri.self, from: data) {
                ulos[r.meta.rekisteri] = r
            }
        }
        return ulos
    }

    private func tallenna(_ polut: Set<String>) {
        let juuri = hakemisto.appendingPathComponent("rekisterit", isDirectory: true)
        let kirjoitettavat = polut.compactMap { p in rekisterit[p].map { (p, $0) } }
        kirjoitus.async {
            for (polku, r) in kirjoitettavat {
                let url = juuri.appendingPathComponent(polku + ".json")
                try? FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
                if let data = try? JSONEncoder().encode(r) { try? data.write(to: url, options: .atomic) }
            }
        }
    }

    private func tallennaLaite() {
        let url = hakemisto.appendingPathComponent("laite.json")
        if let data = try? JSONEncoder().encode(Laite(laite: laite, laskuri: laskuri)) { try? data.write(to: url, options: .atomic) }
    }
}
