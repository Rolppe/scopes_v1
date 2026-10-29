import SwiftUI
import ScopesCore

public struct KayttorajaRenkaat: View {
    public let raja: Kayttoraja?
    public let malli: String?

    public init(raja: Kayttoraja?, malli: String? = nil) {
        self.raja = raja
        self.malli = malli
    }

    public var otsikkoTeksti: String {
        if let otsikko = raja?.otsikko, !otsikko.isEmpty {
            return otsikko
        }
        if let m = malli?.lowercased() {
            if m.contains("mac") { return "Mac AGY" }
            if m.contains("oneplus") || m.contains("linux") || m.contains("agy") { return "OnePlus Linux AGY" }
            if m.contains("claude") || m.contains("sonnet") || m.contains("opus") || m.contains("haiku") { return "Claude" }
            return malli ?? "Käyttöraja"
        }
        if let y = raja?.ymparisto?.lowercased() {
            if y.contains("mac") { return "Mac AGY" }
            if y.contains("oneplus") || y.contains("linux") { return "OnePlus Linux AGY" }
        }
        return "Käyttöraja"
    }

    public func rivi5h(nyt: Date = Date()) -> String {
        let p5 = raja?.viisiTuntia
        let p5Teksti = p5?.teksti ?? prosenttiTeksti(p5)
        let p5Reset = countdown(p5?.nollautuu, nyt: nyt).map { " Reset in \($0)" } ?? ""
        return "5h - \(p5Teksti) (yellow)\(p5Reset)"
    }

    public func riviVk(nyt: Date = Date()) -> String {
        let vk = raja?.viikko
        let vkTeksti = vk?.teksti ?? prosenttiTeksti(vk)
        let vkReset = countdown(vk?.nollautuu, nyt: nyt).map { " Reset \($0)" } ?? ""
        return "Vk - \(vkTeksti) (red)\(vkReset)"
    }

    public var body: some View {
        Menu {
            Section(otsikkoTeksti) {
                Text(rivi5h())
                if raja?.viikko != nil || raja == nil {
                    Text(riviVk())
                }
            }
        } label: {
            ZStack {
                rengas(raja?.viisiTuntia, vari: .yellow, koko: 28, paksuus: 3)
                rengas(raja?.viikko, vari: .red, koko: 16, paksuus: 2.5)
            }
            .frame(width: 32, height: 32)
        }
        .menuStyle(.borderlessButton)
        .accessibilityLabel(otsikkoTeksti)
        .accessibilityValue("\(rivi5h()), \(riviVk())")
        .accessibilityIdentifier("kayttoraja")
        .help("\(otsikkoTeksti)\n\(rivi5h())\n\(riviVk())")
    }

    private func rengas(_ r: Kayttoraja.Raja?, vari: Color, koko: CGFloat, paksuus: CGFloat) -> some View {
        ZStack {
            Circle()
                .stroke(vari.opacity(0.25), lineWidth: paksuus)
            Circle()
                .trim(from: 0, to: min(max((r?.kaytto ?? 0) / 100, 0), 1))
                .stroke(vari, style: StrokeStyle(lineWidth: paksuus, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
        .frame(width: koko, height: koko)
    }

    private func prosenttiTeksti(_ r: Kayttoraja.Raja?) -> String {
        guard let r else { return "0%" }
        if r.kaytto > 0 && r.kaytto < 1 {
            return String(format: "%.1f%%", r.kaytto)
        }
        return "\(Int(r.kaytto.rounded()))%"
    }

    private func jasennaPvm(_ str: String) -> Date? {
        let f1 = ISO8601DateFormatter()
        f1.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = f1.date(from: str) { return d }
        let f2 = ISO8601DateFormatter()
        f2.formatOptions = [.withInternetDateTime]
        return f2.date(from: str)
    }

    private func countdown(_ nollautuu: String?, nyt: Date = Date()) -> String? {
        guard let nollautuu, let kohdeAika = jasennaPvm(nollautuu) else { return nil }
        let erotus = kohdeAika.timeIntervalSince(nyt)
        if erotus <= 0 {
            return "0min"
        }
        let s = Int(erotus)
        let d = s / 86400
        let h = (s % 86400) / 3600
        let m = (s % 3600) / 60

        if d > 0 {
            return "\(d)d \(h)h \(m)min"
        } else if h > 0 {
            return "\(h)h \(m)min"
        } else {
            return "\(max(m, 1))min"
        }
    }
}
