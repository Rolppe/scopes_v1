// Chat ja skoopin viestit (DEMO-SCOPES-VALILEHDET 13.10.2026). Chat: palvelin ajaa valitun mallin tai oman
// agentin ilman kontekstinhallintaa; jatko kulkee keskustelun tunnuksella; vastaus suoratoistona. Skoopin viestit: käynnissä olevan
// istunnon keskustelu; jos skooppi ei ole auki tai se on pakattu, viesti ja sen alla Pura-painike, joka purkaa ja avaa
// uuden istunnon viestit samaan näkymään (pakkaus ja automaattisiirto eivät vaihda äpin keskustelua, käyttäjä 13.10.2026).
import SwiftUI
import UIKit

struct Viestikupla: View {
    let viesti: Viesti
    // Skoopin viesteissä auki olevaan monivalintaan voi vastata kortista (palvelu sulkee dialogin ensin).
    var vastaa: ((String) -> Void)? = nil
    var sulje: (() -> Void)? = nil
    // Kortin kirjoituskenttä pyytää listaa vierittämään kortin näkyviin näppäimistön yläpuolelle.
    var nayta: (() -> Void)? = nil
    var body: some View {
        if viesti.tyokalu {
            // Työkalukutsu: yksi himmeä rivi kuplien välissä (komento tai muokattu tiedosto).
            Text(verbatim: viesti.teksti)
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .padding(.leading, 10)
                .accessibilityIdentifier("tyokalu-rivi")
        } else if let kysymykset = viesti.kysymykset, !kysymykset.isEmpty {
            // Vastattu tai ohitettu kysymys katoaa (käyttäjä 13.10.2026); vastaus jää omaksi kuplakseen.
            if viesti.vastattu != true { KysymysKortti(kysymykset: kysymykset, vastaa: vastaa, sulje: sulje, nayta: nayta) }
        } else {
            kupla
        }
    }

    private var kupla: some View {
        HStack {
            if viesti.omaViesti { Spacer(minLength: 40) }
            Text(LocalizedStringKey(viesti.teksti))
                .textSelection(.enabled)
                .padding(10)
                .background(viesti.omaViesti ? Color.accentColor.opacity(0.18) : Color(.secondarySystemBackground),
                            in: RoundedRectangle(cornerRadius: 14))
            if !viesti.omaViesti { Spacer(minLength: 40) }
        }
    }
}

// Monivalinta korttina kuten Claude-äpissä: otsikko, kysymys ja vaihtoehdot kuvauksineen sekä Muu-kenttä.
// Yksi kysymys ilman monivalintaa lähtee napautuksesta; muuten valinnat kootaan ja lähetetään Lähetä-napista.
struct KysymysKortti: View {
    let kysymykset: [Kysymys]
    let vastaa: ((String) -> Void)?
    var sulje: (() -> Void)? = nil
    var nayta: (() -> Void)? = nil
    @State private var valinnat: [Int: Set<Int>] = [:]
    // Oma vastaus kysymyskohtaisesti (käyttäjä 13.10.2026): kahden kysymyksen kortissa kentän valinta ei saa tyhjentää toista.
    @State private var muut: [Int: String] = [:]
    @FocusState private var fokus: Int?
    @State private var lahetetty = false

    private var heti: Bool { kysymykset.count == 1 && !kysymykset[0].monivalinta }
    private func muuTeksti(_ q: Int) -> String { (muut[q] ?? "").trimmingCharacters(in: .whitespacesAndNewlines) }
    private var tyhja: Bool { kysymykset.indices.allSatisfy { (valinnat[$0] ?? []).isEmpty && muuTeksti($0).isEmpty } }

