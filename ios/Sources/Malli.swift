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
    var id: String { nimi }
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
}

// Palvelun kolme valmista toimintoa (toiminnot.mjs); muita ei ole.
enum Toiminto: String {
    case pura, pakkaa
}

struct ToimintoVastaus: Decodable, Hashable {
    let toiminto: String
    let nimi: String
    let osoite: String?
    let istunto: String?
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

struct LahetysVastaus: Decodable {
    let istunto: String
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
