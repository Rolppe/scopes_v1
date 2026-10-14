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
    // Kortin kysymyksen vaihto pyytää listaa näyttämään kortin yläreunasta (vaihe ja X näkyviin).
    var ylos: (() -> Void)? = nil
    var body: some View {
        if viesti.tyokalu {
            // Työkalukutsu: yksi himmeä rivi kuplien välissä (komento tai muokattu tiedosto).
            Text(verbatim: viesti.teksti)
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .padding(.leading, Teema.Vali.m)
                .accessibilityIdentifier("tyokalu-rivi")
        } else if let kysymykset = viesti.kysymykset, !kysymykset.isEmpty {
            // Vastattu tai ohitettu kysymys katoaa (käyttäjä 13.10.2026); vastaus jää omaksi kuplakseen.
            if viesti.vastattu != true { KysymysKortti(kysymykset: kysymykset, vastaa: vastaa, sulje: sulje, nayta: nayta, ylos: ylos) }
        } else {
            kupla
        }
    }

    private var kupla: some View {
        HStack {
            if viesti.omaViesti { Spacer(minLength: 40) }
            Text(LocalizedStringKey(viesti.teksti))
                .textSelection(.enabled)
                .padding(Teema.Vali.m)
                .background(viesti.omaViesti ? Teema.korostusTausta : Teema.pinta,
                            in: RoundedRectangle(cornerRadius: Teema.Kulma.kortti))
            if !viesti.omaViesti { Spacer(minLength: 40) }
        }
    }
}

// Monivalinta korttina kuten Claude-äpissä: otsikko, kysymys ja vaihtoehdot kuvauksineen sekä Muu-kenttä.
// Yksi kysymys ilman monivalintaa lähtee napautuksesta; muuten valinnat kootaan ja lähetetään Lähetä-napista.
// Moniosainen kortti (CHAT-QUESTION-YKSI-KERRALLAAN, käyttäjä 14.10.2026): yksi kysymys kerrallaan, yläreunassa vaihe
// nuolineen; yksivalinta siirtää seuraavaan, Seuraava ohittaa, viimeisessä Lähetä kokoaa kaikki vastaukset.
struct KysymysKortti: View {
    let kysymykset: [Kysymys]
    let vastaa: ((String) -> Void)?
    var sulje: (() -> Void)? = nil
    var nayta: (() -> Void)? = nil
    var ylos: (() -> Void)? = nil
    @State private var valinnat: [Int: Set<Int>] = [:]
    // Oma vastaus kysymyskohtaisesti (käyttäjä 13.10.2026): kahden kysymyksen kortissa kentän valinta ei saa tyhjentää toista.
    @State private var muut: [Int: String] = [:]
    @FocusState private var fokus: Int?
    @State private var lahetetty = false
    @State private var nyt = 0

    private var heti: Bool { kysymykset.count == 1 && !kysymykset[0].monivalinta }
    private var monta: Bool { kysymykset.count > 1 }
    private var q: Int { min(nyt, kysymykset.count - 1) }
    private var viimeinen: Bool { q == kysymykset.count - 1 }
    private func muuTeksti(_ q: Int) -> String { (muut[q] ?? "").trimmingCharacters(in: .whitespacesAndNewlines) }
    private var tyhja: Bool { kysymykset.indices.allSatisfy { (valinnat[$0] ?? []).isEmpty && muuTeksti($0).isEmpty } }

