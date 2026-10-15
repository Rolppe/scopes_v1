// Ilmoitukset (NOTIFICATIONS-HA-PUSH, käyttäjä 15.10.2026): palvelimen vahti (scopes/notifications/vahti.mjs) vertaa
// skooppien tilaa 10 s välein ja lähettää muutokset Home Assistant -äpin push-ilmoituksina, jotka tulevat myös lukitulle
// näytölle. Äpin omat paikalliset ilmoitukset (NOTIFICATIONS-PAIKALLINEN 14.10.2026) poistettiin: iOS pysäyttää äpin
// noin 30 s:ssa taustalla, eikä ilmainen allekirjoitus salli APNs-pushia. Napautus avaa skoopin URL:lla
// skoopit://skooppi/<nimi> (Juuri.swift onOpenURL). Tämä tiedosto pitää lajit, rajan ja asetusnäkymän; arvot
// tallentuvat palvelimelle (GET/POST /api/ilmoitukset) ja paikallisesti välimuistiksi.
import Foundation

enum IlmoitusLaji: String {
    case odottaa, valmis, konteksti, vika
}

// Kontekstirajan oletus: pienimmät mallikohtaiset pakkausrajat ovat 71–72 k ja suurin 220 k (rd-trigger.sh ctx_limit),
// joten 100 k varoittaa ennen useimpia rajoja. UserDefaults-avain "ilmoitusRaja" ohittaa.
let oletusIlmoitusRaja = 100_000
// Asetusten säätö (NOTIFICATIONS-SIMULAATTORI) 25 k:n askelin; 0 tai puuttuva arvo on oletus.
let ilmoitusRajaAlue = 50_000...250_000

func ilmoitusRaja(_ d: UserDefaults = .standard) -> Int {
    let r = d.integer(forKey: "ilmoitusRaja")
    return r > 0 ? r : oletusIlmoitusRaja
}

func tallennaIlmoitusRaja(_ r: Int, _ d: UserDefaults = .standard) { d.set(r, forKey: "ilmoitusRaja") }

// Lajikohtainen kytkin (NOTIFICATIONS-ASETUKSET 14.10.2026): oletus päällä; UserDefaults-avain "ilmoitus-<laji>".
extension IlmoitusLaji: CaseIterable {
    var nimi: String {
        switch self {
        case .odottaa: return "Istunto odottaa sinua"
        case .valmis: return "Paketti valmis tai pakattu"
        case .konteksti: return "Konteksti lähellä rajaa"
        case .vika: return "Uusi avoin vika"
        }
    }
}

func ilmoitusPaalla(_ l: IlmoitusLaji, _ d: UserDefaults = .standard) -> Bool {
    d.object(forKey: "ilmoitus-\(l.rawValue)") as? Bool ?? true
}

func tallennaIlmoitusPaalla(_ l: IlmoitusLaji, _ p: Bool, _ d: UserDefaults = .standard) { d.set(p, forKey: "ilmoitus-\(l.rawValue)") }

// Palvelimen vahdin asetukset (GET/POST /api/ilmoitukset): lajit nimillä odottaa, valmis, konteksti, vika.
struct IlmoitusArvot: Codable, Equatable {
    var raja: Int
    var lajit: [String: Bool]

    init(raja: Int, paalla: [IlmoitusLaji: Bool]) {
        self.raja = raja
        lajit = Dictionary(uniqueKeysWithValues: IlmoitusLaji.allCases.map { ($0.rawValue, paalla[$0] ?? true) })
    }

    var paalla: [IlmoitusLaji: Bool] {
        Dictionary(uniqueKeysWithValues: IlmoitusLaji.allCases.map { ($0, lajit[$0.rawValue] ?? true) })
    }
}

struct KoeVastaus: Decodable { let lahetetty: Bool }

#if canImport(UIKit)
import SwiftUI
import UIKit

// Asetusten Ilmoitukset-alavalikko (NOTIFICATIONS-ASETUKSET 14.10.2026). Kytkimet ja raja tallennetaan
// juurinäkymän Tallenna-painikkeella kuten muut asetukset, jotta Peru toimii; Tallenna vie ne myös palvelimelle.
struct IlmoitusAsetukset: View {
    @Binding var raja: Int
    @Binding var paalla: [IlmoitusLaji: Bool]
    @EnvironmentObject private var asetukset: Asetukset
    @State private var koeTulos: String?

    var body: some View {
        Form {
            Section {
                Text("Home Assistant -äppi").accessibilityIdentifier("ilmoituskanava")
            } header: { Text("Kanava") } footer: {
                Text("Palvelin lähettää ilmoitukset Home Assistant -äpin kautta, joten ne tulevat myös lukitulle näytölle. Napautus avaa skoopin tässä äpissä.")
            }
            Section("Ilmoita") {
                ForEach(IlmoitusLaji.allCases, id: \.self) { l in
                    Toggle(l.nimi, isOn: Binding(get: { paalla[l] ?? true }, set: { paalla[l] = $0 }))
                        .tint(Teema.kytkin)
                        .accessibilityIdentifier("ilmoitus-\(l.rawValue)")
                }
            }
            Section {
                // Lyhyt selite mahtuu riville isollakin tekstillä (KATSELMUS K8: "Konteksti ≥ / 100 k"); otsikko kertoo lajin.
                Stepper(value: $raja, in: ilmoitusRajaAlue, step: 25_000) {
                    Text(verbatim: "≥ \(tokenit(raja))").monospacedDigit().lineLimit(1)
                }
                    .accessibilityLabel("Konteksti ≥ \(tokenit(raja))")
                    .accessibilityIdentifier("ilmoitusraja")
                    .disabled(paalla[.konteksti] == false)
            } header: { Text("Kontekstiraja") } footer: {
                Text("Ilmoitus, kun skoopin istunnon konteksti ylittää rajan. Oletus \(tokenit(oletusIlmoitusRaja)).")
            }
            Section {
                Button("Lähetä koeilmoitus") {
                    Task {
                        do {
                            _ = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).koeIlmoitus()
                            koeTulos = "Lähetetty"
                        } catch { koeTulos = "Ei lähetetty: \(error.localizedDescription)" }
                    }
                }
                .accessibilityIdentifier("koeilmoitus")
                if let koeTulos { Text(koeTulos).accessibilityIdentifier("koeilmoitus-tulos") }
            } footer: { Text("Napautus avaa skoopin scopes.") }
        }
        .navigationTitle("Ilmoitukset")
    }
}
#endif
