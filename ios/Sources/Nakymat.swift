// Skoopin rivi sivupalkissa (Sivupalkki.swift) → skoopin viestit (DEMO-SCOPES-VALILEHDET); asetukset arkkina
// (DEMO-SCOPES-IOS-LUKU 13.10.2026). Hallintatoiminnot
// (DEMO-SCOPES-HALLINTA 13.10.2026): pura ja pakkaa skoopin näkymässä, uusi skooppi sivupalkin +-painikkeesta;
// jokainen vahvistetaan ennen lähetystä, ja palvelu päättää, saako toiminnon ajaa.
import SwiftUI

struct SkooppiRivi: View {
    let skooppi: SkooppiYhteenveto
    var body: some View {
        VStack(alignment: .leading, spacing: Teema.Vali.xs) {
            Text(skooppi.nimi).font(.headline)
            Tunnus(teksti: skooppi.seuraava ?? "ei seuraavaa pakettia")
                .font(.subheadline).foregroundStyle(skooppi.seuraava == nil ? .secondary : .primary)
            MerkkiRivi {
                Label("\(skooppi.avoimia)", systemImage: "list.bullet")
                Label("\(skooppi.vikoja)", systemImage: "ladybug").foregroundStyle(skooppi.vikoja > 0 ? .orange : .secondary)
                if let k = skooppi.suurinKonteksti { KontekstiMerkki(maara: k).foregroundStyle(Teema.toissijainen) }
            }
            .font(.caption).foregroundStyle(.secondary)
        }
    }
}

struct SkooppiNakymaView: View {
    let nimi: String
    @EnvironmentObject private var asetukset: Asetukset
    @State private var nakyma: SkooppiNakyma?
    @State private var virhe: String?
    @State private var vahvista: Toiminto?
    @State private var puraValinta = false
    @State private var kaynnissa: Toiminto?
    @State private var tulos: ToimintoVastaus?
    @State private var toimintoVirhe: String?
    @State private var hereillaToive: Bool?
    // Globaalit pakkauskytkimet; nil = palvelu ei tunne reittiä (vanha palvelu) tai lataus epäonnistui, jolloin ne piilotetaan.
    @State private var kytkimet: PakkausKytkimet?