    // Ulkoasu Claude iOS -äpin kortin mukaan (käyttäjä 13.10.2026, kuvakaappaus): iso kysymys, vaihtoehdot ilman numeroita
    // ohuin erottimin, Muu-rivi pelkkänä kenttänä, vaalea Lähetä-kapseli oikealla; ei otsikkosirua eikä tilariviä.
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(kysymykset.enumerated()), id: \.offset) { q, k in
                if q > 0 { Divider().padding(.vertical, 20) }
                HStack(alignment: .top, spacing: 12) {
                    Text(verbatim: k.kysymys).font(.title2.weight(.medium))
                        .fixedSize(horizontal: false, vertical: true).textSelection(.enabled)
                    Spacer(minLength: 0)
                    // Sulku kuten Claude-äpissä (käyttäjä 13.10.2026): X kortin yläkulmassa hylkää kysymyksen.
                    if q == 0, let sulje {
                        Button { lahetetty = true; fokus = nil; sulje() } label: {
                            Image(systemName: "xmark").font(.body.weight(.medium)).foregroundStyle(.primary)
                                .frame(width: 44, height: 44)
                                .background(Color(.systemGray4), in: Circle())
                        }
                        .buttonStyle(.plain)
                        .disabled(lahetetty)
                        .accessibilityLabel("Sulje kysymys")
                        .accessibilityIdentifier("kysymys-sulje")
                    }
                }
                .padding(.bottom, 16)
                ForEach(Array(k.vaihtoehdot.enumerated()), id: \.offset) { i, v in
                    Button { valitse(q, i) } label: { vaihtoehto(k, q, i, v) }
                        .buttonStyle(.plain)
                        .disabled(vastaa == nil || lahetetty)
                        .accessibilityIdentifier("kysymys-vaihtoehto-\(q)-\(i)")
                    if i < k.vaihtoehdot.count - 1 || vastaa != nil { Divider() }
                }
                if vastaa != nil {
                    // Ei rivirajaa (käyttäjä 13.10.2026): kenttä ja kortti kasvavat kirjoittaessa, vanha teksti ei piiloudu.
                    TextField("Muu", text: Binding(get: { muut[q] ?? "" }, set: { muut[q] = $0 }), axis: .vertical)
                        .font(.body)
                        .padding(.vertical, 18)
                        .focused($fokus, equals: q)
                        .disabled(lahetetty)
                        .accessibilityIdentifier("kysymys-muu-\(q)")
                }
            }
            if let vastaa {
                HStack {
                    Spacer()
                    Button { laheta(vastaa) } label: {
                        // Väri Claude-äpin Submit-napista (kuvakaappaus 13.10.2026): vaaleanharmaa kapseli, tummanharmaa teksti.
                        Text("Lähetä").font(.body.weight(.semibold)).foregroundStyle(Color(white: 0.24))
                            .padding(.horizontal, 26).padding(.vertical, 12)
                            .background(Color(white: lahetetty || tyhja ? 0.80 : 0.92), in: Capsule())
                    }
                    .buttonStyle(.plain)
                    .disabled(lahetetty || tyhja)
                    .accessibilityIdentifier("kysymys-laheta")
                }
                .padding(.top, 8)
            }
        }
        // Oman vastauksen kentän valinta poistaa saman kysymyksen valinnat (käyttäjä 13.10.2026: valinnasta, ei kirjoituksesta).
        // Kentän valinta ja kirjoitus nostavat kortin näppäimistön yläpuolelle (käyttäjä 13.10.2026); viive odottaa näppäimistöä.
        .onChange(of: fokus) {
            if let q = fokus {
                valinnat[q] = []
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { nayta?() }
            }
        }
        .onChange(of: muut) { if fokus != nil { nayta?() } }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray5), in: RoundedRectangle(cornerRadius: 28))
        .overlay(RoundedRectangle(cornerRadius: 28).stroke(Color.white.opacity(0.08), lineWidth: 1))
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("kysymys-kortti")
    }

    private func vaihtoehto(_ k: Kysymys, _ q: Int, _ i: Int, _ v: Vaihtoehto) -> some View {
        let valittu = valinnat[q]?.contains(i) == true
        return HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text(verbatim: v.nimi).font(.body.weight(.medium)).fixedSize(horizontal: false, vertical: true)
                if let kuvaus = v.kuvaus {
                    Text(verbatim: kuvaus).font(.subheadline).foregroundStyle(.secondary).lineSpacing(4)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            Spacer(minLength: 0)
            // Monivalinnan rivillä tyhjä ympyrä kertoo, että valintoja voi olla useita.
            if valittu || k.monivalinta {
                Image(systemName: valittu ? "checkmark.circle.fill" : "circle").font(.title3)
                    .foregroundStyle(valittu ? Color.claude : Color.secondary)
            }
        }
        .padding(.vertical, 18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .contentShape(Rectangle())
    }

    // Valitun napautus poistaa valinnan (käyttäjä 13.10.2026); valinta tyhjentää saman kysymyksen oman vastauksen.
    private func valitse(_ q: Int, _ i: Int) {
        guard let vastaa else { return }
        if heti && muuTeksti(0).isEmpty {
            lahetetty = true
            vastaa(kysymykset[0].vaihtoehdot[i].nimi)
            return
        }
        var joukko = valinnat[q] ?? []
        if joukko.contains(i) { joukko.remove(i) } else if kysymykset[q].monivalinta { joukko.insert(i) } else { joukko = [i] }
        valinnat[q] = joukko
        if !joukko.isEmpty {
            muut[q] = ""
            if fokus == q { fokus = nil }
        }
    }

    // Vastaus tekstinä: kysymys kerrallaan "otsikko: valinnat tai oma vastaus".
    private func laheta(_ vastaa: (String) -> Void) {
        var rivit: [String] = []
        for (q, k) in kysymykset.enumerated() {
            var osat = (valinnat[q] ?? []).sorted().map { k.vaihtoehdot[$0].nimi }
            if !muuTeksti(q).isEmpty { osat.append(muuTeksti(q)) }
            if !osat.isEmpty { rivit.append(kysymykset.count == 1 ? osat.joined(separator: ", ") : "\(k.otsikko ?? k.kysymys): \(osat.joined(separator: ", "))") }
        }
        guard !rivit.isEmpty else { return }
        lahetetty = true
        vastaa(rivit.joined(separator: " — "))
    }
}

