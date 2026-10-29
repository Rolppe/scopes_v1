import Foundation

public struct SkooppiYhteenveto: Codable, Identifiable, Hashable, Sendable {
    public let nimi: String
    public let seuraava: String?
    public let avoimia: Int
    public let vikoja: Int
    public let istuntoja: Int
    public let suurinKonteksti: Int?
    public let aika: String?
    public let tila: String?

    public var id: String { nimi }
    public var tilaNyt: String { tila ?? (istuntoja > 0 ? "kasittely" : "pakattu") }

    public init(nimi: String, seuraava: String? = nil, avoimia: Int = 0, vikoja: Int = 0, istuntoja: Int = 0, suurinKonteksti: Int? = nil, aika: String? = nil, tila: String? = nil) {
        self.nimi = nimi
        self.seuraava = seuraava
        self.avoimia = avoimia
        self.vikoja = vikoja
        self.istuntoja = istuntoja
        self.suurinKonteksti = suurinKonteksti
        self.aika = aika
        self.tila = tila
    }
}

public struct Seuraava: Codable, Hashable, Sendable {
    public let id: String?
    public let kuvaus: String
    public let polut: [String]
    public let aloitus: String?

    public init(id: String? = nil, kuvaus: String, polut: [String], aloitus: String? = nil) {
        self.id = id
        self.kuvaus = kuvaus
        self.polut = polut
        self.aloitus = aloitus
    }
}

public struct Viesti: Codable, Hashable, Sendable, Identifiable {
    public var id: String { "\(rooli)-\(aika ?? "")-\(teksti.prefix(20))" }
    public let rooli: String
    public var teksti: String
    public let aika: String?
    public var kysymykset: [Kysymys]?
    public var vastattu: Bool?
    public var omaViesti: Bool { rooli == "kayttaja" }
    public var tyokalu: Bool { rooli == "tyokalu" }

    public init(rooli: String, teksti: String, aika: String? = nil, kysymykset: [Kysymys]? = nil, vastattu: Bool? = nil) {
        self.rooli = rooli
        self.teksti = teksti
        self.aika = aika
        self.kysymykset = kysymykset
        self.vastattu = vastattu
    }
}

public struct Vaihtoehto: Codable, Hashable, Sendable, Identifiable {
    public let nimi: String
    public let kuvaus: String?
    public var id: String { nimi }

    public init(nimi: String, kuvaus: String? = nil) {
        self.nimi = nimi
        self.kuvaus = kuvaus
    }
}

public struct Kysymys: Codable, Hashable, Sendable, Identifiable {
    public let kysymys: String
    public let otsikko: String?
    public let monivalinta: Bool
    public let vaihtoehdot: [Vaihtoehto]
    public var id: String { kysymys }

    public init(kysymys: String, otsikko: String? = nil, monivalinta: Bool = false, vaihtoehdot: [Vaihtoehto] = []) {
        self.kysymys = kysymys
        self.otsikko = otsikko
        self.monivalinta = monivalinta
        self.vaihtoehdot = vaihtoehdot
    }
}

public struct SkooppiViestit: Codable, Hashable, Sendable {
    public let nimi: String
    public let auki: Bool
    public let pakattu: Bool?
    public let voiLahettaa: Bool
    public let viestit: [Viesti]
    public let istunto: Istunto?

    public init(nimi: String, auki: Bool, pakattu: Bool? = nil, voiLahettaa: Bool = true, viestit: [Viesti] = [], istunto: Istunto? = nil) {
        self.nimi = nimi
        self.auki = auki
        self.pakattu = pakattu
        self.voiLahettaa = voiLahettaa
        self.viestit = viestit
        self.istunto = istunto
    }
}

public struct Kayttoraja: Codable, Hashable, Sendable {
    public struct Raja: Codable, Hashable, Sendable {
        public let kaytto: Double
        public let nollautuu: String?
        public let teksti: String?
        public let otsikko: String?

        public init(kaytto: Double, nollautuu: String? = nil, teksti: String? = nil, otsikko: String? = nil) {
            self.kaytto = kaytto
            self.nollautuu = nollautuu
            self.teksti = teksti
            self.otsikko = otsikko
        }
    }

    public let viisiTuntia: Raja?
    public let viikko: Raja?
    public let otsikko: String?
    public let ymparisto: String?

    public init(viisiTuntia: Raja? = nil, viikko: Raja? = nil, otsikko: String? = nil, ymparisto: String? = nil) {
        self.viisiTuntia = viisiTuntia
        self.viikko = viikko
        self.otsikko = otsikko
        self.ymparisto = ymparisto
    }

