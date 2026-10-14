// Skoopin rivi sivupalkissa (Sivupalkki.swift) → skoopin viestit (DEMO-SCOPES-VALILEHDET); asetukset arkkina
// (DEMO-SCOPES-IOS-LUKU 13.10.2026). Hallintatoiminnot
// (DEMO-SCOPES-HALLINTA 13.10.2026): pura ja pakkaa skoopin näkymässä, uusi skooppi sivupalkin +-painikkeesta;
// jokainen vahvistetaan ennen lähetystä, ja palvelu päättää, saako toiminnon ajaa.
import SwiftUI

struct SkooppiRivi: View {
    let skooppi: SkooppiYhteenveto
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(skooppi.nimi).font(.headline)
            Text(skooppi.seuraava ?? "ei seuraavaa pakettia")
                .font(.subheadline).foregroundStyle(skooppi.seuraava == nil ? .secondary : .primary)
            HStack(spacing: 12) {
                Label("\(skooppi.avoimia)", systemImage: "list.bullet")
                Label("\(skooppi.vikoja)", systemImage: "ladybug").foregroundStyle(skooppi.vikoja > 0 ? .orange : .secondary)
                if let k = skooppi.suurinKonteksti { KontekstiMerkki(maara: k).foregroundStyle(.blue) }
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
    @State private var kaynnissa: Toiminto?
    @State private var tulos: ToimintoVastaus?
    @State private var toimintoVirhe: String?
    @State private var hereillaToive: Bool?

    var body: some View {
        // Tiedot ennen toimintoja (DESIGN-SKOOPPINAKYMA U5): ensin seuraava paketti, konteksti ja istunnot, joiden
        // perusteella toiminto valitaan; pitkät rivilistat (avoimet, viat, rekisteri) toimintojen jälkeen.
        List {
            if let virhe { Text(virhe).foregroundStyle(.red) }
            if let n = nakyma {
                Section("Seuraava paketti") {
                    if let s = n.seuraava, let id = s.id {
                        Text(id).font(.headline).accessibilityIdentifier("seuraava-id")
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
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text("Tiedostot ≈ \(tokenit(k.tokenit))").monospacedDigit()
                                    Spacer()
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
                Button("Pura uuteen istuntoon") { vahvista = .pura }.accessibilityIdentifier("toiminto-pura")
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
                    .disabled(avoinIstunto == nil)
                    .accessibilityIdentifier("toiminto-hereilla")
                ForEach(nakyma?.jonossa ?? [], id: \.self) { j in
                    Text("\(j.komento) odottaa vuoroa: lähtee, kun istunto vapautuu.")
                        .font(.caption).foregroundStyle(.secondary).accessibilityIdentifier("toiminto-jonossa")
                }
                if let k = kaynnissa { ProgressView(k == .pura ? "Avataan istuntoa…" : "Lähetetään \(komento(k))…") }
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
    }

    // Vahvistus kertoo, mitä istunnolle tapahtuu, ei mikä komento lähtee (DESIGN-SKOOPPINAKYMA U6). /pakkaa kirjaa
    // tilanteen ja jättää istunnon auki; /automaattisiirto pakkaa ja vaihtaa istunnon (automaattisiirto-taito).
    private func vahvistus(_ t: Toiminto) -> (kysymys: String, seuraus: String, nappi: String) {
        switch t {
        case .pura: ("Avataanko skoopille uusi istunto?",
                     "Uusi Claude-istunto käynnistyy ja lukee skoopin tilanteen rekisteristä.", "Pura")
        case .pakkaa: ("Pakataanko istunto?",
                       "Istunto kirjaa tehdyn työn ja seuraavan paketin skoopin rekisteriin ja jää auki.", "Pakkaa")
        case .automaattisiirto: ("Siirretäänkö työ uuteen istuntoon?",
                                 "Istunto pakataan ja suljetaan, ja uusi istunto jatkaa samasta kohdasta.", "Siirrä")
        case .herata, .herataPois: ("", "", "")
        }
    }

    // Kytkin näyttää skoopin auki olevan istunnon herätystilan; ilman istuntoa se on pois ja lukittu.
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
        case .pakkaa: "/pakkaa"
        case .automaattisiirto: "/automaattisiirto"
        case .herata: "/sa"
        case .herataPois: "/sa pois"
        }
    }

    private func aja(_ t: Toiminto) async {
        kaynnissa = t
        tulos = nil
        toimintoVirhe = nil
        do {
            tulos = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).toiminto(t, nimi)
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
        do {
            nakyma = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).skooppi(nimi)
            virhe = nil
        } catch {
            virhe = error.localizedDescription
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
        VStack(alignment: .leading, spacing: 4) {
            if let o = tulos.osoite, let url = URL(string: o) {
                Text("Istunto avattu.").accessibilityIdentifier("toiminto-tulos")
                if let skooppi {
                    Button("Avaa chat") { avattu(); navigaatio.avaaSkooppi(skooppi) }
                        .buttonStyle(.borderless).accessibilityIdentifier("toiminto-avaa-chat")
                }
                Link("Avaa istunto Claudessa", destination: url).buttonStyle(.borderless)
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
            tulos = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).uusi(nimi)
        } catch {
            virhe = error.localizedDescription
        }
        kaynnissa = false
    }
}

struct AsetuksetView: View {
    @EnvironmentObject private var asetukset: Asetukset
    @Environment(\.dismiss) private var sulje
    @State private var osoite = ""
    @State private var avain = ""
    @State private var reitti = Reitti.Tila.tuntematon
    @State private var raja = ilmoitusRaja()

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text(reittiTeksti).accessibilityIdentifier("reitti")
                } header: { Text("Yhteys") } footer: {
                    Text("Kodin ulkopuolella äppi käyttää omaa WireGuard-tunneliaan. Asetus haetaan palvelimelta kotiverkossa.")
                }
                Section("Palvelin") {
                    TextField("http://osoite:8787", text: $osoite)
                        .textInputAutocapitalization(.never).autocorrectionDisabled().keyboardType(.URL)
                }
                Section {
                    SecureField("Bearer-avain", text: $avain)
                } header: { Text("Avain") } footer: {
                    Text("Palvelimen tiedostosta ~/.config/scopes/avain. Tallennetaan laitteen avainnippuun.")
                }
                IlmoitusRajaOsio(raja: $raja)
            }
            .navigationTitle("Asetukset")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Peru") { sulje() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Tallenna") {
                        asetukset.osoite = osoite
                        asetukset.avain = avain
                        tallennaIlmoitusRaja(raja)
                        sulje()
                    }
                }
            }
            .onAppear {
                osoite = asetukset.osoite
                avain = asetukset.avain
            }
            .task { reitti = await Reitti.jaettu.tila }
        }
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

