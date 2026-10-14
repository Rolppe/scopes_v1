// Näkymät (DEMO-SCOPES-SIVUPALKKI, käyttäjän määrittely 13.10.2026): pääsivu on chat. Chatit ja skoopit ovat yhdessä
// listassa sivupalkissa, joka aukeaa vasemman yläkulman nuolesta tai vetämällä sivuttain missä kohtaa tahansa;
// samassa palkissa ovat uusi chat, uusi skooppi, infra ja asetukset (aiemmin kolmen pisteen valikko ja chatin kello).
// Chat ja infra pysyvät muistissa vaihdon yli, jotta kesken oleva vastaus ja avattu puu eivät katoa.
import CoreImage
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

    // Toiminnon tuloksen "Avaa chat" (käyttäjä 14.10.2026): skoopin viestit alusta, vaikka sama skooppi olisi jo auki
    // ja sen tiedot pinossa; laskuri vaihtaa pinon identiteetin, jolloin viestit latautuvat uudesta istunnosta.
    @Published var skooppiAvaus = 0

    func avaaSkooppi(_ nimi: String) {
        skooppiAvaus += 1
        avaa(.skooppi(nimi))
    }
}

struct JuuriView: View {
    @EnvironmentObject private var navigaatio: Navigaatio
    @State private var veto: CGFloat = 0
    @State private var fokus = Fokusmuisti()
    @State private var sumea: UIImage?
    // Vedon alussa otettu kuva kelpaa vedon päättävään avaukseen; painikkeen avaus ottaa omansa.
    @State private var sumeaVedosta = false

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
                        .id("\(nimi)#\(navigaatio.skooppiAvaus)")
                    }
                }
                // Sivuttaisveto missä kohtaa tahansa avaa palkin (käyttäjä 13.10.2026).
                .gesture(vetoEle(leveys))
                // Palkin ollessa esillä päänäkymä on sumea (käyttäjä 13.10.2026): sumeus seuraa palkin siirtoa, joten se
                // tulee ja haihtuu samaa tahtia kuin palkki liukuu, myös vedon aikana sormen mukana. Sumea kuva otetaan kerran
                // avauksen alussa ja vain sen läpinäkyvyys muuttuu: .blur ja materiaali laskivat sumeuden joka ruudulla ("raskas").
                // Sumeus vain liikeradan viimeisellä 30 %:lla (käyttäjä 13.10.2026).
                ZStack {
                    if let sumea, Mittari.sumeus {
                        Image(uiImage: sumea).resizable().opacity(max(0, siirto / leveys - 0.7) / 0.3)
                    }
                    Color.black.opacity(0.3 * siirto / leveys)
                }
                    .ignoresSafeArea()
                    .allowsHitTesting(navigaatio.sivupalkkiAuki)
                    .onTapGesture { withAnimation(.snappy) { navigaatio.sivupalkkiAuki = false } }
                    .gesture(vetoEle(leveys))
                Sivupalkki(auki: navigaatio.sivupalkkiAuki)
                    .equatable()
                    .frame(width: leveys)
                    // Siirto piirtovaiheen efektinä, ei asettelussa: .offset siirsi palkin UIKit-näkymien kehystä joka
                    // ruudulla, ja navigointi- ja listanäkymät asettelivat itsensä uudelleen (SCOPES-LISTA-SUMEUS).
                    .visualEffect { [x = siirto - leveys] sisalto, _ in sisalto.offset(x: x) }
                    .gesture(vetoEle(leveys))
                    .accessibilityHidden(!navigaatio.sivupalkkiAuki)
                if Mittari.paalla { MittariTulos() }
            }
        }
        // Käynnistys (käyttäjä 13.10.2026): kun mikään keskustelu ei ole kesken, äppi aukeaa listaan eikä tyhjään chattiin.
        // Juurinäkymä ilmestyy kerran käynnistyksessä, joten paluu taustalta ei avaa palkkia.
        .task { if navigaatio.nakyma == .chat && navigaatio.nykyinenChat == nil { navigaatio.sivupalkkiAuki = true } }
        .task { if Mittari.itseajo { await itseajo() } }
        .onChange(of: navigaatio.sivupalkkiAuki) { _, auki in
            if auki && !sumeaVedosta { sumea = Mittari.jaettu.kuva(Sumennus.kuva) }
            sumeaVedosta = false
            auki ? fokus.piilota(navigaatio) : fokus.palauta(navigaatio)
        }
        .sheet(isPresented: $navigaatio.asetuksetAuki) { AsetuksetView() }
        .sheet(isPresented: $navigaatio.uusiSkooppiAuki) { UusiSkooppiView() }
    }

    // Mittarin itseajo (SCOPES_MITTARI=itse, SCOPES-LISTA-SUMEUS 13.10.2026): äppi vetää palkin itse auki ja kiinni
    // kolmesti samalla eleellä kuin sormi, ilman XCUITestiä, jonka odotukset ja elementtiluvut pysäyttivät pääsäikeen
    // mittausikkunassa. Tulos Documents/mittaus.txt:iin (simctl get_app_container … data).
    private func itseajo() async {
        guard let ikkuna = UIApplication.shared.connectedScenes.compactMap({ ($0 as? UIWindowScene)?.keyWindow }).first
        else { return }
        let leveys = min(ikkuna.bounds.width * 0.85, 340)
        let ele = vetoEle(leveys)
        try? await Task.sleep(for: .seconds(5))
        if navigaatio.sivupalkkiAuki { navigaatio.sivupalkkiAuki = false }
        try? await Task.sleep(for: .seconds(1))
        var rivit: [String] = []
        for _ in 0..<3 {
            for suunta: CGFloat in [1, -1] {
                for i in 1...24 {
                    ele.muuttui(suunta * leveys * 0.9 * CGFloat(i) / 24)
                    try? await Task.sleep(for: .milliseconds(16))
                }
                ele.loppui(suunta * leveys * 0.9, suunta * 600)
                try? await Task.sleep(for: .seconds(1.5))
                rivit.append((suunta > 0 ? "avaus " : "sulku ") + Mittari.jaettu.tulos)
            }
        }
        let polku = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("mittaus.txt")
        try? (rivit.joined(separator: "\n") + "\n").write(to: polku, atomically: true, encoding: .utf8)
    }

    // Veto oikealle avaa, vasemmalle sulkee; yli kolmannes leveydestä (tai nopea heitto) ratkaisee.
    private func vetoEle(_ leveys: CGFloat) -> SivuttaisVeto {
        SivuttaisVeto(
            muuttui: { x in
                // Veto alkaa avata palkkia: näppäimistö pois heti, ettei se peitä palkin alaosaa vedon aikana.
                if veto == 0 { Mittari.jaettu.alku() }
                if veto == 0, !navigaatio.sivupalkkiAuki {
                    sumea = Mittari.jaettu.kuva(Sumennus.kuva)
                    sumeaVedosta = true
                    fokus.piilota(navigaatio)
                }
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
                if !auki && !uusi { sumeaVedosta = false; fokus.palauta(navigaatio) }
                Mittari.jaettu.loppu()
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

// Päänäkymän sumea kuva palkin taustaksi: ikkunan kuva neljäsosakoossa, sumennus kerran (käyttäjä 13.10.2026).
// Kuva otetaan ennen kuin palkki on ruudulla, joten siinä on vain päänäkymä.
@MainActor enum Sumennus {
    private static let konteksti = CIContext()

    static func kuva() -> UIImage? {
        guard let ikkuna = UIApplication.shared.connectedScenes
            .compactMap({ ($0 as? UIWindowScene)?.keyWindow }).first else { return nil }
        let koko = CGSize(width: ikkuna.bounds.width / 4, height: ikkuna.bounds.height / 4)
        let muoto = UIGraphicsImageRendererFormat()
        muoto.scale = 1
        let pieni = UIGraphicsImageRenderer(size: koko, format: muoto).image { _ in
            ikkuna.drawHierarchy(in: CGRect(origin: .zero, size: koko), afterScreenUpdates: false)
        }
        guard let ci = CIImage(image: pieni) else { return nil }
        let tulos = ci.clampedToExtent().applyingGaussianBlur(sigma: 1.2).cropped(to: ci.extent)
        guard let cg = konteksti.createCGImage(tulos, from: ci.extent) else { return nil }
        return UIImage(cgImage: cg)
    }
}

// Sivupalkin vedon ruutuajat (SCOPES-LISTA-SUMEUS 13.10.2026): vain kun SCOPES_MITTARI=1. Vedon alusta 0,6 s sen
// päättymisen yli kirjataan ruutujen välit ja sumean kuvan teko; UI-testi lukee tuloksen näkymättömän "mittari"-
// elementin nimiöstä. SCOPES_SUMEUS=0 jättää sumean kuvan pois, jotta sumeuden osuus erottuu.
@MainActor final class Mittari: NSObject, ObservableObject {
    static let jaettu = Mittari()
    static let paalla = ["1", "itse"].contains(ProcessInfo.processInfo.environment["SCOPES_MITTARI"])
    static let itseajo = ProcessInfo.processInfo.environment["SCOPES_MITTARI"] == "itse"
    static let sumeus = ProcessInfo.processInfo.environment["SCOPES_SUMEUS"] != "0"
    @Published private(set) var tulos = ""
    private var linkki: CADisplayLink?
    private var edellinen: CFTimeInterval = 0
    private var valit: [(hetki: CFTimeInterval, ms: Double)] = []
    private var irrotus: CFTimeInterval = .infinity
    private var kuvaMs: Double = 0
    private var lopetus: DispatchWorkItem?
    private var n = 0

    func kuva(_ f: () -> UIImage?) -> UIImage? {
        let a = CACurrentMediaTime()
        defer { kuvaMs = (CACurrentMediaTime() - a) * 1000 }
        return f()
    }

    func alku() {
        guard Self.paalla else { return }
        lopetus?.cancel()
        guard linkki == nil else { return }
        valit = []
        edellinen = 0
        irrotus = .infinity
        kuvaMs = 0
        let l = CADisplayLink(target: self, selector: #selector(ruutu))
        l.add(to: .main, forMode: .common)
        linkki = l
    }

    @objc private func ruutu(_ l: CADisplayLink) {
        if edellinen > 0 { valit.append((l.timestamp, (l.timestamp - edellinen) * 1000)) }
        edellinen = l.timestamp
    }

    func loppu() {
        guard linkki != nil else { return }
        irrotus = CACurrentMediaTime()
        lopetus?.cancel()
        let w = DispatchWorkItem { [weak self] in self?.kirjaa() }
        lopetus = w
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6, execute: w)
    }

    private func kirjaa() {
        guard let l = linkki else { return }
        let jakso = (l.targetTimestamp - l.timestamp) * 1000
        l.invalidate()
        linkki = nil
        n += 1
        // Veto = sormen liike irrotukseen asti, jalki = irrotuksen jälkeinen animaatio ja 0,6 s lepo.
        func osa(_ v: [Double]) -> String {
            let pitkat = v.filter { $0 > 1.5 * jakso }
            return String(format: "ruutuja=%d max=%.1f yli1.5x=%d pitkat=%.0f", v.count, v.max() ?? 0, pitkat.count,
                          pitkat.reduce(0, +))
        }
        tulos = String(format: "n=%d jakso=%.1f kuva=%.1f sumeus=%@ | veto %@ | jalki %@", n, jakso, kuvaMs,
                       Self.sumeus ? "on" : "pois", osa(valit.filter { $0.hetki <= irrotus }.map(\.ms)),
                       osa(valit.filter { $0.hetki > irrotus }.map(\.ms)))
    }
}

struct MittariTulos: View {
    @ObservedObject private var m = Mittari.jaettu
    var body: some View {
        Color.clear.frame(width: 1, height: 1)
            .accessibilityElement()
            .accessibilityIdentifier("mittari")
            .accessibilityLabel(m.tulos)
            .allowsHitTesting(false)
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
