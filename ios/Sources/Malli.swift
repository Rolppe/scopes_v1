// Rajapinnan `scopes/palvelu` vastaukset (palvelin.mjs, lahteet.mjs). Kenttien nimet ovat palvelun nimiä.
import Foundation

struct SkooppiYhteenveto: Decodable, Identifiable, Hashable {
    let nimi: String
    let seuraava: String?
    let avoimia: Int
    let vikoja: Int
    let istuntoja: Int
    let suurinKonteksti: Int?
    // Rekisterin tai istunnon viimeisin muutos (ISO); sivupalkki järjestää skoopit ja chatit tällä.
    let aika: String?
    // kysely / kasittely / odottaa / pakattu (SCOPES-LISTA-TILAVARIT, -KYSELYVARI); vanha palvelu ei lähetä tilaa → päätellään istunnoista.
    let tila: String?
    var id: String { nimi }
    var tilaNyt: String { tila ?? (istuntoja > 0 ? "kasittely" : "pakattu") }
}

struct Seuraava: Decodable, Hashable {
    let id: String?
    let kuvaus: String
    let polut: [String]
    let aloitus: String?
}

struct Konteksti: Decodable, Hashable {
    let tokenit: Int
    let aika: String?
}

struct Istunto: Decodable, Identifiable, Hashable {
    let id: String
    let nimi: String?
    let tila: String?
    let konteksti: Konteksti?
    let pakattu: Bool?
    // Välimuistin herätys (/sa) päällä; vanha palvelu ei lähetä → nil.
    let hereilla: Bool?
}

// Rekisterin taulukkorivi: otsikkosolu → arvo. Otsikot vaihtelevat skoopeittain ("Asia", "Vika", "Tila", …).
struct Taulukkorivi: Decodable, Hashable {
    let solut: [String: String]
    init(from decoder: Decoder) throws {
        solut = try decoder.singleValueContainer().decode([String: String].self)
    }
    var otsikko: String { solut["Asia"] ?? solut["Vika"] ?? solut.values.first ?? "" }
    var tila: String? { solut["Tila"] }
    var seuraavaAskel: String? { solut["Seuraava askel"] }
    var avoin: Bool { !["valmis", "todennettu", "korjattu"].contains((tila ?? "").lowercased()) }
}

struct SkooppiNakyma: Decodable, Hashable {
    let nimi: String
    let rekisterit: [String]
    let seuraava: Seuraava?
    let avoimet: [Taulukkorivi]
    let viat: [Taulukkorivi]
    let istunnot: [Istunto]
    // Puuttuu vanhemmalta palvelulta (ennen SCOPES-INFRA-KONTEKSTI).
    let konteksti: SkoopinKonteksti?
    // Varatulle istunnolle jonotetut komennot (/sa, /sa pois, /automaattisiirto; V-294); vanha palvelu ei lähetä → nil.
    let jonossa: [Jonorivi]?
}

struct Jonorivi: Decodable, Hashable {
    let komento: String
    let aika: Double
}

// Skoopin konteksti (SCOPES-INFRA-KONTEKSTI 13.10.2026, lahteet.mjs skoopinKonteksti): tiedostot otsikoittain
// tokeniarvioineen ja elävien istuntojen konteksti osa-alueittain. Tiedostojen tokenit ovat arvioita merkkimäärästä;
// istunnon `mitattu` on viimeisimmän vastauksen todellinen kontekstikoko.
struct KontekstiOsa: Decodable, Hashable {
    let otsikko: String
    let teksti: String
    let tokenit: Int
}

struct KontekstiRyhma: Decodable, Hashable, Identifiable {
    let laji: String
    let polku: String
    let tokenit: Int
    // Katon tavut ja raja (SCOPES-INFRA-REKISTERIT); vanha palvelu ei lähetä → nil, raja nil myös tiedostolle ilman kattoa.
    let tavut: Int?
    let raja: Int?
    let osat: [KontekstiOsa]
    var id: String { polku }
    var nimi: String { kontekstiLaji(laji) }
}

func kontekstiLaji(_ laji: String) -> String {
    switch laji {
    case "rekisteri": "Rekisteri"
    case "historia": "Historia"
    case "arkisto": "Arkisto"
    case "viite": "Siirron viitetiedosto"
    case "yhteinen": "Yhteiset ohjeet"
    default: laji
    }
}

// Katon täyttöaste prosentteina (tavut / raja), nil ilman kattoa.
func tayttoaste(_ tavut: Int?, _ raja: Int?) -> Int? {
    guard let tavut, let raja, raja > 0 else { return nil }
    return Int((Double(tavut) * 100 / Double(raja)).rounded())
}