    var body: some View {
        // Tiedot ennen toimintoja (DESIGN-SKOOPPINAKYMA U5): ensin seuraava paketti, konteksti ja istunnot, joiden
        // perusteella toiminto valitaan; pitkät rivilistat (avoimet, viat, rekisteri) toimintojen jälkeen.
        List {
            if let virhe { Text(virhe).foregroundStyle(.red) }
            if let n = nakyma {
                Section("Seuraava paketti") {
                    if let s = n.seuraava, let id = s.id {
                        Tunnus(teksti: id).font(.headline).accessibilityIdentifier("seuraava-id")
                        if !s.kuvaus.isEmpty { Text(s.kuvaus).font(.callout) }
                        if let a = s.aloitus { Text(a).font(.caption.monospaced()).foregroundStyle(.secondary) }
                    } else {
                        Text("ei mitään").foregroundStyle(.secondary).accessibilityIdentifier("seuraava-ei")
                    }
                }
                if let k = n.konteksti {
                    Section("Konteksti") {
                        NavigationLink {
                            KontekstiView(nimi: nimi, konteksti: k)
                        } label: {
                            VStack(alignment: .leading, spacing: Teema.Vali.s) {
                                MerkkiRivi {
                                    Text("Ladattu ≈ \(tokenit(k.tokenit))").monospacedDigit()
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    if let m = k.istunnot.compactMap(\.mitattu).max() { KontekstiMerkki(maara: m).foregroundStyle(.secondary) }
                                }
                                OsuusPalkki(osat: k.ryhmat.map(\.tokenit))
                            }
                        }
                        .accessibilityIdentifier("konteksti-avaa")
                    }
                }
                Section("Istunnot (\(n.istunnot.count))") {
                    if n.istunnot.isEmpty { Text("ei käynnissä olevia istuntoja").foregroundStyle(.secondary) }
                    ForEach(n.istunnot) { i in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(i.nimi ?? i.id.prefix(8).description)
                                Text(istunnonTila(i.tila) ?? "").font(.caption).foregroundStyle(.secondary)
                            }
                            Spacer()
                            if let k = i.konteksti { KontekstiMerkki(maara: k.tokenit).foregroundStyle(.secondary) }
                        }
                    }
                }
            }
            Section {
                // Purku avaa mallivalinnan vahvistuksen sijaan (SCOPES-PURA-MALLI, PuraValinta.swift).
                Button("Pura uuteen istuntoon") { puraValinta = true }.accessibilityIdentifier("toiminto-pura")
                // Mallivapaa testipurku (PURA-MALLITON T3): vain scopes/-rekisterin skoopeille, kuten palvelun raja
                // (toiminnot.mjs 'pura-testi'); päärekisteri on skoopin rekisterilistan ensimmäinen.
                if scopesSkooppi {
                    Button("Testipurku (malliton)") { vahvista = .puraTesti }.accessibilityIdentifier("toiminto-pura-testi")
                }
                // Pakkaus ja siirto lähetetään auki olevaan istuntoon: ilman sitä napit ovat lukossa eivätkä odota
                // palvelun hylkäystä (DESIGN-UX-A U4).
                Button("Pakkaa istunto") { vahvista = .pakkaa }
                    .disabled(avoinIstunto == nil)
                    .accessibilityIdentifier("toiminto-pakkaa")
                // Automaattisiirto ja herätyskytkin pakkausnapin alla (käyttäjä 13.10.2026).
                Button("Automaattisiirto") { vahvista = .automaattisiirto }
                    .disabled(avoinIstunto == nil)
                    .accessibilityIdentifier("toiminto-automaattisiirto")
                Toggle("Pidä muisti hereillä", isOn: Binding(get: { hereilla }, set: { p in Task { await kytke(p) } }))
                    .tint(Teema.kytkin)
                    .disabled(avoinIstunto == nil)
                    .accessibilityIdentifier("toiminto-hereilla")
                // Automaattijatko ja Autopack ovat globaaleja eivätkä tarvitse avointa istuntoa (käyttäjä 14.10.2026).
                if let k = kytkimet {
                    Toggle("Automaattijatko", isOn: Binding(get: { k.automaattijatko }, set: { p in Task { await asetaKytkin(.automaattijatko, p) } }))
                        .tint(Teema.kytkin)
                        .accessibilityIdentifier("toiminto-automaattijatko")
                    Toggle("Autopack", isOn: Binding(get: { k.autopack }, set: { p in Task { await asetaKytkin(.autopack, p) } }))
                        .tint(Teema.kytkin)
                        .accessibilityIdentifier("toiminto-autopack")
                    Text("Koskevat kaikkia skooppeja.").font(.caption).foregroundStyle(.secondary)
                        .accessibilityIdentifier("toiminto-kytkimet-selite")
                }
                ForEach(nakyma?.jonossa ?? [], id: \.self) { j in
                    Text("\(j.komento) odottaa vuoroa: lähtee, kun istunto vapautuu.")
                        .font(.caption).foregroundStyle(.secondary).accessibilityIdentifier("toiminto-jonossa")
                }
                if let k = kaynnissa { ProgressView(k == .pura || k == .puraTesti ? "Avataan istuntoa…" : "Lähetetään \(komento(k))…") }
                if let toimintoVirhe { Text(toimintoVirhe).foregroundStyle(.red).accessibilityIdentifier("toiminto-virhe") }
                if let tulos { ToimintoTulos(tulos: tulos, skooppi: nimi) }
            } header: { Text("Toiminnot") } footer: {
                if nakyma != nil && avoinIstunto == nil {
                    Text("Skooppi ei ole auki. Pakkaus, siirto ja herätys tarvitsevat istunnon: avaa se ensin purulla.")
                        .accessibilityIdentifier("toiminto-ei-istuntoa")
                }
            }
            .disabled(kaynnissa != nil)
            if let n = nakyma {
                rivit("Avoimet asiat", n.avoimet.filter(\.avoin))
                rivit("Viat", n.viat.filter(\.avoin))
                Section("Rekisteri") {
                    ForEach(n.rekisterit, id: \.self) { Text($0).font(.caption.monospaced()) }
                }
            }
        }
        .navigationTitle(nimi)
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await lataa() }
        .task { await lataa() }
        .confirmationDialog(vahvista.map { vahvistus($0).kysymys } ?? "",
                            isPresented: Binding(get: { vahvista != nil }, set: { if !$0 { vahvista = nil } }),
                            titleVisibility: .visible, presenting: vahvista) { t in
            Button(vahvistus(t).nappi) { Task { await aja(t) } }.accessibilityIdentifier("vahvista")
        } message: { t in
            Text(vahvistus(t).seuraus).accessibilityIdentifier("vahvista-seuraus")
        }
        .sheet(isPresented: $puraValinta) {
            PuraValintaView(skooppi: nimi) { v in Task { await aja(.pura, valinta: v) } }.environmentObject(asetukset)
        }
    }

    // Vahvistus kertoo, mitä istunnolle tapahtuu, ei mikä komento lähtee (DESIGN-SKOOPPINAKYMA U6). /pakkaa kirjaa
    // tilanteen ja jättää istunnon auki; /automaattisiirto pakkaa ja vaihtaa istunnon (automaattisiirto-taito).
    private func vahvistus(_ t: Toiminto) -> (kysymys: String, seuraus: String, nappi: String) {
        switch t {
        case .pura: ("Avataanko skoopille uusi istunto?",
                     "Uusi Claude-istunto käynnistyy ja lukee skoopin tilanteen rekisteristä.", "Pura")
        case .puraTesti: ("Avataanko skoopille testipurku?",
                          "Uusi Claude-istunto käynnistyy valmiista purkutiedostosta ilman siirtäjämallia (testi).", "Pura")
        case .pakkaa: ("Pakataanko istunto?",
                       "Istunto kirjaa tehdyn työn ja seuraavan paketin skoopin rekisteriin ja jää auki.", "Pakkaa")
        case .automaattisiirto: ("Siirretäänkö työ uuteen istuntoon?",
                                 "Istunto pakataan ja suljetaan, ja uusi istunto jatkaa samasta kohdasta.", "Siirrä")
        case .herata, .herataPois: ("", "", "")
        }
    }

    // Kytkin näyttää skoopin auki olevan istunnon herätystilan; ilman istuntoa se on pois ja lukittu.
    // Sama perhe kuin palvelun raja: päärekisteri scopes/-hakemistossa. Ennen latausta rekisteriä ei tunneta, jolloin nappi on piilossa.
    private var scopesSkooppi: Bool { nakyma?.rekisterit.first?.hasPrefix("scopes/") == true }
    private var avoinIstunto: Istunto? { nakyma?.istunnot.first { $0.pakattu != true } }
    // Jonossa odottava /sa tai /sa pois näyttää jo valitun asennon (V-294).
    private var hereilla: Bool {
        hereillaToive ?? nakyma?.jonossa?.last { $0.komento.hasPrefix("/sa") }.map { $0.komento == "/sa" }
            ?? avoinIstunto?.hereilla ?? false
    }

    // Istunto vastaa /sa:han omalla vuorollaan, joten kytkin pysyy valitussa asennossa, kunnes palvelu näkee
    // vastauksen (enintään minuutti) tai lähetys epäonnistuu. Varatun istunnon komento jää palvelun jonoon, ja
    // asento luetaan silloin jonosta.
    private func kytke(_ paalle: Bool) async {
        hereillaToive = paalle
        await aja(paalle ? .herata : .herataPois)
        for _ in 0..<20 where toimintoVirhe == nil && tulos?.jonossa != true && avoinIstunto?.hereilla != paalle {
            try? await Task.sleep(for: .seconds(3))
            await lataa()
        }
        hereillaToive = nil
    }

    private func komento(_ t: Toiminto) -> String {
        switch t {
        case .pura: "/pura"
        case .puraTesti: "testipurku"
        case .pakkaa: "/pakkaa"
        case .automaattisiirto: "/automaattisiirto"
        case .herata: "/sa"
        case .herataPois: "/sa pois"
        }
    }

    private func aja(_ t: Toiminto, valinta: PuraValinta? = nil) async {
        kaynnissa = t
        tulos = nil
        toimintoVirhe = nil
        do {
            if t == .puraTesti { await Lr.jaettu.synkkaaEnnen() }
            tulos = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).toiminto(t, nimi, valinta: valinta)
            // Pakkaus ja purku laukaisevat rekisterisynkan (LOCALREGISTER V4).
            if t == .pakkaa || t == .pura || t == .puraTesti { Lr.jaettu.laukaise(.toiminto) }
            await lataa()
        } catch {
            toimintoVirhe = error.localizedDescription
        }
        kaynnissa = nil
    }

    private func rivit(_ otsikko: String, _ rivit: [Taulukkorivi]) -> some View {
        Section("\(otsikko) (\(rivit.count))") {
            ForEach(rivit, id: \.self) { r in
                VStack(alignment: .leading, spacing: 2) {
                    Text(r.otsikko)
                    if let a = r.seuraavaAskel, !a.isEmpty { Text(a).font(.caption).foregroundStyle(.secondary) }
                    if let t = r.tila { Text(t).font(.caption2).foregroundStyle(.secondary) }
                }
            }
        }
    }

    private func lataa() async {
        let asiakas = Asiakas(osoite: asetukset.osoite, avain: asetukset.avain)
        do {
            nakyma = try await asiakas.skooppi(nimi)
            virhe = nil
        } catch {
            virhe = error.localizedDescription
        }
        // Kytkinten puute ei ole virhe: vanha palvelu ei tunne reittiä, ja silloin kytkimet jäävät piiloon.
        if let k = try? await asiakas.pakkausKytkimet() { kytkimet = k }
    }

    // Tila päivitetään palvelun vastauksesta, joten kytkin näyttää levylle kirjoitetun arvon eikä vain napautusta.
    private func asetaKytkin(_ kytkin: PakkausKytkin, _ paalle: Bool) async {
        toimintoVirhe = nil
        do {
            kytkimet = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).aseta(kytkin, paalle: paalle)
        } catch {
            toimintoVirhe = error.localizedDescription
            if let k = try? await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).pakkausKytkimet() { kytkimet = k }
        }
    }
}

