// Paikalliset ilmoitukset (NOTIFICATIONS-PAIKALLINEN, käyttäjä 14.10.2026): äppi hakee /api/skoopit 10 s välein ja
// ilmoittaa muutoksista kuten Claude iOS -äppi. Ilmainen allekirjoitus ei salli APNs-pushia, joten ilmoitus syntyy vain,
// kun äppi on auki tai enintään noin 30 s taustalla (beginBackgroundTask). Ensimmäinen haku on lähtötaso, ei ilmoituksia.
// UI-testit (SCOPES_AVAIN annettu) eivät kysy ilmoituslupaa, ellei SCOPES_ILMOITUKSET=1. SCOPES_KOEILMOITUS="<skooppi>"
// lähettää luvan jälkeen yhden koeilmoituksen, jonka napautus avaa skoopin (NOTIFICATIONS-SIMULAATTORI).
import Foundation

enum IlmoitusLaji: String {
    case odottaa, valmis, konteksti, vika
}

struct Ilmoitus: Equatable {
    let skooppi: String
    let laji: IlmoitusLaji
    let teksti: String
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

// Käyttäjää odottava skooppi: kysymys tai lupa (odottaa) tai valmis vuoro. V-300 erottaa valmiin vuoron omaksi tilakseen,
// joten kaikki muu kuin käsittely ja pakattu lasketaan odottavaksi.
func odottaa(_ s: SkooppiYhteenveto) -> Bool { !["kasittely", "pakattu"].contains(s.tilaNyt) }

// Edellisen ja uuden haun ero ilmoituksiksi. Skooppi, jota edellisessä haussa ei ollut, on uusi: siitä ei ilmoiteta.
func ilmoitukset(edellinen: [SkooppiYhteenveto], uusi: [SkooppiYhteenveto], raja: Int) -> [Ilmoitus] {
    let vanhat = Dictionary(edellinen.map { ($0.nimi, $0) }, uniquingKeysWith: { a, _ in a })
    var r: [Ilmoitus] = []
    for s in uusi {
        guard let v = vanhat[s.nimi] else { continue }
        if s.vikoja > v.vikoja {
            let n = s.vikoja - v.vikoja
            r.append(Ilmoitus(skooppi: s.nimi, laji: .vika, teksti: n == 1 ? "Uusi avoin vika" : "\(n) uutta avointa vikaa"))
        }
        let pakattiin = s.tilaNyt == "pakattu" && v.tilaNyt != "pakattu"
        if pakattiin || (v.seuraava != nil && s.seuraava != v.seuraava) {
            r.append(Ilmoitus(skooppi: s.nimi, laji: .valmis, teksti: pakattiin ? "Skooppi pakattiin" : "Paketti valmis: seuraava \(s.seuraava ?? "ei mitään")"))
        } else if s.tilaNyt == "kysely", v.tilaNyt != "kysely" {
            r.append(Ilmoitus(skooppi: s.nimi, laji: .odottaa, teksti: "Kysely odottaa vastaustasi"))
        } else if odottaa(s), !odottaa(v) {
            r.append(Ilmoitus(skooppi: s.nimi, laji: .odottaa, teksti: "Istunto odottaa sinua"))
        }
        if let k = s.suurinKonteksti, k >= raja, (v.suurinKonteksti ?? 0) < raja {
            r.append(Ilmoitus(skooppi: s.nimi, laji: .konteksti, teksti: "Konteksti \(tokenit(k)) — lähellä rajaa"))
        }
    }
    return r
}

#if canImport(UIKit)
import SwiftUI
import UIKit
import UserNotifications

@MainActor
final class Ilmoittaja: NSObject, UNUserNotificationCenterDelegate {
    static let jaettu = Ilmoittaja()

    // Napautetun ilmoituksen skooppi; App kytkee tämän navigaatioon.
    var avaa: ((String) -> Void)?
    private var edellinen: [SkooppiYhteenveto]?
    private var silmukka: Task<Void, Never>?
    private var tausta = UIBackgroundTaskIdentifier.invalid
    private let ymparisto = ProcessInfo.processInfo.environment
    private var paalla: Bool { ymparisto["SCOPES_AVAIN"] == nil || ymparisto["SCOPES_ILMOITUKSET"] == "1" }

    func kaynnista(_ asetukset: Asetukset) {
        guard paalla else { return }
        let keskus = UNUserNotificationCenter.current()
        keskus.delegate = self
        let koe = ymparisto["SCOPES_KOEILMOITUS"]
        Task {
            let sallittu = (try? await keskus.requestAuthorization(options: [.alert, .sound, .badge])) ?? false
            guard sallittu, let koe else { return }
            try? await Task.sleep(for: .seconds(2))
            laheta(Ilmoitus(skooppi: koe, laji: .odottaa, teksti: "Koeilmoitus"))
        }
        silmukka?.cancel()
        silmukka = Task { [weak self] in
            while !Task.isCancelled {
                await self?.hae(asetukset)
                try? await Task.sleep(for: .seconds(10))
            }
        }
    }