    public var tiivisTeksti: String? {
        if let v = viikko {
            if let teksti = v.teksti, !teksti.isEmpty {
                return teksti.replacingOccurrences(of: " ", with: "")
            }
            if let p5 = viisiTuntia {
                return "5h: \(Int(p5.kaytto)) %, 7pv: \(Int(v.kaytto)) %"
            }
            return "\(Int(v.kaytto)) %"
        }
        if let p5 = viisiTuntia {
            return "5h: \(Int(p5.kaytto)) %"
        }
        return nil
    }

    public var suurinKaytto: Double {
        max(viisiTuntia?.kaytto ?? 0, viikko?.kaytto ?? 0)
    }

    public var prosenttiTeksti: String {
        "\(Int(suurinKaytto)) %"
    }

    public var onVaroitus: Bool {
        suurinKaytto >= 85 && suurinKaytto < 100
    }

    public var onTayna: Bool {
        suurinKaytto >= 100
    }
}

public struct KayttorajatKaikki: Codable, Hashable, Sendable {
    public struct AgyRyhmat: Codable, Hashable, Sendable {
        public let gemini: Kayttoraja?
        public let kolmasOsapuoli: Kayttoraja?

        public init(gemini: Kayttoraja? = nil, kolmasOsapuoli: Kayttoraja? = nil) {
            self.gemini = gemini
            self.kolmasOsapuoli = kolmasOsapuoli
        }
    }

    public let claude: Kayttoraja?
    public let oneplusAgy: AgyRyhmat?
    public let macAgy: AgyRyhmat?

    public init(claude: Kayttoraja? = nil, oneplusAgy: AgyRyhmat? = nil, macAgy: AgyRyhmat? = nil) {
        self.claude = claude
        self.oneplusAgy = oneplusAgy
        self.macAgy = macAgy
    }

    public func raja(ryhmalle ryhma: String, malli: String? = nil) -> Kayttoraja? {
        let r = ryhma.lowercased()
        let m = malli?.lowercased() ?? ""
        let on3p = m.contains("claude") || m.contains("gpt") || m.contains("3p") || m.contains("oss")

        if r.contains("mac") {
            return on3p ? (macAgy?.kolmasOsapuoli ?? macAgy?.gemini) : (macAgy?.gemini ?? macAgy?.kolmasOsapuoli)
        }
        if r.contains("oneplus") || r.contains("linux") || (r.contains("agy") && !r.contains("mac")) {
            return on3p ? (oneplusAgy?.kolmasOsapuoli ?? oneplusAgy?.gemini) : (oneplusAgy?.gemini ?? oneplusAgy?.kolmasOsapuoli)
        }
        if r.contains("claude") {
            return claude
        }
        return nil
    }

    public func raja(mallille malliNimi: String?) -> Kayttoraja? {
        guard let m = malliNimi?.lowercased() else { return nil }
        let on3p = m.contains("claude") || m.contains("gpt") || m.contains("3p") || m.contains("oss")
        if m.contains("mac") {
            return on3p ? (macAgy?.kolmasOsapuoli ?? macAgy?.gemini) : (macAgy?.gemini ?? macAgy?.kolmasOsapuoli)
        }
        if m.contains("oneplus") || m.contains("linux") || m.contains("agy") {
            return on3p ? (oneplusAgy?.kolmasOsapuoli ?? oneplusAgy?.gemini) : (oneplusAgy?.gemini ?? oneplusAgy?.kolmasOsapuoli)
        }
        if m.contains("gemini") {
            return macAgy?.gemini ?? oneplusAgy?.gemini
        }
        if m.contains("gpt") || m.contains("oss") {
            return macAgy?.kolmasOsapuoli ?? oneplusAgy?.kolmasOsapuoli
        }
        if m.contains("claude") || m.contains("sonnet") || m.contains("opus") || m.contains("haiku") {
            return claude
        }
        return nil
    }
}

public struct LahetysVastaus: Codable, Hashable, Sendable {
    public let istunto: String

    public init(istunto: String) {
        self.istunto = istunto
    }
}

// Palvelun vastaus liitteen tallennukseen (palvelu/liitteet.mjs): polku palvelimella ja koko tavuina.
public struct LiiteVastaus: Codable, Hashable, Sendable {
    public let polku: String
    public let koko: Int

    public init(polku: String, koko: Int) {
        self.polku = polku
        self.koko = koko
    }