// Onnistuneen toiminnon tulos: avatun istunnon linkki (pura, uusi) tai pakkauksen kuittaus. "Avaa chat" vie skoopin
// viesteihin äpissä (käyttäjä 14.10.2026); listarivin painikkeet ovat borderless, jotta napautus osuu vain yhteen.
struct ToimintoTulos: View {
    let tulos: ToimintoVastaus
    var skooppi: String? = nil
    var avattu: () -> Void = {}
    @EnvironmentObject private var navigaatio: Navigaatio
    var body: some View {
        VStack(alignment: .leading, spacing: Teema.Vali.xs) {
            if let o = tulos.osoite, let url = URL(string: o) {
                Text("Istunto avattu.").accessibilityIdentifier("toiminto-tulos")
                if let skooppi {
                    Button("Avaa chat") { avattu(); navigaatio.avaaSkooppi(skooppi) }
                        .buttonStyle(.borderless).accessibilityIdentifier("toiminto-avaa-chat")
                }
                Link("Avaa istunto Claudessa", destination: url).buttonStyle(.borderless)
            } else if tulos.tmux != nil {
                Text("Istunto avattu paikallisella mallilla. Se näkyy vain tämän äpin chatissa.").accessibilityIdentifier("toiminto-tulos")
                if let skooppi {
                    Button("Avaa chat") { avattu(); navigaatio.avaaSkooppi(skooppi) }
                        .buttonStyle(.borderless).accessibilityIdentifier("toiminto-avaa-chat")
                }
            } else if let i = tulos.istunto, tulos.jonossa == true {
                Text("Istunto \(i.prefix(8)) on varattu: \(tulos.komento ?? "komento") lähtee, kun se vapautuu.").accessibilityIdentifier("toiminto-tulos")
            } else if let i = tulos.istunto {
                Text("\(tulos.komento ?? "/pakkaa") lähetetty istuntoon \(i.prefix(8)).").accessibilityIdentifier("toiminto-tulos")
            }
        }
    }
}