    // Ulkoasu Claude iOS -äpin kortin mukaan (käyttäjä 13.10.2026, kuvakaappaus): iso kysymys, vaihtoehdot ilman numeroita
    // ohuin erottimin, Muu-rivi pelkkänä kenttänä, vaalea Lähetä-kapseli oikealla; ei otsikkosirua eikä tilariviä.
    var body: some View {
        let k = kysymykset[q]
        VStack(alignment: .leading, spacing: 0) {
            if monta {
                HStack(spacing: Teema.Vali.s) {
                    siirto("chevron.left", "Edellinen kysymys", "kysymys-edellinen", q > 0) { siirry(q - 1) }
                    Text(verbatim: "\(q + 1)/\(kysymykset.count)").font(.subheadline.monospacedDigit()).foregroundStyle(.secondary)
                        .accessibilityIdentifier("kysymys-vaihe")
                    siirto("chevron.right", "Seuraava kysymys", "kysymys-eteen", !viimeinen) { siirry(q + 1) }
                    Spacer(minLength: 0)
                    suljeNappi
                }
                .padding(.bottom, Teema.Vali.m)
            }
            HStack(alignment: .top, spacing: Teema.Vali.m) {
                Text(verbatim: k.kysymys).font(.title2.weight(.medium))
                    .fixedSize(horizontal: false, vertical: true).textSelection(.enabled)
                    .accessibilityIdentifier("kysymys-teksti")
                Spacer(minLength: 0)
                if !monta { suljeNappi }
            }
            .padding(.bottom, Teema.Vali.l)
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
                    .padding(.vertical, Teema.Vali.l)
                    .focused($fokus, equals: q)
                    .disabled(lahetetty)
                    .accessibilityIdentifier("kysymys-muu-\(q)")
                    .id(q)
            }
            if let vastaa {
                HStack {
                    Spacer()
                    if viimeinen {
                        Button { laheta(vastaa) } label: { kapseli("Lähetä", lahetetty || tyhja) }
                            .buttonStyle(.plain)
                            .disabled(lahetetty || tyhja)
                            .accessibilityIdentifier("kysymys-laheta")
                    } else {
                        // Seuraava ohittaa kysymyksen vastaamatta; ohitettu jää pois vastauksesta.
                        Button { siirry(q + 1) } label: { kapseli("Seuraava", lahetetty) }
                            .buttonStyle(.plain)
                            .disabled(lahetetty)
                            .accessibilityIdentifier("kysymys-seuraava")
                    }
                }
                .padding(.top, Teema.Vali.s)
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
        .padding(Teema.Vali.xl)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray5), in: RoundedRectangle(cornerRadius: Teema.Kulma.arkki))
        .overlay(RoundedRectangle(cornerRadius: Teema.Kulma.arkki).stroke(Color.white.opacity(0.08), lineWidth: 1))
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("kysymys-kortti")
    }

    // Sulku kuten Claude-äpissä (käyttäjä 13.10.2026): X kortin yläkulmassa hylkää kysymyksen.
    @ViewBuilder private var suljeNappi: some View {
        if let sulje {
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

    private func siirto(_ kuva: String, _ nimi: String, _ tunnus: String, _ paalla: Bool, _ toiminto: @escaping () -> Void) -> some View {
        Button(action: toiminto) {
            Image(systemName: kuva).font(.body.weight(.semibold)).frame(width: 36, height: 36).contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .foregroundStyle(paalla ? Color.primary : Color.secondary.opacity(0.4))
        .disabled(!paalla || lahetetty)
        .accessibilityLabel(nimi)
        .accessibilityIdentifier(tunnus)
    }

    // Väri Claude-äpin Submit-napista (kuvakaappaus 13.10.2026): vaaleanharmaa kapseli, tummanharmaa teksti.
    private func kapseli(_ teksti: String, _ himmea: Bool) -> some View {
        Text(teksti).font(.body.weight(.semibold)).foregroundStyle(Color(white: 0.24))
            .padding(.horizontal, Teema.Vali.xl).padding(.vertical, Teema.Vali.m)
            .background(Color(white: himmea ? 0.80 : 0.92), in: Capsule())
    }

    private func siirry(_ uusi: Int) {
        guard kysymykset.indices.contains(uusi) else { return }
        fokus = nil
        withAnimation(.easeInOut(duration: 0.2)) { nyt = uusi }
        // Eri korkuinen kysymys: lista vierittää kortin yläreunan taas näkyviin.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { ylos?() }
    }

    private func vaihtoehto(_ k: Kysymys, _ q: Int, _ i: Int, _ v: Vaihtoehto) -> some View {
        let valittu = valinnat[q]?.contains(i) == true
        return HStack(alignment: .center, spacing: Teema.Vali.m) {
            VStack(alignment: .leading, spacing: Teema.Vali.s) {
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
                    .foregroundStyle(valittu ? Teema.korostus : Teema.toissijainen)
            }
        }
        .padding(.vertical, Teema.Vali.l)
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
            // Yksivalinta vie seuraavaan kysymykseen kuten Claude-äpissä; viimeisessä odotetaan Lähetä-nappia.
            if !kysymykset[q].monivalinta && q < kysymykset.count - 1 {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { if nyt == q { siirry(q + 1) } }
            }
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
                // Ei LazyVStack (CHAT-MUSTA 13.10.2026): laiska lista arvioi rivikorkeudet, ja scrollTo("loppu") osui
                // vaihdossa ja uuden viestin jälkeen sisällön ohi, jolloin näkymä jäi mustaksi. Viestejä on enintään 120
                // (palvelu/viestit.mjs), joten kaikki rivit mitataan kerralla.
                VStack(alignment: .leading, spacing: Teema.Vali.s) {
                    ForEach(Array(viestit.enumerated()), id: \.offset) { i, v in
                        Viestikupla(viesti: v, vastaa: vastaa, sulje: sulje,
                                    nayta: { nosta(vierita) }, ylos: { alkuun(vierita) }).id(i)
                    }
                    if odottaa { ProgressView().padding(.leading, Teema.Vali.m).id("odottaa") }
                    Color.clear.frame(height: 1).id("loppu")
                }
                .padding(.horizontal)
                .padding(.vertical, Teema.Vali.s)
            }
            // Lista pysyy alareunassaan, kun sen korkeus muuttuu (CHAT-NOUSU-TODENNUS 13.10.2026): näppäimistön avautuessa
            // keskustelu nousee kutistuksen mukana eikä jää lyhyeksi, jos kutistus ehtii vasta keyboardDidShow'n jälkeen.
            .defaultScrollAnchor(.bottom, for: .sizeChanges)
            // Näppäimistö pois napautuksella tai vedolla viestilistassa (käyttäjä 13.10.2026); kortin painikkeet toimivat yhä.
            .scrollDismissesKeyboard(.interactively)
            .gesture(NappaimistoPois())
            .onChange(of: viestit.count) { alkuun(vierita) }
            // Suoratoistossa viimeinen kupla kasvaa ilman uutta viestiä.
            .onChange(of: viestit.last?.teksti) { nosta(vierita) }
            // Kortin lähetys tai sulku (käyttäjä 13.10.2026): kortti katoaa ja vastaus nousee näkyviin listan loppuun.
            .onChange(of: viestit.last?.vastattu) { nosta(vierita) }
            .onAppear { if !viestit.isEmpty { alkuun(vierita, animoi: false) } }
            // Näppäimistön avautuminen nostaa keskustelun niin ylös kuin käsin vetäen, sekä kortin kentästä että
            // syöttökentästä (käyttäjä 13.10.2026); vieritys vasta näppäimistön jälkeen, kun lista on jo kutistunut.
            .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardDidShowNotification)) { _ in nosta(vierita) }
        }
    }

    private func nosta(_ vierita: ScrollViewProxy) { withAnimation { vierita.scrollTo("loppu", anchor: .bottom) } }

    // Auki oleva kysymyskortti näytetään yläreunastaan (DESIGN-SKOOPPINAKYMA U8): loppuun vieritettäessä ruutua pidemmän
    // kortin otsikko ja X jäivät otsikkopalkin alle. Lyhyt kortti jää silti alareunaan, koska vieritys ei ylitä loppua.
    private func alkuun(_ vierita: ScrollViewProxy, animoi: Bool = true) {
        let kortti = viestit.last.map { !($0.kysymykset ?? []).isEmpty && $0.vastattu != true } ?? false
        let siirra = { kortti ? vierita.scrollTo(viestit.count - 1, anchor: .top) : vierita.scrollTo("loppu", anchor: .bottom) }
        if animoi { withAnimation { siirra() } } else { siirra() }
    }
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
    // Valitut liitteet sallivat lähetyksen tyhjälläkin tekstillä (skoopin viestit, CHAT-MEDIA-SKOOPPI).
    var liitteita = false
    // Stop-nappi (CHAT-STOP, kuten Claude iOS -äpissä): vastauksen aikana lähetyspallo vaihtuu täytetyksi neliöksi,
    // joka keskeyttää heti ilman vahvistusta. Pysäytyksen jälkeen tilalle tulee play, joka lähettää "jatka" ja vaihtuu
    // taas stopiksi (käyttäjä 14.10.2026). Kirjoitettu teksti näyttää aina lähetysnapin; tyhjennys palauttaa stopin tai playn.
    var stop: (() -> Void)? = nil
    var jatka: (() -> Void)? = nil
    @ViewBuilder var vasen: Vasen

    private var tyhja: Bool { teksti.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !liitteita }

    var body: some View {
        VStack(alignment: .leading, spacing: Teema.Vali.s) {
            TextField("Kirjoita viesti", text: $teksti, axis: .vertical)
                .lineLimit(1...6)
                .accessibilityIdentifier("\(tunnus)-kentta")
            HStack(spacing: Teema.Vali.s) {
                vasen
                Spacer()
                if let stop, tyhja {
                    Button(action: stop) {
                        Image(systemName: "stop.fill")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(Teema.korostusPaalla)
                            .frame(width: 32, height: 32)
                            .lasiPinta(Teema.korostus, savy: Teema.korostus, in: Circle(), kosketus: true)
                    }
                    .accessibilityLabel("Pysäytä")
                    .accessibilityIdentifier("\(tunnus)-stop")
                } else if let jatka, tyhja, !estetty {
                    Button(action: jatka) {
                        Image(systemName: "play.fill")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(Teema.korostusPaalla)
                            .frame(width: 32, height: 32)
                            .lasiPinta(Teema.korostus, savy: Teema.korostus, in: Circle(), kosketus: true)
                    }
                    .accessibilityLabel("Jatka")
                    .accessibilityIdentifier("\(tunnus)-jatka")
                } else {
                    Button(action: laheta) {
                        Image(systemName: "arrow.up")
                            .font(.body.weight(.semibold))
                            .foregroundStyle(estetty || tyhja ? Color.white : Teema.korostusPaalla)
                            .frame(width: 32, height: 32)
                            .lasiPinta(estetty || tyhja ? Color(.systemGray3) : Teema.korostus,
                                       savy: estetty || tyhja ? Color(.systemGray3) : Teema.korostus, in: Circle(), kosketus: true)
                    }
                    .disabled(estetty || tyhja)
                    .accessibilityIdentifier("\(tunnus)-laheta")
                }
            }
        }
        .padding(.horizontal, Teema.Vali.l)
        .padding(.vertical, Teema.Vali.m)
        .lasiPinta(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: Teema.Kulma.arkki, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Teema.Kulma.arkki, style: .continuous).stroke(Color(.separator).opacity(0.4)))
        .padding(.horizontal, Teema.Vali.m)
        .padding(.bottom, Teema.Vali.s)
    }
}

