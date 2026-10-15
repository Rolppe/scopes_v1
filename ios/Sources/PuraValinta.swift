import SwiftUI

// Purun mallivalinta (SCOPES-PURA-MALLI 15.10.2026; käyttäjä: "varmistusviestin yhteydessä pitää olla malli valinta.
// Tässä pitää olla myös agy ja paikalliset mallit saatavilla claude agenttien lisäksi"). Vahvistus on arkki, koska
// confirmationDialog ei voi sisältää valitsimia. Purkaja ajaa purkuvaiheen (Claude, siirtaja-sonnet-agentti, agy tai
// palvelimen paikallinen malli); istunnon malli on uuden Claude Code -istunnon malli, Claude tai paikallinen (käyttäjä
// 15.10.2026: "Paikalliset mallit pitää saada myös keskustelun ajoon"; ilman Remote Controlia). Lista tulee palvelulta
// (GET /api/purkajat, scopes/palvelu/purkajat.mjs), joka hyväksyy vain omat tunnuksensa. Ilman listaa (vanha palvelu,
// ei yhteyttä) tarjolla on vain oletus, ja Pura toimii kuten ennen.
// PURA-MALLITON-T6E: scopes/-perheen skooppi puretaan skriptillä ilman mallia, joten sen arkissa ei ole purkajan valintaa (purkaja lähtee nil).

struct PurkajaVaihtoehto: Decodable, Hashable {
    let tunnus: String
    let kuvaus: String
    let ryhma: String
}

struct IstunnonMalli: Decodable, Hashable {
    let nimi: String
    let kuvaus: String
    // "Claude" tai "Paikalliset"; puuttuu vanhalta palvelulta (= Claude).
    let ryhma: String?
}

struct PurkuValinnat: Decodable {
    let purkajat: [PurkajaVaihtoehto]
    let mallit: [IstunnonMalli]
    let oletusMalli: String
}

// POST /api/skoopit/<nimi>/pura -runko; tyhjä tai puuttuva kenttä = palvelun oletus.
struct PuraValinta: Encodable, Hashable {
    var purkaja: String?
    var malli: String?
}

struct PuraValintaView: View {
    let skooppi: String
    // Scopes-perhe: purkajan valinta piiloon, selite tilalle.
    var perhe: Bool = false
    let pura: (PuraValinta) -> Void
    @Environment(\.dismiss) private var sulje
    @State private var valinnat: PurkuValinnat?
    @State private var latausVirhe: String?
    // Viimeisin valinta muistetaan (per laite); listalta kadonnut (esim. palvelin pois) palaa oletukseen.
    @AppStorage("pura.purkaja") private var purkaja = ""
    @AppStorage("pura.malli") private var malli = ""

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("Uusi Claude-istunto käynnistyy ja lukee skoopin tilanteen rekisteristä.")
                        .accessibilityIdentifier("pura-valinta-seuraus")
                }
                PurkuValitsimet(valinnat: $valinnat, latausVirhe: $latausVirhe, purkaja: $purkaja, malli: $malli, naytaPurkaja: !perhe)
            }
            .navigationTitle("Pura: \(skooppi)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Peru") { sulje() }.accessibilityIdentifier("pura-peru")
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Pura") {
                        pura(PuraValinta(purkaja: perhe || purkaja.isEmpty ? nil : purkaja, malli: malli.isEmpty ? nil : malli))
                        sulje()
                    }
                    .disabled(valinnat == nil && latausVirhe == nil)
                    .accessibilityIdentifier("vahvista")
                }
            }
        }
    }
}

// Purkajan ja istunnon mallin valitsimet; sama osio purun vahvistuksessa ja uudessa skoopissa (SCOPES-LISTA-UUSI-VALINNAT
// 15.10.2026, käyttäjä: "uuden skoopin aloitus pitää antaa samat valinnat"). Lataa valinnat palvelulta itse.
struct PurkuValitsimet: View {
    @Binding var valinnat: PurkuValinnat?
    @Binding var latausVirhe: String?
    @Binding var purkaja: String
    @Binding var malli: String
    // false = ei purkajan osiota (scopes-perhe, T6E); purkaja pysyy tyhjänä.
    var naytaPurkaja: Bool = true
    @EnvironmentObject private var asetukset: Asetukset