struct UusiSkooppiView: View {
    @EnvironmentObject private var asetukset: Asetukset
    @Environment(\.dismiss) private var sulje
    @State private var nimi = ""
    @State private var vahvista = false
    @State private var kaynnissa = false
    @State private var tulos: ToimintoVastaus?
    @State private var virhe: String?
    // Olemassa olevat nimet tarkistetaan äpissä ennen lähetystä (DESIGN-UX-A U4); palvelu tarkistaa ne silti.
    @State private var varatut: Set<String> = []
    // Samat valinnat kuin purussa (SCOPES-LISTA-UUSI-VALINNAT), sama muisti.
    @State private var valinnat: PurkuValinnat?
    @State private var latausVirhe: String?
    @AppStorage("pura.purkaja") private var purkaja = ""
    @AppStorage("pura.malli") private var malli = ""

    private var varattu: Bool { varatut.contains(nimi) }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("esim. claude demo koe", text: $nimi)
                        .textInputAutocapitalization(.never).autocorrectionDisabled()
                        .accessibilityIdentifier("uusi-nimi")
                } header: { Text("Skoopin nimi") } footer: {
                    if varattu {
                        Text("Tämän niminen skooppi on jo olemassa.").foregroundStyle(Teema.virhe)
                            .accessibilityIdentifier("uusi-varattu")
                    } else {
                        Text("1–4 sanaa: pienet kirjaimet a–z, numerot ja viivat. Palvelin avaa skoopille uuden istunnon.")
                    }
                }
                PurkuValitsimet(valinnat: $valinnat, latausVirhe: $latausVirhe, purkaja: $purkaja, malli: $malli)
                Section {
                    Button("Luo skooppi") { vahvista = true }
                        .disabled(!kelpaaUudeksi(nimi) || varattu || kaynnissa)
                        .accessibilityIdentifier("uusi-luo")
                    if kaynnissa { ProgressView("Avataan istuntoa…") }
                    if let virhe { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("uusi-virhe") }
                    if let tulos { ToimintoTulos(tulos: tulos, skooppi: nimi) { sulje() } }
                }
            }
            .navigationTitle("Uusi skooppi")
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Sulje") { sulje() } } }
            .task { varatut = Set(((try? await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).skoopit()) ?? []).map(\.nimi)) }
            .confirmationDialog("Luodaanko skooppi \(nimi)?", isPresented: $vahvista, titleVisibility: .visible) {
                Button("Luo") { Task { await luo() } }.accessibilityIdentifier("vahvista")
            }
        }
    }

    private func luo() async {
        kaynnissa = true
        tulos = nil
        virhe = nil
        do {
            tulos = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain)
                .uusi(nimi, valinta: PuraValinta(purkaja: purkaja.isEmpty ? nil : purkaja, malli: malli.isEmpty ? nil : malli))
        } catch {
            virhe = error.localizedDescription
        }
        kaynnissa = false
    }
}

