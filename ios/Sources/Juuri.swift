// Näkymät (DEMO-SCOPES-SIVUPALKKI, käyttäjän määrittely 13.10.2026): pääsivu on chat. Chatit ja skoopit ovat yhdessä
// listassa sivupalkissa, joka aukeaa vasemman yläkulman nuolesta tai vetämällä sivuttain missä kohtaa tahansa;
// samassa palkissa ovat uusi chat, uusi skooppi, infra ja asetukset (aiemmin kolmen pisteen valikko ja chatin kello).
// Chat ja infra pysyvät muistissa vaihdon yli, jotta kesken oleva vastaus ja avattu puu eivät katoa.
import SwiftUI

@main
struct SkoopitApp: App {
    @StateObject private var asetukset = Asetukset()
    @StateObject private var navigaatio = Navigaatio()
    var body: some Scene {
        WindowGroup { JuuriView().environmentObject(asetukset).environmentObject(navigaatio) }
    }
}

enum Paanakyma: Hashable {
    case chat, infra
    case skooppi(String)
}

struct ChatPyynto: Equatable {
    let id: String?
    let n: Int
}

final class Navigaatio: ObservableObject {
    @Published var nakyma: Paanakyma = .chat
    @Published var sivupalkkiAuki = false
    @Published var asetuksetAuki = false
    @Published var uusiSkooppiAuki = false
    // Sivupalkki pyytää chatia avaamaan keskustelun (tunnus) tai aloittamaan uuden (nil); laskuri erottaa toistot.
    @Published var chatPyynto = ChatPyynto(id: nil, n: 0)
    // Chat kertoo auki olevan keskustelunsa, jotta sivupalkki korostaa sen.
    @Published var nykyinenChat: String?

    func avaa(_ n: Paanakyma) {
        nakyma = n
        sivupalkkiAuki = false
    }

    func avaaChat(_ id: String?) {
        chatPyynto = ChatPyynto(id: id, n: chatPyynto.n + 1)
        avaa(.chat)
    }
}

struct JuuriView: View {
    @EnvironmentObject private var navigaatio: Navigaatio
    @State private var veto: CGFloat = 0
    @State private var fokus = Fokusmuisti()

    var body: some View {
        GeometryReader { g in
            let leveys = min(g.size.width * 0.85, 340)
            let siirto = navigaatio.sivupalkkiAuki ? max(0, leveys + min(0, veto)) : min(leveys, max(0, veto))
            ZStack(alignment: .leading) {
                ZStack {
                    ChatView().nakyvissa(navigaatio.nakyma == .chat)
                    InfraView().nakyvissa(navigaatio.nakyma == .infra)
                    if case let .skooppi(nimi) = navigaatio.nakyma {
                        NavigationStack {
                            SkooppiViestitView(nimi: nimi)
                                .toolbar { Sivupalkkipainike() }
                                .navigationDestination(for: SkooppiReitti.self) { $0.nakyma }
                        }
                        .id(nimi)
                    }
                }
                // Sivuttaisveto missä kohtaa tahansa avaa palkin (käyttäjä 13.10.2026).
                .gesture(vetoEle(leveys))
                Color.black.opacity(0.3 * siirto / leveys).ignoresSafeArea()
                    .allowsHitTesting(navigaatio.sivupalkkiAuki)
                    .onTapGesture { withAnimation(.snappy) { navigaatio.sivupalkkiAuki = false } }
                    .gesture(vetoEle(leveys))
                Sivupalkki(auki: navigaatio.sivupalkkiAuki)
                    .frame(width: leveys)
                    .offset(x: siirto - leveys)
                    .gesture(vetoEle(leveys))
                    .accessibilityHidden(!navigaatio.sivupalkkiAuki)
            }
        }
        // Käynnistys (käyttäjä 13.10.2026): kun mikään keskustelu ei ole kesken, äppi aukeaa listaan eikä tyhjään chattiin.
        // Juurinäkymä ilmestyy kerran käynnistyksessä, joten paluu taustalta ei avaa palkkia.
        .task { if navigaatio.nakyma == .chat && navigaatio.nykyinenChat == nil { navigaatio.sivupalkkiAuki = true } }
        .onChange(of: navigaatio.sivupalkkiAuki) { _, auki in auki ? fokus.piilota(navigaatio) : fokus.palauta(navigaatio) }
        .sheet(isPresented: $navigaatio.asetuksetAuki) { AsetuksetView() }
        .sheet(isPresented: $navigaatio.uusiSkooppiAuki) { UusiSkooppiView() }
    }

