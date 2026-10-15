// Jäätymisen diagnostiikka (SCOPES-JAATYMINEN 14.10.2026, käyttäjä: "välillä äpissä on tapahtunut jäätymistä"). Äppi
// kirjaa tapahtumat muistiin ja välimuistitiedostoon ja lähettää ne palveluun (POST /api/diagnostiikka), joka kirjoittaa
// ne tiedostoon ~/.local/state/scopes-app.loki (palvelu/diagnostiikka.mjs). Tapahtumat:
//   jumi           pääsäie ei vastannut vähintään JUMI_S sekuntiin; ms ja jumin aikana kesken olleet pyynnöt
//   jumi-kesken    edellinen käynnistys päättyi kesken jumin (iOS:n vahti tai käyttäjä sulki äpin)
//   pyynto         hidas (≥ HIDAS_S), epäonnistunut tai muu kuin 200-vastaus: polku, ms, koodi tai virhe
//   kaynnistys, vaihe   elinkaari (active, inactive, background), jotta jumi asettuu aikajanalle
//   metrickit      iOS:n oma jumi- tai kaatumisraportti kutsupinoineen (MXDiagnosticPayload, toimitetaan viiveellä)
// Palvelun pyyntöloki (scopes-pyynnot.loki) näyttää saman hetken palvelimen puolelta.
import Foundation
import MetricKit
import UIKit

struct DiagnostiikkaVastaus: Decodable { let kirjattu: Int }

final class Diagnostiikka: NSObject, MXMetricManagerSubscriber {
    static let jaettu = Diagnostiikka()

    private static let JUMI_S: CFTimeInterval = 1.0
    private static let HIDAS_S: CFTimeInterval = 2.0
    private static let VALI_S: CFTimeInterval = 0.25
    private static let PUSKURI = 500
    static let polku = "/api/diagnostiikka"

    // Kaikki tila käsitellään tällä jonolla; pääsäie vain kuittaa vahdin pingin.
    private let jono = DispatchQueue(label: "com.example.skoopit.diagnostiikka")
    private var tapahtumat: [[String: Any]] = []
    private var kesken: [UUID: (polku: String, alku: CFTimeInterval)] = [:]
    private var vahti: DispatchSourceTimer?
    private var pingLahti: CFTimeInterval?
    private var edellinenTikki: CFTimeInterval = 0
    private var jumiAlku: CFTimeInterval?
    private var lahettaa = false
    private weak var asetukset: Asetukset?

    private lazy var hakemisto = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
    private lazy var puskuriTiedosto = hakemisto.appendingPathComponent("diagnostiikka.json")
    private lazy var jumiTiedosto = hakemisto.appendingPathComponent("diagnostiikka-jumi.json")