// Asetukset alavalikkoina (NOTIFICATIONS-ASETUKSET 14.10.2026): Yhteys, Ulkoasu, Ilmoitukset ja Tietoja. Arvot pidetään
// tässä, ja Tallenna kirjoittaa ne kerralla; Peru hylkää myös alavalikoissa tehdyt muutokset. Ulkoasu näkyy heti
// valittaessa, joten Peru ja arkin alasveto palauttavat sen avaushetken tilaan (DESIGN-ULKOASU).
struct AsetuksetView: View {
    @EnvironmentObject private var asetukset: Asetukset
    @Environment(\.dismiss) private var sulje
    @State private var osoite = ""
    @State private var avain = ""
    @State private var raja = ilmoitusRaja()
    @State private var paalla = Dictionary(uniqueKeysWithValues: IlmoitusLaji.allCases.map { ($0, ilmoitusPaalla($0)) })
    @State private var ulkoasuAlku = Ulkoasu.jaettu.tila
    @State private var tallennettu = false

    var body: some View {
        NavigationStack {
            List {
                NavigationLink { YhteysAsetukset(osoite: $osoite, avain: $avain).toolbar { tallennaPainike } } label: {
                    Label("Yhteys", systemImage: "network")
                }
                .accessibilityIdentifier("asetukset-yhteys")
                NavigationLink { UlkoasuAsetukset().toolbar { tallennaPainike } } label: {
                    Label("Ulkoasu", systemImage: "paintpalette")
                }
                .accessibilityIdentifier("asetukset-ulkoasu")
                NavigationLink { IlmoitusAsetukset(raja: $raja, paalla: $paalla).toolbar { tallennaPainike } } label: {
                    Label("Ilmoitukset", systemImage: "bell.badge")
                }
                .accessibilityIdentifier("asetukset-ilmoitukset")
                NavigationLink { TietojaAsetukset() } label: {
                    Label("Tietoja", systemImage: "info.circle")
                }
                .accessibilityIdentifier("asetukset-tietoja")
            }
            .navigationTitle("Asetukset")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Peru") { sulje() } }
                tallennaPainike
            }
            .onAppear {
                osoite = asetukset.osoite
                avain = asetukset.avain
            }
        }
        .onDisappear { if !tallennettu { Ulkoasu.jaettu.tila = ulkoasuAlku } }
    }

    // Alavalikoissa paluupainike on Perun paikalla, joten Peru on vain juuressa; Tallenna on joka tasolla.
    private var tallennaPainike: some ToolbarContent {
        ToolbarItem(placement: .confirmationAction) {
            Button("Tallenna") {
                asetukset.osoite = osoite
                asetukset.avain = avain
                tallennaIlmoitusRaja(raja)
                for (l, p) in paalla { tallennaIlmoitusPaalla(l, p) }
                tallennettu = true
                sulje()
            }
        }
    }
}