    // Veto oikealle avaa, vasemmalle sulkee; yli kolmannes leveydestä (tai nopea heitto) ratkaisee.
    private func vetoEle(_ leveys: CGFloat) -> SivuttaisVeto {
        SivuttaisVeto(
            muuttui: { x in
                // Veto alkaa avata palkkia: näppäimistö pois heti, ettei se peitä palkin alaosaa vedon aikana.
                if veto == 0, !navigaatio.sivupalkkiAuki { fokus.piilota(navigaatio) }
                var ilman = Transaction()
                ilman.disablesAnimations = true
                withTransaction(ilman) { veto = x }
            },
            loppui: { x, nopeus in
                let auki = navigaatio.sivupalkkiAuki
                let nyt = auki ? max(0, leveys + min(0, x)) : min(leveys, max(0, x))
                let matka = x + nopeus * 0.2
                let uusi = auki ? matka >= -leveys / 3 : matka > leveys / 3
                // Nopea heitto jatkaa sormen nopeudella suoraviivaisesti perille (käyttäjä 13.10.2026: "nopealla liikkeellä
                // takkuaa", jousen jarrutus "kaipaa suoraviivaista liikettä"); hidas irrotus asettuu jousella.
                let jaljella = (uusi ? leveys : 0) - nyt
                let animaatio: Animation
                if abs(jaljella) >= 1, nopeus * jaljella > 0, abs(nopeus) > 400 {
                    animaatio = .linear(duration: min(max(abs(jaljella / nopeus), 0.06), 0.25))
                } else {
                    animaatio = .snappy(duration: 0.3)
                }
                withAnimation(animaatio) {
                    navigaatio.sivupalkkiAuki = uusi
                    veto = 0
                }
                // Avausveto jäi kesken: palkin tila ei muuttunut, joten onChange ei palauta kenttää.
                if !auki && !uusi { fokus.palauta(navigaatio) }
            })
    }
}

// Sivupalkin avaus piilottaa näppäimistön ja muistaa kirjoituskentän (käyttäjä 13.10.2026). Kun palkki sulkeutuu samaan
// keskusteluun (himmennyksen napautus, veto tai saman rivin valinta), kursori palaa samaan kenttään samaan kohtaan ja
// näppäimistö takaisin; toiseen näkymään tai keskusteluun vaihto unohtaa kentän. Chatin tunnus päivittyy vasta
// latauksen jälkeen, joten vaihto tunnistetaan sivupalkin pyynnöstä.
@MainActor final class Fokusmuisti {
    private weak var kentta: UIResponder?
    private var valinta: UITextRange?
    private var nakyma: Paanakyma?
    private var chat: String?
    private var pyynto = 0

    func piilota(_ n: Navigaatio) {
        guard kentta == nil, let r = UIResponder.nykyinen, r is UITextInput else { return }
        kentta = r
        valinta = (r as? UITextInput)?.selectedTextRange
        nakyma = n.nakyma
        chat = n.nykyinenChat
        pyynto = n.chatPyynto.n
        r.resignFirstResponder()
    }

    func palauta(_ n: Navigaatio) {
        defer { kentta = nil; valinta = nil }
        guard let r = kentta, n.nakyma == nakyma, !n.asetuksetAuki, !n.uusiSkooppiAuki,
              n.chatPyynto.n == pyynto || n.chatPyynto.id == chat,
              (r as? UIView)?.window != nil else { return }
        r.becomeFirstResponder()
        if let valinta, let t = r as? UITextInput { t.selectedTextRange = valinta }
    }
}