    // Taustalle siirtyessä iOS antaa noin 30 s lisäaikaa; silmukka jatkaa sen ajan ja pysähtyy sitten itsestään.
    func vaihe(_ v: ScenePhase, _ asetukset: Asetukset) {
        guard paalla else { return }
        switch v {
        case .background where tausta == .invalid:
            tausta = UIApplication.shared.beginBackgroundTask(withName: "ilmoitukset") { [weak self] in
                Task { @MainActor in self?.lopetaTausta() }
            }
        case .active:
            lopetaTausta()
            Task { await hae(asetukset) }
        default: break
        }
    }

    private func lopetaTausta() {
        guard tausta != .invalid else { return }
        UIApplication.shared.endBackgroundTask(tausta)
        tausta = .invalid
    }

    private func hae(_ asetukset: Asetukset) async {
        guard asetukset.valmis,
              let uusi = try? await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).skoopit() else { return }
        defer { edellinen = uusi }
        guard let vanha = edellinen else { return }
        for i in ilmoitukset(edellinen: vanha, uusi: uusi, raja: ilmoitusRaja()) where ilmoitusPaalla(i.laji) { laheta(i) }
    }

    // Asetusten koeilmoitus: kysyy luvan, jos sitä ei ole vielä kysytty; napautus avaa juuriskoopin "scopes".
    func koe() async -> Bool {
        let keskus = UNUserNotificationCenter.current()
        keskus.delegate = self
        guard (try? await keskus.requestAuthorization(options: [.alert, .sound, .badge])) == true else { return false }
        laheta(Ilmoitus(skooppi: "scopes", laji: .odottaa, teksti: "Koeilmoitus"))
        return true
    }

    private func laheta(_ i: Ilmoitus) {
        let sisalto = UNMutableNotificationContent()
        sisalto.title = i.skooppi
        sisalto.body = i.teksti
        sisalto.sound = .default
        sisalto.threadIdentifier = i.skooppi
        sisalto.userInfo = ["skooppi": i.skooppi]
        // Sama skooppi ja laji korvaa edellisen ilmoituksen, jotta ilmoituskeskukseen ei kerry toistoja.
        let pyynto = UNNotificationRequest(identifier: "\(i.skooppi)|\(i.laji.rawValue)", content: sisalto, trigger: nil)
        UNUserNotificationCenter.current().add(pyynto)
    }

    // Banneri myös äpin ollessa auki, kuten Claude iOS -äpissä.
    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        [.banner, .list, .sound]
    }

    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        guard let nimi = response.notification.request.content.userInfo["skooppi"] as? String else { return }
        await MainActor.run { avaa?(nimi) }
    }
}

// Asetusten Ilmoitukset-alavalikko (NOTIFICATIONS-ASETUKSET 14.10.2026). Kytkimet ja raja tallennetaan
// juurinäkymän Tallenna-painikkeella kuten muut asetukset, jotta Peru toimii.
struct IlmoitusAsetukset: View {
    @Binding var raja: Int
    @Binding var paalla: [IlmoitusLaji: Bool]
    @Environment(\.scenePhase) private var vaihe
    @State private var lupa = UNAuthorizationStatus.notDetermined
    @State private var koeTulos: String?

    var body: some View {
        Form {
            Section {
                Text(lupaTeksti).accessibilityIdentifier("ilmoituslupa")
                if lupa == .denied {
                    Button("Avaa iOS-asetukset") {
                        if let url = URL(string: UIApplication.openNotificationSettingsURLString) { UIApplication.shared.open(url) }
                    }
                }
            } header: { Text("Lupa") } footer: {
                Text("Ilmoitus syntyy, kun äppi on auki tai enintään noin 30 s taustalla.")
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
                        koeTulos = await Ilmoittaja.jaettu.koe() ? "Lähetetty" : "Ei lupaa ilmoituksiin"
                        await paivitaLupa()
                    }
                }
                .accessibilityIdentifier("koeilmoitus")
                if let koeTulos { Text(koeTulos).accessibilityIdentifier("koeilmoitus-tulos") }
            } footer: { Text("Napautus avaa skoopin scopes.") }
        }
        .navigationTitle("Ilmoitukset")
        .task { await paivitaLupa() }
        .onChange(of: vaihe) { _, v in if v == .active { Task { await paivitaLupa() } } }
    }

    private func paivitaLupa() async {
        lupa = await UNUserNotificationCenter.current().notificationSettings().authorizationStatus
    }

    private var lupaTeksti: String {
        switch lupa {
        case .authorized, .provisional, .ephemeral: return "Sallittu"
        case .denied: return "Estetty iOS-asetuksissa"
        default: return "Ei vielä kysytty"
        }
    }
}
#endif