struct YhteysAsetukset: View {
    @Binding var osoite: String
    @Binding var avain: String
    @State private var reitti = Reitti.Tila.tuntematon

    var body: some View {
        Form {
            Section {
                Text(reittiTeksti).accessibilityIdentifier("reitti")
            } header: { Text("Reitti") } footer: {
                Text("Kodin ulkopuolella äppi käyttää omaa WireGuard-tunneliaan. Asetus haetaan palvelimelta kotiverkossa.")
            }
            Section("Palvelin") {
                // Rivittyy isolla tekstikoolla eikä katkea (KATSELMUS K8); rivinvaihtoa ei tallenneta osoitteeseen.
                TextField("http://osoite:8787", text: Binding(get: { osoite }, set: { osoite = $0.filter { !$0.isNewline } }),
                          axis: .vertical)
                    .lineLimit(1...3)
                    .textInputAutocapitalization(.never).autocorrectionDisabled().keyboardType(.URL)
            }
            Section {
                SecureField("Bearer-avain", text: $avain)
            } header: { Text("Avain") } footer: {
                // Kenttä ei kerro, onko avain tallessa (KATSELMUS K11), joten tila sanotaan tekstinä.
                Text("\(avain.isEmpty ? "Avainta ei ole annettu." : "Avain annettu (\(avain.count) merkkiä).") Palvelimen tiedostosta ~/.config/scopes/avain. Tallennetaan laitteen avainnippuun.")
                    .accessibilityIdentifier("avain-tila")
            }
        }
        .navigationTitle("Yhteys")
        .task { reitti = await Reitti.jaettu.tila }
    }

    private var reittiTeksti: String {
        switch reitti {
        case .koti: return "HOME_SSID"
        case .tunneli: return "Etätunneli (WireGuard)"
        case .eiTunnelia: return Avainnippu.lue("wg") == nil ? "Ei yhteyttä — tunnelin asetus puuttuu (avaa äppi kerran kotiverkossa)" : "Ei yhteyttä — tunneli ei auennut"
        case .tuntematon: return "Ei vielä yhdistetty"
        }
    }
}

// Versio ja allekirjoituksen voimassaolo: ilmainen Apple ID -profiili vanhenee 7 päivässä, ja Macin agentti uusii sen
// (DEMO-SCOPES-UUSINTA). Profiili luetaan äpin embedded.mobileprovisionista; simulaattorissa sitä ei ole.
struct TietojaAsetukset: View {
    var body: some View {
        Form {
            LabeledContent("Versio", value: versio).accessibilityIdentifier("tietoja-versio")
            LabeledContent("Allekirjoitus voimassa", value: voimassa).accessibilityIdentifier("tietoja-allekirjoitus")
        }
        .navigationTitle("Tietoja")
    }

    private var versio: String {
        let i = Bundle.main.infoDictionary
        return "\(i?["CFBundleShortVersionString"] as? String ?? "?") (\(i?["CFBundleVersion"] as? String ?? "?"))"
    }

    private var voimassa: String {
        guard let pvm = profiilinVanheneminen() else { return "ei profiilia (simulaattori)" }
        return pvm.formatted(date: .abbreviated, time: .shortened)
    }
}

func profiilinVanheneminen(_ bundle: Bundle = .main) -> Date? {
    guard let url = bundle.url(forResource: "embedded", withExtension: "mobileprovision"),
          let data = try? Data(contentsOf: url),
          let alku = data.range(of: Data("<?xml".utf8)),
          let loppu = data.range(of: Data("</plist>".utf8), in: alku.lowerBound..<data.endIndex),
          let plist = try? PropertyListSerialization.propertyList(from: data[alku.lowerBound..<loppu.upperBound], format: nil) as? [String: Any]
    else { return nil }
    return plist["ExpirationDate"] as? Date
}

// Skoopin konteksti (SCOPES-INFRA-KONTEKSTI 13.10.2026): tiedostot, jotka skoopin purku ja työ lataavat, ja uusimman
// istunnon ladatut osat (V-400) otsikoittain tokeniosuuksineen; napautus näyttää osan tekstin. Elävien istuntojen mitattu konteksti osa-alueittain. Jaa-painike
// antaa koko kontekstin yhtenä markdownina. Järjestys-valikko lajittelee tiedostot ja niiden osat koon mukaan
// (SCOPES-INFRA-REKISTERIT 14.10.2026); värit seuraavat näkyvää järjestystä, jotta palkki ja rivit täsmäävät.
struct KontekstiView: View {
    let nimi: String
    let konteksti: SkoopinKonteksti
    @AppStorage("kontekstiKoonMukaan") private var koonMukaan = false

