// Rekisterisynkan koenäkymät (LOCALREGISTER-APPI 14.10.2026): tila ja käsisynkka, rekisterit riveittäin, rivin
// muokkaus ja ristiriidan ratkaisu (K4: "kysytään käyttäjältä tilanteessa"). Avautuu Infra-näkymästä. Muokkaus
// koskee vain kaksoiskappaletta; alkuperäiset rekisterit ja git pysyvät totuutena (MUOTO §7).
import SwiftUI

struct LrYhteenveto: View {
    @ObservedObject private var lr = Lr.jaettu

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Paikallinen rekisteri (koe)").font(Teema.Teksti.nimi)
            Text(lr.ristiriidat.isEmpty ? "\(lr.yksikkoja) riviä" : "\(lr.ristiriidat.count) ristiriitaa odottaa")
                .font(.caption)
                .foregroundStyle(lr.ristiriidat.isEmpty ? Color.secondary : Color.orange)
        }
    }
}

struct LrView: View {
    @ObservedObject private var lr = Lr.jaettu
    @State private var haku = ""

    var body: some View {
        List {
            Section("Synkka") {
                LabeledContent("Laite", value: lr.laite)
                LabeledContent("Kopio", value: "\(lr.yksikkoja) riviä, \(lr.rekisterit.count) rekisteriä")
                    .accessibilityIdentifier("lr-maara")
                if lr.kaynnissa {
                    Label("Synkataan…", systemImage: "arrow.triangle.2.circlepath").accessibilityIdentifier("lr-kaynnissa")
                } else if let tulos = lr.tulos, let aika = lr.viimeisin {
                    Text("\(aika.formatted(date: .omitted, time: .shortened)): \(tulos)").accessibilityIdentifier("lr-tulos")
                } else {
                    Text("Ei synkattu").foregroundStyle(.secondary).accessibilityIdentifier("lr-tulos")
                }
                if let virhe = lr.virhe { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("lr-virhe") }
                if lr.muutoksia { Text("Paikallisia muutoksia lähettämättä").foregroundStyle(.secondary) }
                Button { Task { await lr.synkkaa() } } label: { Label("Synkkaa nyt", systemImage: "arrow.triangle.2.circlepath") }
                    .disabled(lr.kaynnissa)
                    .accessibilityIdentifier("lr-synkkaa")
            }
            let riidat = lr.ristiriidat
            if !riidat.isEmpty {
                Section("Ristiriidat (\(riidat.count))") {
                    ForEach(riidat) { y in
                        NavigationLink { LrRistiriitaView(polku: y.rekisteri, id: y.id) } label: {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(y.rekisteri).font(.caption).foregroundStyle(.secondary)
                                Text(LrTeksti.nakyva(y.sisalto)).lineLimit(2)
                            }
                        }
                        .accessibilityIdentifier("lr-ristiriita-\(y.id)")
                    }
                }
            }
            Section("Rekisterit") {
                ForEach(polut, id: \.self) { p in
                    NavigationLink { LrRekisteriView(polku: p) } label: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(p)
                            Text("\(lr.rivit(p).count) riviä").font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    .accessibilityIdentifier("lr-rekisteri-\(p)")
                }
            }
        }
        .searchable(text: $haku, prompt: "Hae rekistereistä")
        .navigationTitle("Paikallinen rekisteri")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await lr.synkkaa() }
    }

    private var polut: [String] {
        lr.rekisterit.values.filter { !$0.meta.poistettu }.map(\.meta.rekisteri)
            .filter { haku.isEmpty || $0.localizedCaseInsensitiveContains(haku) }
            .sorted(by: LrLaskenta.ennen)
    }
}

enum LrTeksti {
    // Rivin teksti ilman perässä olevia rivinvaihtoja, jotka erottavat sen seuraavasta (lr.mjs pilko).
    static func nakyva(_ s: String) -> String {
        var t = s
        while t.hasSuffix("\n") { t.removeLast() }
        return t
    }

    // Muokattu teksti saa alkuperäisen rivinvaihtohännän takaisin, jottei rekisterin tulostus liimaa rivejä yhteen.
    static func talteen(_ muokattu: String, alkuperainen: String) -> String {
        nakyva(muokattu) + String(alkuperainen.dropFirst(nakyva(alkuperainen).count))
    }
}

struct LrRekisteriView: View {
    let polku: String
    @ObservedObject private var lr = Lr.jaettu
    @State private var muokattava: LrYksikko?