struct Viestilista: View {
    let viestit: [Viesti]
    var odottaa = false
    var vastaa: ((String) -> Void)? = nil
    var sulje: (() -> Void)? = nil
    var body: some View {
        ScrollViewReader { vierita in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 8) {
                    ForEach(Array(viestit.enumerated()), id: \.offset) { i, v in
                        Viestikupla(viesti: v, vastaa: vastaa, sulje: sulje,
                                    nayta: { nosta(vierita) }).id(i)
                    }
                    if odottaa { ProgressView().padding(.leading, 12).id("odottaa") }
                    Color.clear.frame(height: 1).id("loppu")
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
            }
            // Näppäimistö pois napautuksella tai vedolla viestilistassa (käyttäjä 13.10.2026); kortin painikkeet toimivat yhä.
            .scrollDismissesKeyboard(.interactively)
            .gesture(NappaimistoPois())
            .onChange(of: viestit.count) { vierita.scrollTo(odottaa ? AnyHashable("odottaa") : AnyHashable(viestit.count - 1), anchor: .bottom) }
            // Suoratoistossa viimeinen kupla kasvaa ilman uutta viestiä.
            .onChange(of: viestit.last?.teksti) { if !odottaa, !viestit.isEmpty { vierita.scrollTo(viestit.count - 1, anchor: .bottom) } }
            .onAppear { if !viestit.isEmpty { vierita.scrollTo(viestit.count - 1, anchor: .bottom) } }
            // Kortti nousee niin ylös kuin käsin vetäen (käyttäjä 13.10.2026): vieritys vasta, kun näppäimistö on auki,
            // koska ajastettu vieritys ehti ennen kuin lista oli kutistunut näppäimistön verran.
            .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardDidShowNotification)) { _ in
                if kysymysAuki { nosta(vierita) }
            }
        }
    }

    private var kysymysAuki: Bool { viestit.last.map { !($0.kysymykset ?? []).isEmpty && $0.vastattu != true } ?? false }

    private func nosta(_ vierita: ScrollViewProxy) { withAnimation { vierita.scrollTo("loppu", anchor: .bottom) } }
}