    // (alkuperäinen indeksi, alkio): tunnisteet pysyvät samoina järjestyksestä riippumatta.
    private func jarjestetty<T>(_ alkiot: [T], _ koko: (T) -> Int) -> [(n: Int, x: T)] {
        let r = alkiot.enumerated().map { (n: $0.offset, x: $0.element) }
        return koonMukaan ? r.sorted { koko($0.x) > koko($1.x) } : r
    }

    var body: some View {
        let ryhmat = jarjestetty(konteksti.ryhmat, \.tokenit)
        List {
            Section {
                OsuusPalkki(osat: ryhmat.map(\.x.tokenit))
                ForEach(Array(ryhmat.enumerated()), id: \.element.x.id) { v, r in
                    OsuusRivi(nimi: r.x.nimi, alaotsikko: kattoRivi(r.x.polku, r.x.tavut, r.x.raja), maara: r.x.tokenit, kaikki: konteksti.tokenit, vari: osuusVari(v))
                }
            } header: {
                Text("Ladattu ≈ \(tokenit(konteksti.tokenit))")
            } footer: {
                Text("Tiedostojen lisäksi uusimman istunnon ladatut osat latausjärjestyksessä (kehote, ohjeet, listat, muistutukset, purun runko). Luvut ovat tokeneita. ≈ = arvioitu merkkimäärästä (≈ 1,8 merkkiä/token); \(Image(systemName: "brain")) = istunnon mitattu konteksti. Katon prosentti on sama mitta kuin pakkauksen rekisteritarkistuksessa.")
            }
            ForEach(konteksti.istunnot) { i in
                let kaikki = i.mitattu ?? i.osat.reduce(0) { $0 + $1.tokenit }
                Section {
                    OsuusPalkki(osat: i.osat.map(\.tokenit))
                    ForEach(Array(i.osat.enumerated()), id: \.offset) { n, o in
                        OsuusRivi(nimi: o.nimi, maara: o.tokenit, kaikki: kaikki, vari: osuusVari(n))
                    }
                } header: {
                    Text("Istunto \(i.nimi ?? String(i.id.prefix(8)))\(i.mitattu.map { Text(" · \(Image(systemName: "brain")) \(tokenit($0))") } ?? Text(""))")
                } footer: {
                    Text("Yhteismäärä on mitattu istunnon viimeisestä vastauksesta, osat arvioitu transkriptista. Jäännös on työkalumääritykset ja agentin ajattelu, joita transkriptissa ei ole tekstinä.")
                }
                .accessibilityIdentifier("konteksti-istunto")
            }
            ForEach(Array(ryhmat.enumerated()), id: \.element.x.id) { v, r in
                Section {
                    ForEach(jarjestetty(r.x.osat, \.tokenit), id: \.n) { m, o in
                        NavigationLink {
                            KontekstiTeksti(otsikko: o.otsikko, teksti: o.teksti)
                        } label: {
                            OsuusRivi(nimi: o.otsikko, maara: o.tokenit, kaikki: r.x.tokenit, vari: osuusVari(v))
                        }
                        .accessibilityIdentifier("konteksti-osa-\(r.n)-\(m)")
                    }
                } header: {
                    Text("\(r.x.nimi) · \(r.x.polku)")
                }
            }
        }
        .navigationTitle(nimi)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            JarjestysValikko(valinta: $koonMukaan, vaihtoehdot: [(false, "Latausjärjestys"), (true, "Koko")])
                .accessibilityIdentifier("konteksti-jarjestys")
            ShareLink(item: konteksti.markdown(nimi)) { Image(systemName: "square.and.arrow.up") }
                .accessibilityIdentifier("konteksti-jaa")
        }
    }
}

// "polku · 74 % katosta (29 k / 40 k t)"; ilman kattoa pelkkä polku.
func kattoRivi(_ polku: String, _ tavut: Int?, _ raja: Int?) -> String {
    guard let aste = tayttoaste(tavut, raja), let tavut, let raja else { return polku }
    return "\(polku) · \(aste) % katosta (\(tavut / 1000) k / \(raja / 1000) k t)"
}