    // Palvelun yläraja (LIITTEEN_MAKSIMI) ja viestin muoto samoin kuin iOS:n Liite.viesti.
    public static let maksimi = 25 * 1024 * 1024

    public static func viesti(_ teksti: String, polut: [String]) -> String {
        guard !polut.isEmpty else { return teksti }
        let liitteet = "Liitteet: " + polut.joined(separator: " ")
        return teksti.isEmpty ? liitteet : teksti + "\n\n" + liitteet
    }
}

public struct ToimintoVastaus: Codable, Hashable, Sendable {
    public let toiminto: String
    public let nimi: String
    public let osoite: String?
    public let tmux: String?
    public let istunto: String?
    public let komento: String?
    public let jonossa: Bool?
    public let suljettiin: [String]?
    public let malli: String?

    public init(toiminto: String, nimi: String, osoite: String? = nil, tmux: String? = nil, istunto: String? = nil, komento: String? = nil, jonossa: Bool? = nil, suljettiin: [String]? = nil, malli: String? = nil) {
        self.toiminto = toiminto
        self.nimi = nimi
        self.osoite = osoite
        self.tmux = tmux
        self.istunto = istunto
        self.komento = komento
        self.jonossa = jonossa
        self.suljettiin = suljettiin
        self.malli = malli
    }
}


public struct ChatKeskustelu: Codable, Identifiable, Hashable, Sendable {
    public let id: String
    public let otsikko: String
    public let agentti: String?
    public let viesteja: Int
    public let aika: String

    public init(id: String, otsikko: String, agentti: String? = nil, viesteja: Int = 0, aika: String = "") {
        self.id = id
        self.otsikko = otsikko
        self.agentti = agentti
        self.viesteja = viesteja
        self.aika = aika
    }
}

public struct ChatKeskustelunViestit: Codable, Hashable, Sendable {
    public let id: String
    public let agentti: String?
    public let viestit: [Viesti]

    public init(id: String, agentti: String? = nil, viestit: [Viesti] = []) {
        self.id = id
        self.agentti = agentti
        self.viestit = viestit
    }
}

public struct Agentti: Codable, Identifiable, Hashable, Sendable {
    public let nimi: String
    public let kuvaus: String
    public let tyyppi: String

    public var id: String { nimi }
    public var otsikko: String { kuvaus.isEmpty ? nimi : kuvaus }

    public init(nimi: String, kuvaus: String = "", tyyppi: String = "malli") {
        self.nimi = nimi
        self.kuvaus = kuvaus
        self.tyyppi = tyyppi
    }
}

public struct PurkajaVaihtoehto: Codable, Hashable, Sendable {
    public let tunnus: String
    public let kuvaus: String
    public let ryhma: String

    public init(tunnus: String, kuvaus: String, ryhma: String) {
        self.tunnus = tunnus
        self.kuvaus = kuvaus
        self.ryhma = ryhma
    }
}

public struct IstunnonMalli: Codable, Hashable, Sendable, Identifiable {
    public let nimi: String
    public let kuvaus: String
    public let ryhma: String?

    public var id: String { nimi }

    public init(nimi: String, kuvaus: String, ryhma: String? = nil) {
        self.nimi = nimi
        self.kuvaus = kuvaus
        self.ryhma = ryhma
    }
}

public struct MallitVastaus: Codable, Hashable, Sendable {
    public let mallit: [IstunnonMalli]
    public let oletusMalli: String?

    public init(mallit: [IstunnonMalli] = [], oletusMalli: String? = nil) {
        self.mallit = mallit
        self.oletusMalli = oletusMalli
    }
}

public struct PurkuValinnat: Codable, Hashable, Sendable {
    public let purkajat: [PurkajaVaihtoehto]
    public let mallit: [IstunnonMalli]
    public let oletusMalli: String

    public init(purkajat: [PurkajaVaihtoehto] = [], mallit: [IstunnonMalli] = [], oletusMalli: String = "") {
        self.purkajat = purkajat
        self.mallit = mallit
        self.oletusMalli = oletusMalli
    }
}

public struct PakkausKytkimet: Codable, Hashable, Sendable {
    public var automaattijatko: Bool
    public var autopack: Bool
    public var istunto: String?
    public var istuntoja: Int?

    public init(automaattijatko: Bool = false, autopack: Bool = false, istunto: String? = nil, istuntoja: Int? = nil) {
        self.automaattijatko = automaattijatko
        self.autopack = autopack
        self.istunto = istunto
        self.istuntoja = istuntoja
    }
}

public struct Konteksti: Codable, Hashable, Sendable {
    public let tokenit: Int
    public let aika: String?

