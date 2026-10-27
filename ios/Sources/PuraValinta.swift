import SwiftUI

// Purun mallivalinta (SCOPES-PURA-MALLI 15.10.2026; käyttäjä: "varmistusviestin yhteydessä pitää olla malli valinta.
// Tässä pitää olla myös agy ja paikalliset mallit saatavilla claude agenttien lisäksi"). Vahvistus on arkki, koska
// confirmationDialog ei voi sisältää valitsimia. Purkaja ajaa purkuvaiheen (Claude, siirtaja-sonnet-agentti, agy tai
// palvelimen paikallinen malli); istunnon malli on uuden Claude Code -istunnon malli, Claude tai paikallinen (käyttäjä
// 15.10.2026: "Paikalliset mallit pitää saada myös keskustelun ajoon"; ilman Remote Controlia). Lista tulee palvelulta
// (GET /api/purkajat, scopes/palvelu/purkajat.mjs), joka hyväksyy vain omat tunnuksensa. Ilman listaa (vanha palvelu,
// ei yhteyttä) tarjolla on vain oletus, ja Pura toimii kuten ennen.
// PURA-MALLITON-T6E: scopes/-perheen skooppi puretaan skriptillä ilman mallia, joten sen arkissa ei ole purkajan valintaa (purkaja lähtee nil).

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
    @State private var kayttorajat: KayttorajatKaikki?
    @EnvironmentObject private var asetukset: Asetukset

    private var ryhmat: [(String, [PurkajaVaihtoehto])] {
        let p = (valinnat?.purkajat ?? []).filter { $0.ryhma != "oletus" }
        let ryhmaNimet = ["Claude", "Mac AGY", "OnePlus Linux AGY", "agy", "Paikalliset"]
        return ryhmaNimet.compactMap { r in
            let osat = p.filter { $0.ryhma == r }
            return osat.isEmpty ? nil : (r, osat)
        }
    }
    private var malliRyhmat: [(String, [IstunnonMalli])] {
        let saatavilla = (valinnat?.mallit ?? []).isEmpty ? asetukset.kaikkiMallit : valinnat!.mallit
        let m = saatavilla.filter { asetukset.sallitutMallit.contains($0.nimi) }
        let ryhmaNimet = ["Claude", "Mac AGY", "OnePlus Linux AGY", "agy", "Paikalliset", "Nebius"]
        var tulos = ryhmaNimet.compactMap { r -> (String, [IstunnonMalli])? in
            let osat = m.filter { ($0.ryhma ?? "Claude") == r }
            return osat.isEmpty ? nil : (r, osat)
        }
        let muut = m.filter { !ryhmaNimet.contains($0.ryhma ?? "Claude") }
        if !muut.isEmpty {
            tulos.append(("Muut", muut))
        }
        return tulos
    }
    private var paikallinenValittu: Bool { valinnat?.mallit.first { $0.nimi == malli }?.ryhma == "Paikalliset" }
    private var macAgyValittu: Bool {
        let r = valinnat?.mallit.first { $0.nimi == malli }?.ryhma
        return r == "Mac AGY" || malli.hasPrefix("mac-agy")
    }
    private var oneplusAgyValittu: Bool {
        let r = valinnat?.mallit.first { $0.nimi == malli }?.ryhma
        return r == "OnePlus Linux AGY" || r == "agy" || malli.hasPrefix("agy/")
    }
    private var nebiusValittu: Bool { valinnat?.mallit.first { $0.nimi == malli }?.ryhma == "Nebius" }
    private var oletusPurkaja: String { valinnat?.purkajat.first { $0.ryhma == "oletus" }?.kuvaus ?? "Oletus" }
    private var oletusMalli: String {
        let m = valinnat.flatMap { v in v.mallit.first { $0.nimi == v.oletusMalli }?.kuvaus } ?? asetukset.oletusMalli
        return "Oletus (\(m))"
    }

    private var tehokasMalli: String {
        malli.isEmpty ? (valinnat?.oletusMalli ?? asetukset.oletusMalli) : malli
    }

    private var tehokasPurkaja: String? {
        guard naytaPurkaja else { return nil }
        return purkaja.isEmpty ? (valinnat?.purkajat.first { $0.ryhma == "oletus" }?.tunnus) : purkaja
    }

    private var valittuMalliRaja: Kayttoraja? {
        kayttorajat?.raja(mallille: tehokasMalli)
    }

    private var valittuPurkajaRaja: Kayttoraja? {
        guard let p = tehokasPurkaja, !p.isEmpty else { return nil }
        return kayttorajat?.raja(mallille: p)
    }

    private var kriittinenRaja: Kayttoraja? {
        if let pr = valittuPurkajaRaja, pr.onTayna { return pr }
        if let mr = valittuMalliRaja, mr.onTayna { return mr }
        if let pr = valittuPurkajaRaja, pr.onVaroitus { return pr }
        if let mr = valittuMalliRaja, mr.onVaroitus { return mr }
        return nil
    }

    var body: some View {
        if naytaPurkaja {
            Section {
                Picker("Purkaja", selection: $purkaja) {
                    let oletusRaja = kayttorajat?.raja(mallille: valinnat?.purkajat.first { $0.ryhma == "oletus" }?.tunnus)
                    let oletusTeksti = oletusPurkaja + (oletusRaja?.tiivisTeksti.map { " · \($0)" } ?? "")
                    Text(oletusTeksti).tag("")
                    ForEach(ryhmat, id: \.0) { r in
                        let ryhmanRaja = kayttorajat?.raja(ryhmalle: r.0)
                        let ryhmaOtsikko = r.0 + (ryhmanRaja?.tiivisTeksti.map { " (\($0))" } ?? "")
                        Section(ryhmaOtsikko) {
                            ForEach(r.1, id: \.tunnus) { p in
                                let raja = kayttorajat?.raja(ryhmalle: r.0, malli: p.tunnus) ?? ryhmanRaja
                                let rajaTeksti = raja?.tiivisTeksti.map { " · \($0)" } ?? ""
                                Text("\(p.kuvaus)\(rajaTeksti)").tag(p.tunnus)
                            }
                        }
                    }
                }
                .pickerStyle(.navigationLink)
                .accessibilityIdentifier("pura-purkaja")
            } header: { Text("Purkaja") } footer: {
                VStack(alignment: .leading, spacing: 4) {
                    if let r = valittuPurkajaRaja, let teksti = r.tiivisTeksti {
                        Text("Purkajan kiintiö: \(r.otsikko ?? "Purkaja") (\(teksti))")
                            .font(.caption2)
                            .foregroundStyle(r.onTayna ? Color.red : (r.onVaroitus ? Color.orange : Color.secondary))
                    }
                    Text(latausVirhe.map { "Valintoja ei saatu palvelulta (\($0)): käytössä oletus." }
                         ?? "Lukee rekisterit ja kirjoittaa purkuraportin. agy ja paikalliset mallit näkyvät, kun ne ovat saatavilla.")
                        .accessibilityIdentifier("pura-purkaja-selite")
                }
            }
        } else {
            // Käyttäjä 16.10.2026: "Purascript pitäisi olla oletus purku vaihtoehto" — näkyy purkajan paikalla.
            Section {
                LabeledContent("Purkaja", value: "Purascript (oletus)")
                    .accessibilityIdentifier("pura-purascript")
            } header: { Text("Purkaja") } footer: {
                Text("Scopes-skooppi puretaan skriptillä ilman mallia.")
                    .accessibilityIdentifier("pura-malliton-selite")
            }
        }
        Section {
            Picker("Istunnon malli", selection: $malli) {
                let oletusRaja = kayttorajat?.raja(mallille: valinnat?.oletusMalli ?? asetukset.oletusMalli)
                let oletusTeksti = oletusMalli + (oletusRaja?.tiivisTeksti.map { " · \($0)" } ?? "")
                Text(oletusTeksti).tag("")
                ForEach(malliRyhmat, id: \.0) { r in
                    let ryhmanRaja = kayttorajat?.raja(ryhmalle: r.0)
                    let ryhmaOtsikko = r.0 + (ryhmanRaja?.tiivisTeksti.map { " (\($0))" } ?? "")
                    Section(ryhmaOtsikko) {
                        ForEach(r.1, id: \.nimi) { m in
                            let raja = kayttorajat?.raja(ryhmalle: r.0, malli: m.nimi) ?? ryhmanRaja
                            let rajaTeksti = raja?.tiivisTeksti.map { " · \($0)" } ?? ""
                            Text("\(m.kuvaus)\(rajaTeksti)").tag(m.nimi)
                        }
                    }
                }
            }
            .pickerStyle(.navigationLink)
            .accessibilityIdentifier("pura-malli")
        } header: { Text("Istunto") } footer: {
            VStack(alignment: .leading, spacing: 4) {
                if let r = valittuMalliRaja, let teksti = r.tiivisTeksti {
                    Text("Mallin kiintiö: \(r.otsikko ?? "Istunto") (\(teksti))")
                        .font(.caption2)
                        .foregroundStyle(r.onTayna ? Color.red : (r.onVaroitus ? Color.orange : Color.secondary))
                }
                Text(macAgyValittu
                     ? "Macin agy (macOS) ajaa istuntoa Macilla (itsenäinen kiintiö). Toimii vain scopes- ja infra-skoopeille, avautuu tmuxiin ja näkyy äpin chatissa."
                     : oneplusAgyValittu
                     ? "palvelimen Linux-agy ajaa istuntoa puhelimella (itsenäinen kiintiö). Toimii vain scopes- ja infra-skoopeille, avautuu palvelimen tmuxiin."
                     : nebiusValittu
                     ? "Nebius Token Factory ajaa Claude Code -istuntoa (maksullinen API, avain Asetukset → Nebius). Istunto näkyy vain tämän äpin chatissa, ei Claudessa."
                     : paikallinenValittu
                     ? "Paikallinen malli ajaa Claude Code -istuntoa palvelimella. Istunto näkyy vain tämän äpin chatissa, ei Claudessa, ja vastaukset ovat hitaita."
                     : "Malli, joka tekee työn purun jälkeen. Istunto on Claude Code; paikalliset mallit näkyvät, kun palvelin on päällä.")
                    .accessibilityIdentifier("pura-malli-selite")
            }
        }
        // Irrallinen Task, ei .task: valitsimen avaus (siirtymä) peruisi .taskin, ja peruttu haku jäi virheeksi, jolloin listalla
        // oli vain oletus (käyttäjä 15.10.2026: "uuden skoopin ... mallien valinnoissa ei ole muuta vaihtoehtoja kun default";
        // palvelun loki 13:38Z: puhelimen haku katkesi 3,3 s:n kohdalla eikä uusiutunut).
        .onAppear {
            guard valinnat == nil && latausVirhe == nil && lataus == nil else { return }
            lataus = Task { await lataa(); lataus = nil }
        }
        if let r = kriittinenRaja {
            Section {
                HStack(spacing: Teema.Vali.s) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(r.onTayna ? Color.red : Color.orange)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(r.onTayna ? "Kiintiö 100 % täynnä (\(r.otsikko ?? "malli"))" : "Kiintiö lähes täynnä (\(r.prosenttiTeksti))")
                            .font(.caption.bold())
                            .foregroundStyle(r.onTayna ? Color.red : Color.primary)
                        Text(r.onTayna
                             ? "Valitun mallin käyttöraja on täynnä. Vaihda toiseen malliin ennen purkua tai skoopin luontia."
                             : "Käyttöaste on korkea. Toisen mallin valinta voi olla suositeltavaa.")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 2)
                .accessibilityIdentifier("pura-kayttoraja-varoitus")
            }
        }
    }

    @State private var lataus: Task<Void, Never>?

    private func lataa() async {
        do {
            async let vReq = Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).purkuValinnat()
            async let rReq = Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).kayttorajatKaikki()
            let v = try await vReq
            let r = try? await rReq
            asetukset.paivitaMallit(v.mallit)
            valinnat = v
            kayttorajat = r
            if malli.isEmpty {
                malli = asetukset.oletusMalli
            }
        } catch is CancellationError {
            return
        } catch let e as URLError where e.code == .cancelled {
            return
        } catch {
            latausVirhe = error.localizedDescription
        }
    }
}