// Järjestysvalikko työkalupalkkiin: valittu vaihtoehto näkyy valintamerkillä.
struct JarjestysValikko<T: Hashable>: View {
    @Binding var valinta: T
    let vaihtoehdot: [(T, String)]
    var body: some View {
        Menu {
            Picker("Järjestys", selection: $valinta) {
                ForEach(vaihtoehdot, id: \.0) { Text($0.1).tag($0.0) }
            }
        } label: {
            Image(systemName: "arrow.up.arrow.down")
        }
        .accessibilityLabel("Järjestys")
    }
}

struct KontekstiTeksti: View {
    let otsikko: String
    let teksti: String
    var body: some View {
        ScrollView {
            Text(verbatim: teksti)
                .font(.footnote.monospaced())
                .textSelection(.enabled)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .accessibilityIdentifier("konteksti-teksti")
        }
        .navigationTitle(otsikko)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar { ShareLink(item: teksti) { Image(systemName: "square.and.arrow.up") } }
    }
}

// Osuusrivi: nimi, tokenit ja prosentti sekä ohut palkki koko määrästä.
struct OsuusRivi: View {
    let nimi: String
    var alaotsikko: String? = nil
    let maara: Int
    let kaikki: Int
    var vari: Color = .accentColor

    var body: some View {
        VStack(alignment: .leading, spacing: Teema.Vali.xs) {
            HStack(alignment: .firstTextBaseline, spacing: Teema.Vali.s) {
                Circle().fill(vari).frame(width: 8, height: 8)
                Text(nimi).lineLimit(2)
                Spacer()
                Text(tokenit(maara)).monospacedDigit()
                Text(prosentti(maara, kaikki)).monospacedDigit().foregroundStyle(.secondary).frame(minWidth: 44, alignment: .trailing)
            }
            if let alaotsikko { Text(alaotsikko).font(.caption.monospaced()).foregroundStyle(.secondary) }
            GeometryReader { g in
                Capsule().fill(vari.opacity(0.2))
                    .overlay(alignment: .leading) {
                        Capsule().fill(vari).frame(width: kaikki > 0 ? g.size.width * CGFloat(maara) / CGFloat(kaikki) : 0)
                    }
            }
            .frame(height: 4)
        }
        .accessibilityElement(children: .combine)
    }
}

// Pinopalkki: osat vierekkäin osuuksiensa levyisinä, värit samassa järjestyksessä kuin osuusrivit.
struct OsuusPalkki: View {
    let osat: [Int]
    var body: some View {
        let kaikki = max(osat.reduce(0, +), 1)
        GeometryReader { g in
            HStack(spacing: 1) {
                ForEach(Array(osat.enumerated()), id: \.offset) { n, o in
                    Rectangle().fill(osuusVari(n)).frame(width: max(0, g.size.width * CGFloat(o) / CGFloat(kaikki) - 1))
                }
            }
        }
        .frame(height: 10)
        .clipShape(Capsule())
    }
}

private let osuusVarit: [Color] = [.blue, .orange, .green, .purple, .pink, .teal, .indigo, .brown, .gray]
func osuusVari(_ n: Int) -> Color { osuusVarit[n % osuusVarit.count] }

// Kontekstin yksi sanasto (DESIGN-SKOOPPINAKYMA U9): istunnon mitattu konteksti on aina aivokuvake ja "N k" ilman
// ≈-merkkiä; ladatun arvio (tiedostot ja istunnon ladatut osat, V-400) on aina "Ladattu ≈ N k". Sana "tokenia" vain selitteessä.
struct KontekstiMerkki: View {
    let maara: Int
    var body: some View {
        // Luku ei rivity kahdelle riville (K6: "13 / 1 k" = 131 k). Label + fixedSize pudotti luvun pois ja jätti
        // pelkän kuvakkeen (DESIGN-ISOTEKSTI-ajo 14.10.2026), joten kuvake ja luku ovat erikseen.
        HStack(spacing: Teema.Vali.xs) {
            Image(systemName: "brain")
            Text(tokenit(maara)).monospacedDigit().lineLimit(1)
        }
        .fixedSize()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("konteksti \(tokenit(maara))")
    }
}

// Istunnon tila suomeksi (U8, K10); tuntematon tila näytetään sellaisenaan.
func istunnonTila(_ tila: String?) -> String? {
    switch tila {
    case "busy": "Työskentelee"
    case "waiting": "Odottaa vastaustasi"
    case "idle": "Vapaa"
    case "shell": "Ajaa komentoa"
    default: tila
    }
}