// Napautus muualle kuin tekstikenttään sulkee näppäimistön. Ei peru kosketuksia, joten painikkeet toimivat, ja
// tekstikentän oma napautus (kortin Muu-kenttä) ohitetaan, ettei juuri avattu näppäimistö sulkeudu.
struct NappaimistoPois: UIGestureRecognizerRepresentable {
    func makeCoordinator(converter: CoordinateSpaceConverter) -> Valvoja { Valvoja() }
    func makeUIGestureRecognizer(context: Context) -> UITapGestureRecognizer {
        let t = UITapGestureRecognizer()
        t.cancelsTouchesInView = false
        t.delegate = context.coordinator
        return t
    }
    func handleUIGestureRecognizerAction(_ t: UITapGestureRecognizer, context: Context) {
        if t.state == .ended { UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil) }
    }
    final class Valvoja: NSObject, UIGestureRecognizerDelegate {
        func gestureRecognizer(_ g: UIGestureRecognizer, shouldReceive kosketus: UITouch) -> Bool {
            var n = kosketus.view
            while let v = n { if v is UITextView || v is UITextField { return false }; n = v.superview }
            return true
        }
        func gestureRecognizer(_ g: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith toinen: UIGestureRecognizer) -> Bool { true }
    }
}

// Syöttökenttä Claude-äpin tyyliin (DEMO-SCOPES-UI 13.10.2026): pyöristetty kortti, teksti ylhäällä ja sen alla
// rivi, jonka vasemmassa reunassa on valinnainen lisäosa (chatissa mallin valinta) ja oikeassa lähetyspallo.
struct Syottorivi<Vasen: View>: View {
    @Binding var teksti: String
    let estetty: Bool
    let tunnus: String
    let laheta: () -> Void
    @ViewBuilder var vasen: Vasen

    private var tyhja: Bool { teksti.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            TextField("Kirjoita viesti", text: $teksti, axis: .vertical)
                .lineLimit(1...6)
                .accessibilityIdentifier("\(tunnus)-kentta")
            HStack(spacing: 8) {
                vasen
                Spacer()
                Button(action: laheta) {
                    Image(systemName: "arrow.up")
                        .font(.body.weight(.semibold))
                        .foregroundStyle(.white)
                        .frame(width: 32, height: 32)
                        .background(Circle().fill(estetty || tyhja ? Color(.systemGray3) : Color.claude))
                }
                .disabled(estetty || tyhja)
                .accessibilityIdentifier("\(tunnus)-laheta")
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).stroke(Color(.separator).opacity(0.4)))
        .padding(.horizontal, 12)
        .padding(.bottom, 8)
    }
}

extension Syottorivi where Vasen == EmptyView {
    init(teksti: Binding<String>, estetty: Bool, tunnus: String, laheta: @escaping () -> Void) {
        self.init(teksti: teksti, estetty: estetty, tunnus: tunnus, laheta: laheta) { EmptyView() }
    }
}

extension Color {
    static let claude = Color(red: 0.85, green: 0.47, blue: 0.34)
}

struct ChatView: View {
    @EnvironmentObject private var asetukset: Asetukset
    @EnvironmentObject private var navigaatio: Navigaatio
    @Environment(\.scenePhase) private var vaihe
    @State private var agentit: [Agentti] = []
    @State private var valittu: String?
    @State private var viestit: [Viesti] = []
    @State private var keskustelu: String?
    @State private var teksti = ""
    @State private var odottaa = false
    @State private var virhe: String?
    @State private var paloja = 0
    // Yhteys palvelimeen katkesi (DEMO-SCOPES-YHTEYS 13.10.2026): näytetään napautettava "Yhdistä uudelleen".
    // vastausKesken: katkos tuli kesken vastauksen, joten uudelleenyhdistys liittyy palvelimella jatkuvaan ajoon.
    @State private var katkennut = false
    @State private var vastausKesken = false
    @State private var yhdistetaan = false