    private var ryhmat: [(String, [PurkajaVaihtoehto])] {
        let p = (valinnat?.purkajat ?? []).filter { $0.ryhma != "oletus" }
        return ["Claude", "agy", "Paikalliset"].compactMap { r in
            let osat = p.filter { $0.ryhma == r }
            return osat.isEmpty ? nil : (r, osat)
        }
    }
    private var malliRyhmat: [(String, [IstunnonMalli])] {
        let m = valinnat?.mallit ?? []
        return ["Claude", "Paikalliset"].compactMap { r in
            let osat = m.filter { ($0.ryhma ?? "Claude") == r }
            return osat.isEmpty ? nil : (r, osat)
        }
    }
    private var paikallinenValittu: Bool { valinnat?.mallit.first { $0.nimi == malli }?.ryhma == "Paikalliset" }
    private var oletusPurkaja: String { valinnat?.purkajat.first { $0.ryhma == "oletus" }?.kuvaus ?? "Oletus" }
    private var oletusMalli: String {
        let m = valinnat.flatMap { v in v.mallit.first { $0.nimi == v.oletusMalli }?.kuvaus } ?? "palvelun oletus"
        return "Oletus (\(m))"
    }

    var body: some View {
        if naytaPurkaja {
            Section {
                Picker("Purkaja", selection: $purkaja) {
                    Text(oletusPurkaja).tag("")
                    ForEach(ryhmat, id: \.0) { r in
                        Section(r.0) { ForEach(r.1, id: \.tunnus) { Text($0.kuvaus).tag($0.tunnus) } }
                    }
                }
                .pickerStyle(.navigationLink)
                .accessibilityIdentifier("pura-purkaja")
            } header: { Text("Purkaja") } footer: {
                Text(latausVirhe.map { "Valintoja ei saatu palvelulta (\($0)): käytössä oletus." }
                     ?? "Lukee rekisterit ja kirjoittaa purkuraportin. agy ja paikalliset mallit näkyvät, kun ne ovat saatavilla.")
                    .accessibilityIdentifier("pura-purkaja-selite")
            }
        } else {
            Section {
                Text("Scopes-skooppi puretaan skriptillä ilman mallia.")
                    .accessibilityIdentifier("pura-malliton-selite")
            }
        }
        Section {
            Picker("Istunnon malli", selection: $malli) {
                Text(oletusMalli).tag("")
                ForEach(malliRyhmat, id: \.0) { r in
                    Section(r.0) { ForEach(r.1, id: \.nimi) { Text($0.kuvaus).tag($0.nimi) } }
                }
            }
            .pickerStyle(.navigationLink)
            .accessibilityIdentifier("pura-malli")
        } header: { Text("Istunto") } footer: {
            Text(paikallinenValittu
                 ? "Paikallinen malli ajaa Claude Code -istuntoa palvelimella. Istunto näkyy vain tämän äpin chatissa, ei Claudessa, ja vastaukset ovat hitaita."
                 : "Malli, joka tekee työn purun jälkeen. Istunto on Claude Code; paikalliset mallit näkyvät, kun palvelin on päällä.")
                .accessibilityIdentifier("pura-malli-selite")
        }
        // Irrallinen Task, ei .task: valitsimen avaus (siirtymä) peruisi .taskin, ja peruttu haku jäi virheeksi, jolloin listalla
        // oli vain oletus (käyttäjä 15.10.2026: "uuden skoopin ... mallien valinnoissa ei ole muuta vaihtoehtoja kun default";
        // palvelun loki 13:38Z: puhelimen haku katkesi 3,3 s:n kohdalla eikä uusiutunut).
        .onAppear {
            guard valinnat == nil && latausVirhe == nil && lataus == nil else { return }
            lataus = Task { await lataa(); lataus = nil }
        }
    }

    @State private var lataus: Task<Void, Never>?

    private func lataa() async {
        do {
            let v = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).purkuValinnat()
            if !v.purkajat.contains(where: { $0.tunnus == purkaja }) { purkaja = "" }
            if !v.mallit.contains(where: { $0.nimi == malli }) { malli = "" }
            valinnat = v
        } catch is CancellationError {
            return
        } catch let e as URLError where e.code == .cancelled {
            return
        } catch {
            purkaja = ""
            malli = ""
            latausVirhe = error.localizedDescription
        }
    }
}