// Kaikkien skooppien kontekstitiedostot (SCOPES-INFRA-REKISTERIT 14.10.2026, GET /api/rekisterit): tavut ja raja samalla
// mitalla kuin pakkauksen check-rekisteri.mjs, tokenit arvio merkkimäärästä.
struct RekisteriTiedosto: Decodable, Hashable, Identifiable {
    let polku: String
    let laji: String
    let skoopit: [String]
    let tavut: Int
    let raja: Int?
    let tokenit: Int
    var id: String { polku }
    var aste: Int? { tayttoaste(tavut, raja) }
}

struct RekisterinOsat: Decodable {
    let polku: String
    let osat: [KontekstiOsa]
}

struct IstunnonOsa: Decodable, Hashable {
    let nimi: String
    let tokenit: Int
}

struct IstunnonKonteksti: Decodable, Hashable, Identifiable {
    let id: String
    let nimi: String?
    let mitattu: Int?
    let osat: [IstunnonOsa]
}

struct SkoopinKonteksti: Decodable, Hashable {
    let tokenit: Int
    let ryhmat: [KontekstiRyhma]
    let istunnot: [IstunnonKonteksti]

    // Koko konteksti yhtenä markdownina jaettavaksi: ensin osuudet, sitten tiedostot kokonaan.
    func markdown(_ skooppi: String) -> String {
        var r = ["# Skoopin \(skooppi) konteksti", "", "Tiedostot yhteensä ≈ \(tokenit) tokenia (arvio merkkimäärästä).", ""]
        for g in ryhmat { r.append("- \(g.nimi) `\(g.polku)`: ≈ \(g.tokenit) tokenia (\(prosentti(g.tokenit, tokenit)))") }
        for i in istunnot {
            r += ["", "## Istunto \(i.nimi ?? String(i.id.prefix(8)))" + (i.mitattu.map { " — mitattu \($0) tokenia" } ?? ""), ""]
            let kaikki = i.mitattu ?? i.osat.reduce(0) { $0 + $1.tokenit }
            for o in i.osat { r.append("- \(o.nimi): ≈ \(o.tokenit) tokenia (\(prosentti(o.tokenit, kaikki)))") }
        }
        for g in ryhmat {
            r += ["", "---", "", "<!-- \(g.nimi): \(g.polku), ≈ \(g.tokenit) tokenia -->", ""]
            r.append(g.osat.map(\.teksti).joined(separator: "\n\n"))
        }
        return r.joined(separator: "\n")
    }
}

// Osuus prosentteina: alle prosentti "<1 %", muuten kokonaislukuna.
func prosentti(_ osa: Int, _ kaikki: Int) -> String {
    guard kaikki > 0, osa > 0 else { return "0 %" }
    let p = Double(osa) * 100 / Double(kaikki)
    return p < 1 ? "<1 %" : "\(Int(p.rounded())) %"
}

// Palvelun valmiit toiminnot (toiminnot.mjs); muita ei ole.
enum Toiminto: String {
    case pura, pakkaa, automaattisiirto, herata
    case herataPois = "herata-pois"
}

// Globaalit pakkauskytkimet (palvelu/toiminnot-asetukset.mjs, käyttäjä 14.10.2026): koskevat kaikkia skooppeja.
struct PakkausKytkimet: Decodable, Hashable {
    var automaattijatko: Bool
    var autopack: Bool
}

enum PakkausKytkin: String {
    case automaattijatko, autopack
}

struct ToimintoVastaus: Decodable, Hashable {
    let toiminto: String
    let nimi: String
    let osoite: String?
    let istunto: String?
    let komento: String?
    // true: istunto oli varattu, komento lähtee palvelun jonosta, kun istunto vapautuu (V-294).
    let jonossa: Bool?
}

// Chat ja skoopin viestit (viestit.mjs, DEMO-SCOPES-VALILEHDET).
struct Agentti: Decodable, Identifiable, Hashable {
    let nimi: String
    let kuvaus: String
    let tyyppi: String
    var id: String { nimi }
    var otsikko: String { kuvaus.isEmpty ? nimi : kuvaus }
}

// Suoratoiston rivi (DEMO-SCOPES-SUORATOISTO): pala, lopuksi valmis (koko vastaus ja keskustelun tunnus) tai virhe.
struct ChatTapahtuma: Decodable {
    let tyyppi: String
    let teksti: String?
    let vastaus: String?
    let keskustelu: String?
    let virhe: String?
}

// Agentin monivalinta (AskUserQuestion, DEMO-SCOPES-LISTA 13.10.2026): kysymys ja vaihtoehdot.
struct Vaihtoehto: Decodable, Hashable {
    let nimi: String
    let kuvaus: String?
}

struct Kysymys: Decodable, Hashable {
    let kysymys: String
    let otsikko: String?
    let monivalinta: Bool
    let vaihtoehdot: [Vaihtoehto]
}