    private var valittuAgentti: Agentti? { agentit.first { $0.nimi == valittu } }
    private var asiakas: Asiakas { Asiakas(osoite: asetukset.osoite, avain: asetukset.avain) }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if katkennut {
                    Button { Task { await yhdista() } } label: {
                        Label(yhdistetaan ? "Yhdistetään…" : "Yhteys palvelimeen katkesi — yhdistä uudelleen", systemImage: "arrow.clockwise")
                            .font(.subheadline.weight(.medium))
                    }
                    .disabled(yhdistetaan)
                    .padding(.horizontal).padding(.vertical, 6)
                    .accessibilityIdentifier("chat-yhdista")
                }
                if let virhe { Text(virhe).foregroundStyle(.red).padding(.horizontal).accessibilityIdentifier("chat-virhe") }
                if viestit.isEmpty && !odottaa {
                    Spacer()
                    Text("Kysy mitä tahansa: \(valittuAgentti?.otsikko ?? "agentti").").foregroundStyle(.secondary)
                    Spacer()
                } else {
                    // Saavutettavuusarvo kertoo, monessako palassa viimeisin vastaus saapui (UI-testi todentaa suoratoiston).
                    Viestilista(viestit: viestit, odottaa: odottaa && viestit.last?.omaViesti == true)
                        .accessibilityElement(children: .contain)
                        .accessibilityIdentifier("chat-viestit")
                        .accessibilityValue("\(paloja) palaa")
                }
                if odottaa && viestit.last?.omaViesti == false {
                    Text("kirjoittaa…").font(.caption).foregroundStyle(.secondary).accessibilityIdentifier("chat-kirjoittaa")
                }
                Syottorivi(teksti: $teksti, estetty: odottaa || valittu == nil || vastausKesken, tunnus: "chat", laheta: { Task { await laheta() } }) {
                    mallinValinta
                }
            }
            .navigationTitle(valittuAgentti?.otsikko ?? "Chat")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                Sivupalkkipainike()
                ToolbarItem(placement: .topBarTrailing) {
                    Button { uusi() } label: { Image(systemName: "square.and.pencil") }
                        .disabled(odottaa)
                        .accessibilityIdentifier("chat-uusi")
                }
            }
            .task(id: asetukset.osoite + asetukset.avain) {
                // Mallilista päivittyy 30 s välein: palvelimen mallit katoavat valitsimesta, kun kone ei vastaa.
                while !Task.isCancelled {
                    if !odottaa { await lataaAgentit() }
                    try? await Task.sleep(for: .seconds(30))
                }
            }
            // Äppi palaa etualalle (näyttölukko auki, toisesta äpistä): katkos korjataan itse ennen kuin käyttäjä huomaa.
            .onChange(of: vaihe) { if vaihe == .active && katkennut && !yhdistetaan { Task { await yhdista() } } }
            .onChange(of: navigaatio.chatPyynto) { Task { await pyynto(navigaatio.chatPyynto) } }
            .onChange(of: keskustelu) { navigaatio.nykyinenChat = keskustelu }
        }
    }

    // Mallin valinta syöttökentän alla Claude-äpin tapaan: nimi ja alasnuoli; Claude-mallit ja palvelimen
    // paikalliset mallit omina osioinaan (jälkimmäinen puuttuu, kun palvelin on pois päältä).
    private var mallinValinta: some View {
        Menu {
            Section("Claude") { ForEach(agentit.filter { $0.tyyppi == "malli" }) { valinta($0) } }
            let paikalliset = agentit.filter { $0.tyyppi == "paikallinen" }
            if !paikalliset.isEmpty { Section("palvelin") { ForEach(paikalliset) { valinta($0) } } }
        } label: {
            HStack(spacing: 4) {
                Text(valittuAgentti?.otsikko ?? "Valitse malli").font(.subheadline.weight(.medium)).lineLimit(1)
                Image(systemName: "chevron.down").font(.caption2.weight(.semibold))
            }
            .foregroundStyle(.secondary)
        }
        .disabled(odottaa)
        .accessibilityIdentifier("chat-agentti")
    }

    // Agentin vaihto aloittaa uuden keskustelun: claude-istunnon jatko kuuluu sille agentille, joka sen aloitti.
    // Valintamerkki on nimen perässä tekstinä: valikon kuvake menisi nimen vasemmalle ja siirtäisi sitä (käyttäjä 13.10.2026).
    private func valinta(_ a: Agentti) -> some View {
        Button { if valittu != a.nimi { valittu = a.nimi; uusi() } } label: {
            Text(a.nimi == valittu ? "\(a.otsikko)  ✓" : a.otsikko)
        }
    }

    private func uusi() {
        viestit = []
        keskustelu = nil
        virhe = nil
    }

    // Sivupalkin pyyntö: tunnus avaa keskustelun, nil aloittaa uuden. Kesken olevaa vastausta ei keskeytetä.
    private func pyynto(_ p: ChatPyynto) async {
        guard !odottaa, !vastausKesken else { return }
        guard let id = p.id else { uusi(); return }
        guard id != keskustelu else { return }
        do {
            avaa(try await asiakas.keskustelu(id))
        } catch {
            nayta(error)
        }
    }

    // Historian keskustelu jatkuu sillä agentilla, joka sen aloitti (palvelu kertoo sen).
    private func avaa(_ k: ChatKeskustelunViestit) {
        viestit = k.viestit
        keskustelu = k.id
        if let a = k.agentti, agentit.contains(where: { $0.nimi == a }) { valittu = a }
        virhe = nil
    }

    // Verkkokatkos näytetään uudelleenyhdistämisenä, palvelun virhe tekstinä.
    private func nayta(_ e: Error) {
        if Asiakas.yhteysKatkesi(e) { katkennut = true } else { virhe = e.localizedDescription }
    }

    private func lataaAgentit() async {
        guard asetukset.valmis else { virhe = "Anna palvelimen osoite ja avain asetuksissa."; return }
        do {
            let uudet = try await asiakas.agentit()
            let oletus = uudet.first { $0.nimi == "claude-sonnet-5-5" }?.nimi ?? uudet.first?.nimi
            let poistunut = agentit.first { $0.nimi == valittu && !uudet.contains($0) }
            // Virherivi tyhjennetään vain ensimmäisellä onnistuneella haulla, ettei päivitys piilota chatin virhettä.
            if agentit.isEmpty { virhe = nil }
            if !vastausKesken { katkennut = false }
            agentit = uudet
            if valittu == nil {
                valittu = oletus
            } else if let poistunut {
                // Valittu paikallinen malli ei ole enää käytettävissä (palvelin pois): oletusmalliin ja uusi keskustelu.
                valittu = oletus
                uusi()
                virhe = "\(poistunut.otsikko) ei ole käytettävissä (palvelin ei vastaa)."
            }
        } catch {
            nayta(error)
        }
    }

    private func laheta() async {
        guard let agentti = valittu else { return }
        let viesti = teksti.trimmingCharacters(in: .whitespacesAndNewlines)
        teksti = ""
        viestit.append(Viesti(rooli: "kayttaja", teksti: viesti, aika: nil))
        await vastaanota(kupla: nil) {
            try await asiakas.chatVirta(agentti: agentti, viesti: viesti, keskustelu: keskustelu)
        }
    }

    // Uudelleenyhdistys: mallilista ja, jos vastaus jäi kesken, liittyminen palvelimella jatkuneeseen ajoon. Ensimmäinen
    // pala on koko tähän asti kirjoitettu teksti, joten se korvaa kuplan. Jos palvelulla ei ole ajoa (404: valmistui
    // yli 10 min sitten tai palvelu käynnistyi uudelleen), keskustelu luetaan historiasta.
    private func yhdista() async {
        yhdistetaan = true
        defer { yhdistetaan = false }
        if vastausKesken {
            let kupla = viestit.last?.omaViesti == false ? viestit.count - 1 : nil
            await vastaanota(kupla: kupla, korvaaEnsin: true) { try await asiakas.kaynnissa() }
            if case .palvelu(404, _)? = viimeisinVirhe as? Asiakas.Virhe {
                virhe = nil
                vastausKesken = false
                if let keskustelu { do { avaa(try await asiakas.keskustelu(keskustelu)) } catch { nayta(error) } }
                else { virhe = "Vastaus ei ole enää palvelimella; kysy uudelleen." }
            }
        }
        await lataaAgentit()
    }

    @State private var viimeisinVirhe: Error?

    // Suoratoisto (DEMO-SCOPES-SUORATOISTO): agentin kupla syntyy ensimmäisestä palasta ja kasvaa sitä mukaa;
    // valmis-rivin koko vastaus korvaa palojen summan, jotta lopputulos on sama kuin historiassa. Taustatehtävä pitää
    // yhteyden auki hetken näyttölukon tai äpin vaihdon jälkeen; jos iOS katkaisee sen silti, palvelin jatkaa ajoa.
    private func vastaanota(kupla alku: Int?, korvaaEnsin: Bool = false, _ avaa: () async throws -> AsyncThrowingStream<ChatTapahtuma, Error>) async {
        odottaa = true
        virhe = nil
        viimeisinVirhe = nil
        var kupla = alku
        var korvaa = korvaaEnsin
        paloja = 0
        func kirjoita(_ teksti: String, korvaa: Bool = false) {
            if let i = kupla { viestit[i].teksti = korvaa ? teksti : viestit[i].teksti + teksti; return }
            viestit.append(Viesti(rooli: "agentti", teksti: teksti, aika: nil))
            kupla = viestit.count - 1
        }
        let tausta = UIApplication.shared.beginBackgroundTask(withName: "chat-vastaus")
        defer { if tausta != .invalid { UIApplication.shared.endBackgroundTask(tausta) } }
        do {
            // Virta auki = palvelu hyväksyi pyynnön ja ajaa agenttia, joten katkos tästä eteenpäin jättää vastauksen kesken.
            let virta = try await avaa()
            vastausKesken = true
            for try await t in virta {
                switch t.tyyppi {
                case "pala": if let p = t.teksti, !p.isEmpty { kirjoita(p, korvaa: korvaa); korvaa = false; paloja += 1 }
                case "valmis":
                    keskustelu = t.keskustelu ?? keskustelu
                    kirjoita(t.vastaus ?? "", korvaa: true)
                case "virhe": virhe = t.virhe ?? "agentti ei vastannut"
                default: break
                }
            }
            vastausKesken = false
            katkennut = false
        } catch {
            viimeisinVirhe = error
            if Asiakas.yhteysKatkesi(error) {
                // Uudelleenliittyminen, joka katkesi, jättää ajon yhä kesken.
                vastausKesken = vastausKesken || korvaaEnsin
                katkennut = true
            } else {
                vastausKesken = false
                virhe = error.localizedDescription
            }
        }
        odottaa = false
        if katkennut && vaihe == .active && !yhdistetaan { Task { await yhdista() } }
    }
}