extension UIResponder {
    private static weak var loydetty: UIResponder?
    // Nykyinen ensimmäinen vastaaja: kohteeton toiminto menee sille, ja se kirjaa itsensä.
    static var nykyinen: UIResponder? {
        loydetty = nil
        UIApplication.shared.sendAction(#selector(kirjaaItsensa), to: nil, from: nil, for: nil)
        return loydetty
    }
    @objc private func kirjaaItsensa() { UIResponder.loydetty = self }
}

// Sivuttaisveto UIKitin pan-eleenä (käyttäjä 13.10.2026: SwiftUI:n DragGesture "ei seuraa sormen liikettä
// reaaliaikaisesti" – se kilpaili chatin ja listan vierityksen kanssa). Ele alkaa vasta, kun liike on selvästi
// vaakasuora (yli 2 × pystynopeus), joten painallus ei koskaan avaa palkkia ja pystyveto jää vieritykseksi;
// vieritykset odottavat tämän eleen ratkaisun, eivätkä kilpaile siitä vedon aikana.
struct SivuttaisVeto: UIGestureRecognizerRepresentable {
    let muuttui: (CGFloat) -> Void
    let loppui: (CGFloat, CGFloat) -> Void

    func makeCoordinator(converter: CoordinateSpaceConverter) -> Valvoja { Valvoja() }

    func makeUIGestureRecognizer(context: Context) -> UIPanGestureRecognizer {
        let p = UIPanGestureRecognizer()
        p.delegate = context.coordinator
        return p
    }

    func handleUIGestureRecognizerAction(_ p: UIPanGestureRecognizer, context: Context) {
        // Ikkunan koordinaatit: palkki liikkuu sormen alla, joten oma näkymä ei kelpaa mittapuuksi.
        let x = p.translation(in: nil).x
        switch p.state {
        case .began, .changed: muuttui(x)
        case .ended, .cancelled, .failed: loppui(x, p.velocity(in: nil).x)
        default: break
        }
    }

    final class Valvoja: NSObject, UIGestureRecognizerDelegate {
        func gestureRecognizerShouldBegin(_ g: UIGestureRecognizer) -> Bool {
            guard let p = g as? UIPanGestureRecognizer else { return false }
            let v = p.velocity(in: nil)
            return abs(v.x) > 2 * abs(v.y)
        }
        // Tekstikentän kosketukset kuuluvat kentälle: kursorin raahaus ja valinta (kopioi, leikkaa, liitä) katkesivat,
        // kun vaakaveto otti ne (käyttäjä 13.10.2026).
        func gestureRecognizer(_ g: UIGestureRecognizer, shouldReceive kosketus: UITouch) -> Bool {
            var n = kosketus.view
            while let v = n { if v is UITextView || v is UITextField { return false }; n = v.superview }
            return true
        }
        func gestureRecognizer(_ g: UIGestureRecognizer, shouldBeRequiredToFailBy toinen: UIGestureRecognizer) -> Bool {
            toinen.view is UIScrollView
        }
    }
}

// Vasemman yläkulman nuoli: avaa sivupalkin. Jokainen päänäkymä lisää sen työkalupalkkinsa vasempaan reunaan.
struct Sivupalkkipainike: ToolbarContent {
    @EnvironmentObject private var navigaatio: Navigaatio
    var body: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button { withAnimation(.snappy) { navigaatio.sivupalkkiAuki = true } } label: { Image(systemName: "chevron.left") }
                .accessibilityIdentifier("sivupalkki")
        }
    }
}

private extension View {
    func nakyvissa(_ nakyy: Bool) -> some View {
        opacity(nakyy ? 1 : 0).allowsHitTesting(nakyy).accessibilityHidden(!nakyy)
    }
}

// Skoopin navigointikohteet: viestit (skoopit-välilehden napautus) ja tiedot (infra ja viestinäkymän i-painike).
enum SkooppiReitti: Hashable {
    case viestit(String)
    case tiedot(String)

    @ViewBuilder var nakyma: some View {
        switch self {
        case let .viestit(nimi): SkooppiViestitView(nimi: nimi)
        case let .tiedot(nimi): SkooppiNakymaView(nimi: nimi)
        }
    }
}