    private static let iso: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    @MainActor func kaynnista(_ asetukset: Asetukset) {
        guard self.asetukset == nil else { return }
        self.asetukset = asetukset
        let laite = UIDevice.current.systemVersion
        jono.async {
            self.lataaPuskuri()
            if let data = try? Data(contentsOf: self.jumiTiedosto),
               let edellinen = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                var t = edellinen
                t["tyyppi"] = "jumi-kesken"
                self.lisaa(t)
            }
            try? FileManager.default.removeItem(at: self.jumiTiedosto)
            self.lisaa(["tyyppi": "kaynnistys", "ios": laite])
        }
        MXMetricManager.shared.add(self)
        // UIKitin ilmoitukset eivätkä SwiftUI:n scenePhase: äpin tason scenePhase antoi simulaattorissa kahdesti
        // "inactive" eikä koskaan "active" (14.10.2026).
        let nc = NotificationCenter.default
        for (nimi, vaihe) in [(UIApplication.didBecomeActiveNotification, "active"), (UIApplication.willResignActiveNotification, "inactive"),
                              (UIApplication.didEnterBackgroundNotification, "background")] {
            nc.addObserver(forName: nimi, object: nil, queue: .main) { [weak self] _ in
                MainActor.assumeIsolated { self?.vaihe(vaihe) }
            }
        }
        if UIApplication.shared.applicationState == .active { kaynnistaVahti() }
        Task.detached { [weak self] in
            while !Task.isCancelled {
                await self?.laheta()
                try? await Task.sleep(for: .seconds(30))
            }
        }
    }

    @MainActor private func vaihe(_ nimi: String) {
        jono.async { self.lisaa(["tyyppi": "vaihe", "vaihe": nimi]) }
        // Taustalla prosessi pysähtyy, ja herätessä vanha ping näyttäisi jumilta: vahti vain etualalla.
        if nimi == "active" { kaynnistaVahti() } else { pysaytaVahti() }
        if nimi == "background" {
            let tehtava = UIApplication.shared.beginBackgroundTask(withName: "diagnostiikka")
            Task { await laheta(); UIApplication.shared.endBackgroundTask(tehtava) }
        }
    }

    // Asiakas kutsuu jokaisen pyynnön ympärillä; oma lähetys ei kirjaa itseään.
    func alkoi(_ polku: String) -> UUID? {
        guard !polku.hasPrefix(Self.polku) else { return nil }
        let id = UUID()
        let alku = CACurrentMediaTime()
        jono.async { self.kesken[id] = (Self.ilmanKyselya(polku), alku) }
        return id
    }

    func paattyi(_ id: UUID?, koodi: Int? = nil, virhe: Error? = nil) {
        guard let id else { return }
        let loppu = CACurrentMediaTime()
        jono.async {
            guard let p = self.kesken.removeValue(forKey: id) else { return }
            // Näkymän vaihto peruu pyynnön (URLError -999): ei vika eikä jumi.
            if virhe is CancellationError || (virhe as? URLError)?.code == .cancelled { return }
            let kesto = loppu - p.alku
            guard kesto >= Self.HIDAS_S || virhe != nil || (koodi ?? 200) != 200 else { return }
            var t: [String: Any] = ["tyyppi": "pyynto", "polku": p.polku, "ms": Int(kesto * 1000)]
            if let koodi { t["koodi"] = koodi }
            if let virhe {
                t["virhe"] = (virhe as? URLError).map { "URLError \($0.code.rawValue)" } ?? String(describing: virhe)
            }
            self.lisaa(t)
        }
    }

    // MARK: pääsäikeen vahti

    @MainActor private func kaynnistaVahti() {
        jono.async {
            guard self.vahti == nil else { return }
            self.pingLahti = nil
            self.jumiAlku = nil
            self.edellinenTikki = CACurrentMediaTime()
            let ajastin = DispatchSource.makeTimerSource(queue: self.jono)
            ajastin.schedule(deadline: .now() + Self.VALI_S, repeating: Self.VALI_S, leeway: .milliseconds(50))
            ajastin.setEventHandler { [weak self] in self?.tikki() }
            ajastin.resume()
            self.vahti = ajastin
        }
    }

    @MainActor private func pysaytaVahti() {
        jono.async {
            self.vahti?.cancel()
            self.vahti = nil
            self.pingLahti = nil
            if self.jumiAlku != nil { self.jumiAlku = nil; try? FileManager.default.removeItem(at: self.jumiTiedosto) }
        }
    }

    private func tikki() {
        let nyt = CACurrentMediaTime()
        // Ajastin itse myöhästyi (prosessi pysähtyi): odottava ping ei kerro pääsäikeestä mitään.
        if nyt - edellinenTikki > 1.0 { pingLahti = nil; jumiAlku = nil }
        edellinenTikki = nyt
        if let lahti = pingLahti {
            if jumiAlku == nil, nyt - lahti >= Self.JUMI_S {
                jumiAlku = lahti
                // Merkki levylle: jos iOS lopettaa äpin kesken jumin, seuraava käynnistys kirjaa sen.
                let merkki: [String: Any] = ["aika": Self.iso.string(from: Date(timeIntervalSinceNow: lahti - nyt)), "kesken": keskenNyt(nyt)]
                if let data = try? JSONSerialization.data(withJSONObject: merkki) { try? data.write(to: jumiTiedosto) }
            }
            return
        }
        pingLahti = nyt
        DispatchQueue.main.async { [weak self] in
            let vastasi = CACurrentMediaTime()
            self?.jono.async { self?.kuittaa(vastasi) }
        }
    }

    private func kuittaa(_ vastasi: CFTimeInterval) {
        guard let lahti = pingLahti else { return }
        pingLahti = nil
        guard jumiAlku != nil else { return }
        jumiAlku = nil
        try? FileManager.default.removeItem(at: jumiTiedosto)
        lisaa(["tyyppi": "jumi", "ms": Int((vastasi - lahti) * 1000), "kesken": keskenNyt(vastasi)],
              aika: Date(timeIntervalSinceNow: lahti - CACurrentMediaTime()))
    }

    private func keskenNyt(_ nyt: CFTimeInterval) -> [[String: Any]] {
        kesken.values.map { ["polku": $0.polku, "ms": Int((nyt - $0.alku) * 1000)] }
    }

    // MARK: MetricKit

    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for p in payloads {
            let alku = Self.iso.string(from: p.timeStampBegin)
            var raportit: [[String: Any]] = []
            for h in p.hangDiagnostics ?? [] {
                raportit.append(Self.metat(h, ["laji": "jumi", "kesto_s": h.hangDuration.converted(to: .seconds).value,
                                               "pino": Self.json(h.callStackTree.jsonRepresentation())]))
            }
            for c in p.crashDiagnostics ?? [] {
                var r: [String: Any] = ["laji": "kaatuminen", "syy": c.terminationReason ?? "", "signaali": c.signal?.intValue ?? 0,
                                        "pino": Self.json(c.callStackTree.jsonRepresentation())]
                // Ilman poikkeuksen tekstiä 13 SIGABRTia jäi symboloimatta (14.–15.10.2026); syy löytyi vain commit-viestistä.
                if let e = c.exceptionReason {
                    r["poikkeus"] = [e.exceptionName, e.className, e.composedMessage].joined(separator: " — ")
                }
                raportit.append(Self.metat(c, r))
            }
            for var r in raportit {
                r["tyyppi"] = "metrickit"
                r["jakso_alku"] = alku
                jono.async { self.lisaa(r) }
            }
        }
        Task { await laheta() }
    }

    // Simulaattori ja puhelin kirjaavat samaan lokiin: metatiedot erottavat ne ja buildin.
    private static func metat(_ d: MXDiagnostic, _ r: [String: Any]) -> [String: Any] {
        var r = r
        r["ios"] = d.metaData.osVersion
        r["laitemalli"] = d.metaData.deviceType
        r["build"] = d.metaData.applicationBuildVersion
        return r
    }

    private static func json(_ data: Data) -> Any { (try? JSONSerialization.jsonObject(with: data)) ?? "" }

    // MARK: puskuri ja lähetys

    private func lisaa(_ t: [String: Any], aika: Date = Date()) {
        var rivi = t
        rivi["aika"] = rivi["aika"] ?? Self.iso.string(from: aika)
        tapahtumat.append(rivi)
        if tapahtumat.count > Self.PUSKURI { tapahtumat.removeFirst(tapahtumat.count - Self.PUSKURI) }
        tallennaPuskuri()
    }

    private func tallennaPuskuri() {
        guard let data = try? JSONSerialization.data(withJSONObject: tapahtumat) else { return }
        try? data.write(to: puskuriTiedosto, options: .atomic)
    }

    private func lataaPuskuri() {
        guard let data = try? Data(contentsOf: puskuriTiedosto),
              let vanhat = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else { return }
        tapahtumat = vanhat + tapahtumat
    }

    private static func ilmanKyselya(_ polku: String) -> String { String(polku.split(separator: "?", maxSplits: 1).first ?? "") }

    private static let laite: [String: Any] = {
        let info = Bundle.main.infoDictionary ?? [:]
        return ["versio": "\(info["CFBundleShortVersionString"] ?? "?") (\(info["CFBundleVersion"] ?? "?"))"]
    }()

    func laheta() async {
        let yhteys: (String, String)? = await MainActor.run { [weak self] in
            self?.asetukset.flatMap { $0.valmis ? ($0.osoite, $0.avain) : nil }
        }
        guard let yhteys else { return }
        let (osoite, avain) = yhteys
        // Otetaan lähetettävät talteen; onnistuneet poistetaan puskurin alusta, uudet jäävät.
        let (erä, n): ([[String: Any]], Int) = jono.sync {
            guard !lahettaa, !tapahtumat.isEmpty else { return ([], 0) }
            lahettaa = true
            return (tapahtumat, tapahtumat.count)
        }
        guard n > 0 else { return }
        var onnistui = false
        if let runko = try? JSONSerialization.data(withJSONObject: ["laite": Self.laite, "tapahtumat": erä]) {
            onnistui = (try? await Asiakas(osoite: osoite, avain: avain).diagnostiikka(runko)) != nil
        }
        jono.sync {
            if onnistui { tapahtumat.removeFirst(min(n, tapahtumat.count)); tallennaPuskuri() }
            lahettaa = false
        }
    }
}