// rooli: kayttaja, agentti, tyokalu (agentin työkalukutsu yhtenä rivinä, DEMO-SCOPES-PARANNUKSET) tai kysymys
// (monivalinta; vastaus tulee perässä käyttäjän viestinä).
struct Viesti: Decodable, Hashable {
    let rooli: String
    var teksti: String
    let aika: String?
    var kysymykset: [Kysymys]? = nil
    var vastattu: Bool? = nil
    var omaViesti: Bool { rooli == "kayttaja" }
    var tyokalu: Bool { rooli == "tyokalu" }
}

// Chatin keskusteluhistoria (DEMO-SCOPES-PARANNUKSET): agentti puuttuu, jos palvelu ei tunne sitä.
struct ChatKeskustelu: Decodable, Identifiable, Hashable {
    let id: String
    let otsikko: String
    let agentti: String?
    let viesteja: Int
    let aika: String
}

struct ChatKeskustelunViestit: Decodable {
    let id: String
    let agentti: String?
    let viestit: [Viesti]
}

struct SkooppiViestit: Decodable {
    let nimi: String
    let auki: Bool
    // Skoopissa on vain pakattuja istuntoja: keskustelu tyhjennetään ja Pura jatkaa samassa näkymässä.
    let pakattu: Bool?
    let istunto: Istunto?
    let voiLahettaa: Bool
    let viestit: [Viesti]
}

// Clauden käyttörajat prosentteina (CHAT-KAYTTORAJA): null, kun palvelu ei ole saanut lukemaa.
struct Kayttoraja: Decodable {
    struct Raja: Decodable {
        let kaytto: Double
        let nollautuu: String?
    }
    let viisiTuntia: Raja?
    let viikko: Raja?
}

struct LahetysVastaus: Decodable {
    let istunto: String
}

// Chatin stop-napin kuittaus (CHAT-STOP).
struct PysaytysVastaus: Decodable {
    let ok: Bool
}

// Palvelimelle tallennetun liitteen polku, jonka äppi lisää viestiin (CHAT-MEDIA-SKOOPPI).
struct LiiteVastaus: Decodable {
    let polku: String
    let koko: Int
}

// Infra-välilehden puu: "scopes ios mac" on skoopin "scopes ios" lapsi, jos se on olemassa, muuten lähimmän
// olemassa olevan sanaetuliitteen lapsi; ilman sellaista juuri.
struct SkooppiSolmu: Identifiable, Hashable {
    let skooppi: SkooppiYhteenveto
    var lapset: [SkooppiSolmu]?
    var id: String { skooppi.nimi }
}

func skooppiPuu(_ skoopit: [SkooppiYhteenveto]) -> [SkooppiSolmu] {
    let nimet = Set(skoopit.map(\.nimi))
    func vanhempi(_ nimi: String) -> String? {
        var sanat = nimi.split(separator: " ")
        while sanat.count > 1 {
            sanat.removeLast()
            let ehdokas = sanat.joined(separator: " ")
            if nimet.contains(ehdokas) { return ehdokas }
        }
        return nil
    }
    func solmu(_ s: SkooppiYhteenveto) -> SkooppiSolmu {
        let lapset = skoopit.filter { vanhempi($0.nimi) == s.nimi }.sorted { $0.nimi < $1.nimi }.map(solmu)
        return SkooppiSolmu(skooppi: s, lapset: lapset.isEmpty ? nil : lapset)
    }
    return skoopit.filter { vanhempi($0.nimi) == nil }.sorted { $0.nimi < $1.nimi }.map(solmu)
}

// Sama sääntö kuin palvelun UUSI_NIMI: 1–12 sanaa [a-z0-9-], sana alkaa kirjaimella tai numerolla, enintään 24 merkkiä.
func kelpaaUudeksi(_ nimi: String) -> Bool {
    nimi.range(of: #"^[a-z0-9][a-z0-9-]{0,23}( [a-z0-9][a-z0-9-]{0,23}){0,11}$"#, options: .regularExpression) != nil
}

// Palvelun ISO-aika (millisekunneilla tai ilman) päiväykseksi. Jäsentimet luodaan kerran: sivupalkin lajittelu
// kutsuu tätä joka vertailussa, ja jäsentimen luonti joka kutsulla nyki palkin avausta (13.10.2026).
private let isoMs: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return f
}()
private let isoS = ISO8601DateFormatter()

func isoPaiva(_ iso: String?) -> Date? {
    guard let iso else { return nil }
    return isoMs.date(from: iso) ?? isoS.date(from: iso)
}

// 228100 → "228 k"
func tokenit(_ n: Int) -> String { n >= 1000 ? "\(n / 1000) k" : "\(n)" }