struct SkooppiViestitView: View {
    let nimi: String
    @EnvironmentObject private var asetukset: Asetukset
    @State private var tila: SkooppiViestit?
    @State private var teksti = ""
    @State private var lahettaa = false
    @State private var puretaan = false
    @State private var virhe: String?

    private var asiakas: Asiakas { Asiakas(osoite: asetukset.osoite, avain: asetukset.avain) }

    var body: some View {
        VStack(spacing: 0) {
            if let virhe { Text(virhe).foregroundStyle(.red).padding(.horizontal).accessibilityIdentifier("viestit-virhe") }
            if let t = tila {
                if t.auki {
                    if let i = t.istunto {
                        Text([i.tila, i.konteksti.map { tokenit($0.tokenit) }].compactMap { $0 }.joined(separator: " · "))
                            .font(.caption).foregroundStyle(.secondary).accessibilityIdentifier("viestit-istunto")
                    }
                    Viestilista(viestit: t.viestit, vastaa: t.voiLahettaa ? { v in Task { await laheta(v) } } : nil,
                                sulje: t.voiLahettaa ? { Task { await suljeKysymys() } } : nil)
                    // Auki oleva kysymyskortti korvaa syöttökentän (käyttäjä 13.10.2026): vapaa vastaus kulkee kortin Muu-kentästä.
                    let kysymysAuki = t.viestit.contains { !($0.kysymykset ?? []).isEmpty && $0.vastattu != true }
                    if t.voiLahettaa {
                        if !kysymysAuki { Syottorivi(teksti: $teksti, estetty: lahettaa, tunnus: "viestit") { Task { await laheta() } } }
                    } else {
                        Text("Istunto ei ole tmuxissa: viestit vain luettavissa.").font(.caption).foregroundStyle(.secondary).padding()
                            .accessibilityIdentifier("viestit-vain-luku")
                    }
                } else {
                    Spacer()
                    VStack(spacing: 16) {
                        Text(t.pakattu == true ? "Skooppi on pakattu." : "Skooppi ei ole auki.").font(.headline)
                            .accessibilityIdentifier(t.pakattu == true ? "pakattu" : "ei-auki")
                        Button { Task { await pura() } } label: { Label("Pura", systemImage: "play.circle") }
                            .buttonStyle(.borderedProminent)
                            .disabled(puretaan)
                            .accessibilityIdentifier("viestit-pura")
                        if puretaan { ProgressView("Avataan istuntoa…") }
                    }
                    Spacer()
                }
            } else if virhe == nil {
                Spacer()
                ProgressView()
                Spacer()
            }
        }
        .navigationTitle(nimi)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            // Kolme pistettä kuten Claude-äpissä (käyttäjä 13.10.2026), avaa skoopin tiedot.
            NavigationLink(value: SkooppiReitti.tiedot(nimi)) { Image(systemName: "ellipsis") }
                .accessibilityLabel("Skoopin tiedot")
                .accessibilityIdentifier("tiedot")
        }
        .task {
            // Päivitys 5 s välein, kun näkymä on auki (istunnon vastaukset tulevat transkriptiin).
            while !Task.isCancelled {
                if !puretaan { await lataa() }
                try? await Task.sleep(for: .seconds(5))
            }
        }
    }

    private func lataa() async {
        do {
            tila = try await asiakas.viestit(nimi)
            virhe = nil
        } catch {
            virhe = error.localizedDescription
        }
    }

    private func laheta(_ kortista: String? = nil) async {
        let viesti = kortista ?? teksti.trimmingCharacters(in: .whitespacesAndNewlines)
        lahettaa = true
        do {
            _ = try await asiakas.laheta(nimi, viesti)
            if kortista == nil { teksti = "" }
            virhe = nil
            try? await Task.sleep(for: .seconds(1))
            await lataa()
        } catch {
            virhe = error.localizedDescription
        }
        lahettaa = false
    }

    private func suljeKysymys() async {
        do {
            _ = try await asiakas.suljeKysymys(nimi)
            virhe = nil
            try? await Task.sleep(for: .seconds(1))
            await lataa()
        } catch {
            virhe = error.localizedDescription
        }
    }

    // Pura palaa, kun Remote Control -istunto on auki; istunto näkyy palvelulle pian sen jälkeen.
    private func pura() async {
        puretaan = true
        virhe = nil
        do {
            _ = try await asiakas.toiminto(.pura, nimi)
            for _ in 0..<24 {
                await lataa()
                if tila?.auki == true { break }
                try? await Task.sleep(for: .seconds(5))
            }
        } catch {
            virhe = error.localizedDescription
        }
        puretaan = false
    }
}
