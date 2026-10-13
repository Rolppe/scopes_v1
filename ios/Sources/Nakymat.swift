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
                if let k = skooppi.suurinKonteksti {
                    Label(tokenit(k), systemImage: "brain").foregroundStyle(.blue)
                }
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

    var body: some View {
        List {
            if let virhe { Text(virhe).foregroundStyle(.red) }
            Section("Toiminnot") {
                Button("Pura uuteen istuntoon") { vahvista = .pura }.accessibilityIdentifier("toiminto-pura")
                Button("Pakkaa istunto") { vahvista = .pakkaa }.accessibilityIdentifier("toiminto-pakkaa")
                if kaynnissa != nil { ProgressView(kaynnissa == .pura ? "Avataan istuntoa…" : "Lähetetään /pakkaa…") }
                if let toimintoVirhe { Text(toimintoVirhe).foregroundStyle(.red).accessibilityIdentifier("toiminto-virhe") }
                if let tulos { ToimintoTulos(tulos: tulos) }
            }
            .disabled(kaynnissa != nil)
            if let n = nakyma {
                Section("Seuraava paketti") {
                    if let s = n.seuraava, let id = s.id {
                        Text(id).font(.headline).accessibilityIdentifier("seuraava-id")
                        if !s.kuvaus.isEmpty { Text(s.kuvaus).font(.callout) }
                        if let a = s.aloitus { Text(a).font(.caption.monospaced()).foregroundStyle(.secondary) }
                    } else {
                        Text("ei mitään").foregroundStyle(.secondary)
                    }
                }
                Section("Istunnot (\(n.istunnot.count))") {
                    if n.istunnot.isEmpty { Text("ei käynnissä olevia istuntoja").foregroundStyle(.secondary) }
                    ForEach(n.istunnot) { i in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(i.nimi ?? i.id.prefix(8).description)
                                Text(i.tila ?? "").font(.caption).foregroundStyle(.secondary)
                            }
                            Spacer()
                            Text(i.konteksti.map { tokenit($0.tokenit) } ?? "–").monospacedDigit()
                        }
                    }
                }
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
        .confirmationDialog(vahvista == .pura ? "Avataanko skoopille uusi istunto (/pura)?" : "Lähetetäänkö skoopin istuntoon /pakkaa?",
                            isPresented: Binding(get: { vahvista != nil }, set: { if !$0 { vahvista = nil } }),
                            titleVisibility: .visible, presenting: vahvista) { t in
            Button(t == .pura ? "Pura" : "Pakkaa") { Task { await aja(t) } }.accessibilityIdentifier("vahvista")
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

// Onnistuneen toiminnon tulos: avatun istunnon linkki (pura, uusi) tai pakkauksen kuittaus.
struct ToimintoTulos: View {
    let tulos: ToimintoVastaus
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if let o = tulos.osoite, let url = URL(string: o) {
                Text("Istunto avattu.").accessibilityIdentifier("toiminto-tulos")
                Link("Avaa istunto Claudessa", destination: url)
            } else if let i = tulos.istunto {
                Text("/pakkaa lähetetty istuntoon \(i.prefix(8)).").accessibilityIdentifier("toiminto-tulos")
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

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("esim. claude demo koe", text: $nimi)
                        .textInputAutocapitalization(.never).autocorrectionDisabled()
                        .accessibilityIdentifier("uusi-nimi")
                } header: { Text("Skoopin nimi") } footer: {
                    Text("1–4 sanaa: pienet kirjaimet a–z, numerot ja viivat. Palvelin avaa istunnon, joka ajaa /pura uusi <nimi>.")
                }
                Section {
                    Button("Luo skooppi") { vahvista = true }
                        .disabled(!kelpaaUudeksi(nimi) || kaynnissa)
                        .accessibilityIdentifier("uusi-luo")
                    if kaynnissa { ProgressView("Avataan istuntoa…") }
                    if let virhe { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("uusi-virhe") }
                    if let tulos { ToimintoTulos(tulos: tulos) }
                }
            }
            .navigationTitle("Uusi skooppi")
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Sulje") { sulje() } } }
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

    var body: some View {
        NavigationStack {
            Form {
                Section("Palvelin") {
                    TextField("http://osoite:8787", text: $osoite)
                        .textInputAutocapitalization(.never).autocorrectionDisabled().keyboardType(.URL)
                }
                Section {
                    SecureField("Bearer-avain", text: $avain)
                } header: { Text("Avain") } footer: {
                    Text("Palvelimen tiedostosta ~/.config/scopes/avain. Tallennetaan laitteen avainnippuun.")
                }
            }
            .navigationTitle("Asetukset")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Peru") { sulje() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Tallenna") {
                        asetukset.osoite = osoite
                        asetukset.avain = avain
                        sulje()
                    }
                }
            }
            .onAppear {
                osoite = asetukset.osoite
                avain = asetukset.avain
            }
        }
    }
}