extension Syottorivi where Vasen == EmptyView {
    init(teksti: Binding<String>, estetty: Bool, tunnus: String, laheta: @escaping () -> Void) {
        self.init(teksti: teksti, estetty: estetty, tunnus: tunnus, laheta: laheta) { EmptyView() }
    }
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
    @State private var pysaytetty = false
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
                    .padding(.horizontal).padding(.vertical, Teema.Vali.s)
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
                Syottorivi(teksti: $teksti, estetty: odottaa || valittu == nil || vastausKesken, tunnus: "chat", laheta: { Task { await laheta() } },
                           stop: odottaa || vastausKesken ? { Task { await pysayta() } } : nil,
                           jatka: pysaytetty && valittu != nil ? { Task { await laheta("jatka") } } : nil) {
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
    // paikalliset mallit omina osioinaan (jälkimmäinen puuttuu, kun palvelin on pois päältä; otsikko V-330).
    private var mallinValinta: some View {
        Menu {
            Section("Claude") { ForEach(agentit.filter { $0.tyyppi == "malli" }) { valinta($0) } }
            let paikalliset = agentit.filter { $0.tyyppi == "paikallinen" }
            if !paikalliset.isEmpty { Section("Paikalliset") { ForEach(paikalliset) { valinta($0) } } }
        } label: {
            HStack(spacing: Teema.Vali.xs) {
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

    private func laheta(_ jatko: String? = nil) async {
        guard let agentti = valittu else { return }
        let viesti = jatko ?? teksti.trimmingCharacters(in: .whitespacesAndNewlines)
        if jatko == nil { teksti = "" }
        pysaytetty = false
        viestit.append(Viesti(rooli: "kayttaja", teksti: viesti, aika: nil))
        await vastaanota(kupla: nil) {
            try await asiakas.chatVirta(agentti: agentti, viesti: viesti, keskustelu: keskustelu)
        }
    }

    // Stop: palvelu katkaisee ajon, ja virta päättyy valmis-riviin, jossa on tähän asti kirjoitettu vastaus; kenttä
    // vapautuu sen myötä. 409 = vastaus ehti valmistua tai ajo ei ollut vielä alkanut.
    private func pysayta() async {
        do { _ = try await asiakas.pysaytaChat(); pysaytetty = true } catch {
            if case .palvelu(409, _)? = error as? Asiakas.Virhe { return }
            nayta(error)
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
                    // Ennen ensimmäistä palaa pysäytetty vastaus on tyhjä: ei tyhjää kuplaa.
                    if kupla != nil || !(t.vastaus ?? "").isEmpty { kirjoita(t.vastaus ?? "", korvaa: true) }
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

// Käyttörajarenkaat kolmen pisteen vieressä (CHAT-KAYTTORAJA, käyttäjä 13.10.2026): ulompi keltainen = 5 h raja,
// sisempi punainen = Clauden viikkoraja; rengas täyttyy ylhäältä myötäpäivään. Napautus näyttää prosentit ja
// nollautumishetket. Ilman lukemaa renkaat ovat tyhjiä.
struct KayttorajaRenkaat: View {
    let raja: Kayttoraja?

    var body: some View {
        Menu {
            // Valikko nimeää renkaat (DESIGN-SKOOPPINAKYMA U8): väri yksin ei kerro, kumpi raja on kumpi.
            Section("Käyttöraja") {
                Text(rivi("Ulompi keltainen, 5 h", raja?.viisiTuntia, muoto: .dateTime.hour().minute()))
                Text(rivi("Sisempi punainen, viikko", raja?.viikko, muoto: .dateTime.weekday(.abbreviated).hour().minute()))
            }
        } label: {
            ZStack {
                rengas(raja?.viisiTuntia, vari: .yellow, koko: 21)
                rengas(raja?.viikko, vari: .red, koko: 11)
            }
            .frame(width: 24, height: 24)
        }
        .accessibilityLabel("Käyttöraja")
        .accessibilityValue("5 h \(prosentti(raja?.viisiTuntia)), viikko \(prosentti(raja?.viikko))")
        .accessibilityIdentifier("kayttoraja")
    }

    private func rengas(_ r: Kayttoraja.Raja?, vari: Color, koko: CGFloat) -> some View {
        ZStack {
            Circle().stroke(vari.opacity(0.25), lineWidth: 3)
            Circle().trim(from: 0, to: min(max((r?.kaytto ?? 0) / 100, 0), 1))
                .stroke(vari, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
        .frame(width: koko, height: koko)
    }

    private func prosentti(_ r: Kayttoraja.Raja?) -> String { r.map { "\(Int($0.kaytto.rounded())) %" } ?? "ei tiedossa" }

    private func rivi(_ nimi: String, _ r: Kayttoraja.Raja?, muoto: Date.FormatStyle) -> String {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let aika = r?.nollautuu.flatMap { iso.date(from: $0) }.map { " · nollautuu \($0.formatted(muoto))" } ?? ""
        return "\(nimi): \(prosentti(r))\(aika)"
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
    @State private var kayttoraja: Kayttoraja?
    @State private var liitteet: [Liite] = []
    @State private var pysaytetaan = false
    @State private var pysaytetty = false

    private var asiakas: Asiakas { Asiakas(osoite: asetukset.osoite, avain: asetukset.avain) }

    var body: some View {
        VStack(spacing: 0) {
            if let virhe { Text(virhe).foregroundStyle(.red).padding(.horizontal).accessibilityIdentifier("viestit-virhe") }
            if let t = tila {
                if t.auki {
                    // Istunnon tila suomeksi ja konteksti samalla merkillä kuin skoopin näkymässä (DESIGN-SKOOPPINAKYMA U8, U9).
                    if let i = t.istunto {
                        Text("\(istunnonTila(i.tila) ?? "Istunto auki")\(i.konteksti.map { Text(" · \(Image(systemName: "brain")) \(tokenit($0.tokenit))") } ?? Text(""))")
                            .font(.caption).monospacedDigit().foregroundStyle(.secondary)
                            .padding(.bottom, Teema.Vali.xs)
                            .accessibilityIdentifier("viestit-istunto")
                    }
                    Viestilista(viestit: t.viestit, vastaa: t.voiLahettaa ? { v in Task { await laheta(v) } } : nil,
                                sulje: t.voiLahettaa ? { Task { await suljeKysymys() } } : nil)
                    // Auki oleva kysymyskortti korvaa syöttökentän (käyttäjä 13.10.2026): vapaa vastaus kulkee kortin Muu-kentästä.
                    let kysymysAuki = t.viestit.contains { !($0.kysymykset ?? []).isEmpty && $0.vastattu != true }
                    if t.voiLahettaa {
                        if !kysymysAuki {
                            if !liitteet.isEmpty { LiiteRivi(liitteet: $liitteet) }
                            let tyossa = ["busy", "shell"].contains(t.istunto?.tila ?? "")
                            Syottorivi(teksti: $teksti, estetty: lahettaa, tunnus: "viestit", laheta: { Task { await laheta() } },
                                       liitteita: !liitteet.isEmpty, stop: tyossa ? { Task { await pysayta() } } : nil,
                                       jatka: pysaytetty ? { Task { await laheta("jatka") } } : nil) {
                                LiiteValikko(liitteet: $liitteet, virhe: $virhe)
                            }
                        }
                    } else {
                        Text("Istunto ei ole tmuxissa: viestit vain luettavissa.").font(.caption).foregroundStyle(.secondary).padding()
                            .accessibilityIdentifier("viestit-vain-luku")
                    }
                } else {
                    Spacer()
                    VStack(spacing: Teema.Vali.l) {
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
            ToolbarItem(placement: .topBarTrailing) { KayttorajaRenkaat(raja: kayttoraja) }
            // Kolme pistettä kuten Claude-äpissä (käyttäjä 13.10.2026), avaa skoopin tiedot.
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink(value: SkooppiReitti.tiedot(nimi)) { Image(systemName: "ellipsis") }
                    .accessibilityLabel("Skoopin tiedot")
                    .accessibilityIdentifier("tiedot")
            }
        }
        .task {
            // Käyttöraja minuutin välein: palvelu välimuistittaa, eikä rengas tarvitse tarkempaa.
            while !Task.isCancelled {
                if let k = try? await asiakas.kayttoraja() { kayttoraja = k }
                try? await Task.sleep(for: .seconds(60))
            }
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
        lahettaa = true
        pysaytetty = false
        do {
            // Liitteet ensin palveluun; viesti lähtee vasta, kun kaikki polut ovat tiedossa (kortin vastaus ilman liitteitä).
            var polut: [String] = []
            if kortista == nil { for l in liitteet { polut.append(try await asiakas.lahetaLiite(nimi, l).polku) } }
            let viesti = kortista ?? Liite.viesti(teksti.trimmingCharacters(in: .whitespacesAndNewlines), polut: polut)
            _ = try await asiakas.laheta(nimi, viesti)
            if kortista == nil { teksti = ""; liitteet = [] }
            virhe = nil
            try? await Task.sleep(for: .seconds(1))
            await lataa()
        } catch {
            virhe = error.localizedDescription
        }
        lahettaa = false
    }

    // Stop: palvelu lähettää istunnolle Escapen. Toinen Escape vapaassa istunnossa avaisi Clauden paluuvalikon, joten
    // nappi ei toimi uudelleen ennen kuin tila on luettu; 409 = istunto ehti jo vapautua.
    private func pysayta() async {
        guard !pysaytetaan else { return }
        pysaytetaan = true
        defer { pysaytetaan = false }
        do { _ = try await asiakas.pysayta(nimi); pysaytetty = true; virhe = nil } catch {
            if case .palvelu(409, _)? = error as? Asiakas.Virhe {} else { virhe = error.localizedDescription }
        }
        try? await Task.sleep(for: .seconds(2))
        await lataa()
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

// Kortin simulaattorikoe (CHAT-QUESTION-YKSI-KERRALLAAN): SCOPES_KOE_KORTTI=1 avaa kiinteän kolmen kysymyksen kortin
// ilman palvelua, ja lähetetty vastaus näkyy tekstinä. Oikean istunnon kysymykseen vastaaminen kokeessa lähettäisi
// vastauksen agentille, joten moniosaisen kortin logiikka todennetaan tällä.
struct KysymysKoe: View {
    static let paalla = ProcessInfo.processInfo.environment["SCOPES_KOE_KORTTI"] == "1"
    @State private var vastaus: String?
    private let kysymykset = [
        Kysymys(kysymys: "Mikä on skoopin tarkoitus?", otsikko: "Tarkoitus", monivalinta: false,
                vaihtoehdot: [Vaihtoehto(nimi: "Kysymyskortti", kuvaus: "Monivalinta chatissa"), Vaihtoehto(nimi: "Muu", kuvaus: nil)]),
        Kysymys(kysymys: "Mitkä alustat?", otsikko: "Alustat", monivalinta: true,
                vaihtoehdot: [Vaihtoehto(nimi: "iPhone", kuvaus: nil), Vaihtoehto(nimi: "iPad", kuvaus: nil), Vaihtoehto(nimi: "Mac", kuvaus: nil)]),
        Kysymys(kysymys: "Aloitetaanko heti?", otsikko: "Aloitus", monivalinta: false,
                vaihtoehdot: [Vaihtoehto(nimi: "Kyllä", kuvaus: "Työ alkaa tässä keskustelussa"), Vaihtoehto(nimi: "Myöhemmin", kuvaus: nil)]),
    ]
    var body: some View {
        ScrollView {
            VStack(spacing: Teema.Vali.l) {
                if let vastaus {
                    Text(verbatim: vastaus).accessibilityIdentifier("koe-vastaus")
                } else {
                    KysymysKortti(kysymykset: kysymykset, vastaa: { vastaus = $0 }, sulje: { vastaus = "suljettu" })
                }
            }
            .padding()
        }
    }
}