    public init(tokenit: Int, aika: String? = nil) {
        self.tokenit = tokenit
        self.aika = aika
    }
}

public struct Istunto: Codable, Identifiable, Hashable, Sendable {
    public let id: String
    public let nimi: String?
    public let tila: String?
    public let konteksti: Konteksti?
    public let pakattu: Bool?
    public let hereilla: Bool?
    public let malli: String?
    public let effort: String?
    public let tyyppi: String?
    public let onMac: Bool?

    public init(id: String, nimi: String? = nil, tila: String? = nil, konteksti: Konteksti? = nil, pakattu: Bool? = nil, hereilla: Bool? = nil, malli: String? = nil, effort: String? = nil, tyyppi: String? = nil, onMac: Bool? = nil) {
        self.id = id
        self.nimi = nimi
        self.tila = tila
        self.konteksti = konteksti
        self.pakattu = pakattu
        self.hereilla = hereilla
        self.malli = malli
        self.effort = effort
        self.tyyppi = tyyppi
        self.onMac = onMac
    }
}

public struct Taulukkorivi: Codable, Hashable, Sendable {
    public let solut: [String: String]

    public init(solut: [String: String]) {
        self.solut = solut
    }

    public var otsikko: String { solut["Asia"] ?? solut["Vika"] ?? solut.values.first ?? "" }
    public var tila: String? { solut["Tila"] }
    public var seuraavaAskel: String? { solut["Seuraava askel"] }
    public var avoin: Bool { !["valmis", "todennettu", "korjattu"].contains((tila ?? "").lowercased()) }
}

public struct SkooppiNakyma: Codable, Hashable, Sendable {
    public let nimi: String
    public let rekisterit: [String]
    public let seuraava: Seuraava?
    public let avoimet: [Taulukkorivi]
    public let viat: [Taulukkorivi]
    public let istunnot: [Istunto]

    public init(nimi: String, rekisterit: [String] = [], seuraava: Seuraava? = nil, avoimet: [Taulukkorivi] = [], viat: [Taulukkorivi] = [], istunnot: [Istunto] = []) {
        self.nimi = nimi
        self.rekisterit = rekisterit
        self.seuraava = seuraava
        self.avoimet = avoimet
        self.viat = viat
        self.istunnot = istunnot
    }
}

public struct VikaKohta: Codable, Identifiable, Hashable, Sendable {
    public let vika: String
    public let tila: String
    public var id: String { vika }

    public var tunnus: String {
        if let r = vika.range(of: #"V-\d+"#, options: .regularExpression) {
            return String(vika[r])
        }
        return ""
    }

    public var selite: String {
        if let r = vika.range(of: #"V-\d+"#, options: .regularExpression) {
            let loppu = vika[r.upperBound...]
            return loppu.trimmingCharacters(in: CharacterSet(charactersIn: " -:()"))
        }
        return vika
    }

    public init(vika: String, tila: String = "avoin") {
        self.vika = vika
        self.tila = tila
    }
}

public struct DiagnostiikkaTila: Codable, Hashable, Sendable {
    public let pyyntoja: Int
    public let virheita: Int
    public let silmukoita: Int
    public let viimeisimmat: [PyyntoTapahtuma]

    public init(pyyntoja: Int = 0, virheita: Int = 0, silmukoita: Int = 0, viimeisimmat: [PyyntoTapahtuma] = []) {
        self.pyyntoja = pyyntoja
        self.virheita = virheita
        self.silmukoita = silmukoita
        self.viimeisimmat = viimeisimmat
    }
}

public struct PyyntoTapahtuma: Codable, Identifiable, Hashable, Sendable {
    public var id: String { "\(aika ?? "")-\(polku ?? "")-\(ms ?? 0)-\(UUID().uuidString.prefix(4))" }
    public let aika: String?
    public let metodi: String?
    public let polku: String?
    public let koodi: Int?
    public let ms: Int?
    public let osoite: String?
    public let katkesi: Bool?
    public let tyyppi: String?
    public let viive: Int?

    public init(aika: String? = nil, metodi: String? = nil, polku: String? = nil, koodi: Int? = nil, ms: Int? = nil, osoite: String? = nil, katkesi: Bool? = nil, tyyppi: String? = nil, viive: Int? = nil) {
        self.aika = aika
        self.metodi = metodi
        self.polku = polku
        self.koodi = koodi
        self.ms = ms
        self.osoite = osoite
        self.katkesi = katkesi
        self.tyyppi = tyyppi
        self.viive = viive
    }
}