    var body: some View {
        List(lr.rivit(polku)) { y in
            Button { muokattava = y } label: {
                HStack(alignment: .top) {
                    Text(LrTeksti.nakyva(y.sisalto))
                        .font(.callout)
                        .foregroundStyle(y.poistettu ? Color.secondary : Color.primary)
                        .strikethrough(y.poistettu)
                        .lineLimit(8)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    if y.riidassa { Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(.orange) }
                }
            }
            .accessibilityIdentifier("lr-yksikko-\(y.id)")
        }
        .listStyle(.plain)
        .navigationTitle((polku as NSString).lastPathComponent)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $muokattava) { y in
            if y.riidassa {
                NavigationStack { LrRistiriitaView(polku: y.rekisteri, id: y.id) }
            } else {
                LrMuokkausView(yksikko: y, alku: y.sisalto)
            }
        }
    }
}

struct LrMuokkausView: View {
    let yksikko: LrYksikko
    let alku: String
    @Environment(\.dismiss) private var sulje
    @State private var teksti = ""
    @FocusState private var fokus: Bool

    var body: some View {
        NavigationStack {
            TextEditor(text: $teksti)
                .font(.callout.monospaced())
                .padding(.horizontal, Teema.Vali.m)
                .focused($fokus)
                .accessibilityIdentifier("lr-teksti")
                .navigationTitle(yksikko.riidassa ? "Yhdistä versiot" : "Muokkaa riviä")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Peruuta") { sulje() } }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Tallenna") {
                            Lr.jaettu.muokkaa(yksikko.rekisteri, yksikko.id, sisalto: LrTeksti.talteen(teksti, alkuperainen: yksikko.sisalto))
                            sulje()
                        }
                        .accessibilityIdentifier("lr-tallenna")
                    }
                    ToolbarItem(placement: .bottomBar) {
                        Button("Poista rivi", role: .destructive) {
                            Lr.jaettu.muokkaa(yksikko.rekisteri, yksikko.id, sisalto: yksikko.sisalto, poistettu: true)
                            sulje()
                        }
                        .accessibilityIdentifier("lr-poista")
                    }
                }
        }
        .onAppear {
            teksti = LrTeksti.nakyva(alku)
            fokus = true
        }
    }
}

// Ristiriita: rivin versiot rinnakkain. Valinta tai yhdistelmä saa version, joka on ≥ kaikkia, joten se korvaa
// riidan molemmilla laitteilla seuraavassa synkassa (MUOTO §3).
struct LrRistiriitaView: View {
    let polku: String
    let id: String
    @ObservedObject private var lr = Lr.jaettu
    @State private var yhdista = false

    var body: some View {
        List {
            if let y = lr.rekisterit[polku]?.yksikot[id], let sisaret = y.rinnakkaiset, !sisaret.isEmpty {
                let versiot = [LrSisar(sisalto: y.sisalto, poistettu: y.poistettu, versio: y.versio, muutettu: y.muutettu, muuttaja: y.muuttaja)] + sisaret
                Section { Text(polku).font(.caption).foregroundStyle(.secondary) } footer: {
                    Text("Riviä muutettiin kahdella laitteella samaan aikaan. Valitse säilytettävä versio tai yhdistä ne.")
                }
                ForEach(Array(versiot.enumerated()), id: \.offset) { _, v in
                    Section(otsikko(v)) {
                        Text(v.poistettu ? "(rivi poistettu)" : LrTeksti.nakyva(v.sisalto)).font(.callout)
                        Button("Säilytä tämä") { lr.muokkaa(polku, id, sisalto: v.sisalto, poistettu: v.poistettu) }
                            .accessibilityIdentifier("lr-valitse-\(v.muuttaja ?? "?")")
                    }
                }
                Section {
                    Button("Yhdistä käsin…") { yhdista = true }.accessibilityIdentifier("lr-yhdista")
                }
            } else {
                Label("Ristiriita ratkaistu", systemImage: "checkmark.circle").accessibilityIdentifier("lr-ratkaistu")
            }
        }
        .navigationTitle("Ristiriita")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $yhdista) {
            if let y = lr.rekisterit[polku]?.yksikot[id] {
                LrMuokkausView(yksikko: y, alku: ([y.sisalto] + (y.rinnakkaiset ?? []).map(\.sisalto)).map(LrTeksti.nakyva).joined(separator: "\n"))
            }
        }
    }

    private func otsikko(_ v: LrSisar) -> String {
        let kuka = v.muuttaja == lr.laite ? "Tämä laite" : (v.muuttaja ?? "tuntematon")
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let milloin = v.muutettu.flatMap { iso.date(from: $0) ?? ISO8601DateFormatter().date(from: $0) }?
            .formatted(date: .abbreviated, time: .shortened)
        return [kuka, milloin].compactMap { $0 }.joined(separator: " · ")
    }
}