// Skoopin konteksti (SCOPES-INFRA-KONTEKSTI 13.10.2026): tiedostot, jotka skoopin purku ja työ lataavat, otsikoittain
// tokeniosuuksineen; napautus näyttää osan tekstin. Elävien istuntojen mitattu konteksti osa-alueittain. Jaa-painike
// antaa koko kontekstin yhtenä markdownina.
struct KontekstiView: View {
    let nimi: String
    let konteksti: SkoopinKonteksti

    var body: some View {
        List {
            Section {
                OsuusPalkki(osat: konteksti.ryhmat.map(\.tokenit))
                ForEach(Array(konteksti.ryhmat.enumerated()), id: \.element.id) { n, r in
                    OsuusRivi(nimi: r.nimi, alaotsikko: r.polku, maara: r.tokenit, kaikki: konteksti.tokenit, vari: osuusVari(n))
                }
            } header: {
                Text("Tiedostot ≈ \(tokenit(konteksti.tokenit))")
            } footer: {
                Text("Luvut ovat tokeneita. ≈ = arvioitu merkkimäärästä (≈ 1,8 merkkiä/token); \(Image(systemName: "brain")) = istunnon mitattu konteksti.")
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
            ForEach(Array(konteksti.ryhmat.enumerated()), id: \.element.id) { n, r in
                Section {
                    ForEach(Array(r.osat.enumerated()), id: \.offset) { m, o in
                        NavigationLink {
                            KontekstiTeksti(otsikko: o.otsikko, teksti: o.teksti)
                        } label: {
                            OsuusRivi(nimi: o.otsikko, maara: o.tokenit, kaikki: r.tokenit, vari: osuusVari(n))
                        }
                        .accessibilityIdentifier("konteksti-osa-\(n)-\(m)")
                    }
                } header: {
                    Text("\(r.nimi) · \(r.polku)")
                }
            }
        }
        .navigationTitle(nimi)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ShareLink(item: konteksti.markdown(nimi)) { Image(systemName: "square.and.arrow.up") }
                .accessibilityIdentifier("konteksti-jaa")
        }
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
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
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
        .clipShape(RoundedRectangle(cornerRadius: 3))
    }
}

private let osuusVarit: [Color] = [.blue, .orange, .green, .purple, .pink, .teal, .indigo, .brown, .gray]
func osuusVari(_ n: Int) -> Color { osuusVarit[n % osuusVarit.count] }

// Kontekstin yksi sanasto (DESIGN-SKOOPPINAKYMA U9): istunnon mitattu konteksti on aina aivokuvake ja "N k" ilman
// ≈-merkkiä; tiedostojen arvio on aina "Tiedostot ≈ N k". Sana "tokenia" vain selitteessä.
struct KontekstiMerkki: View {
    let maara: Int
    var body: some View {
        Label(tokenit(maara), systemImage: "brain").monospacedDigit()
            .accessibilityLabel("konteksti \(tokenit(maara))")
    }
}

// Istunnon tila suomeksi (U8); tuntematon tila näytetään sellaisenaan.
func istunnonTila(_ tila: String?) -> String? {
    switch tila {
    case "busy": "Työskentelee"
    case "waiting": "Odottaa vastaustasi"
    case "idle": "Vapaa"
    default: tila
    }
}
