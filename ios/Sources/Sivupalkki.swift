// Sivupalkki (DEMO-SCOPES-SIVUPALKKI, käyttäjä 13.10.2026): chatit ja skoopit yhtenä listana uusin muutos ensin,
// yksi haku molempiin. Chatin napautus avaa keskustelun chatissa, skoopin napautus skoopin viestit. Alareunassa
// infra ja asetukset; yläreunassa suodatin All / Scope / Chat ja uusi skooppi (DEMO-SCOPES-LISTA 13.10.2026: otsikko
// ja "Uusi chat" -rivi pois; uusi chat aloitetaan chatin omasta napista). Aika on palvelun pysähdysaika: keskustelu
// nousee huipulle, kun vuoro valmistuu tai agentti kysyy. Kansioikonin väri on skoopin tila (SCOPES-LISTA-TILAVARIT,
// käyttäjä 13.10.2026): käsittely oranssi ja hehkuu, käyttäjää odottava keltainen, pakattu harmaa ja aktiivisten alle.
import SwiftUI

private enum Kohde: Identifiable {
    case chat(ChatKeskustelu)
    case skooppi(SkooppiYhteenveto)

    var id: String {
        switch self {
        case let .chat(k): return "chat-\(k.id)"
        case let .skooppi(s): return "skooppi-\(s.nimi)"
        }
    }
    var aika: Date {
        switch self {
        case let .chat(k): return isoPaiva(k.aika) ?? .distantPast
        case let .skooppi(s): return isoPaiva(s.aika) ?? .distantPast
        }
    }
    // Pakattu skooppi valuu aktiivisten (chatit ja auki olevat skoopit) alapuolelle.
    var aktiivinen: Bool {
        if case let .skooppi(s) = self { return s.tilaNyt != "pakattu" }
        return true
    }
    func kuuluu(_ s: Suodatin) -> Bool {
        switch (s, self) {
        case (.kaikki, _), (.skoopit, .skooppi), (.chatit, .chat): return true
        default: return false
        }
    }
    func osuu(_ haku: String) -> Bool {
        switch self {
        case let .chat(k): return k.otsikko.localizedCaseInsensitiveContains(haku)
        case let .skooppi(s): return s.nimi.localizedCaseInsensitiveContains(haku)
        }
    }
}

private enum Suodatin: String, CaseIterable {
    case kaikki = "All", skoopit = "Scope", chatit = "Chat"
}

struct Sivupalkki: View {
    let auki: Bool
    @EnvironmentObject private var asetukset: Asetukset
    @EnvironmentObject private var navigaatio: Navigaatio
    @State private var skoopit: [SkooppiYhteenveto] = []
    @State private var chatit: [ChatKeskustelu] = []
    @State private var agentit: [Agentti] = []
    @State private var virhe: String?
    @State private var haku = ""
    @AppStorage("sivupalkinSuodatin") private var suodatin: Suodatin = .kaikki

    private var asiakas: Asiakas { Asiakas(osoite: asetukset.osoite, avain: asetukset.avain) }

    private var kohteet: [Kohde] {
        let kaikki = (chatit.map(Kohde.chat) + skoopit.map(Kohde.skooppi)).filter { $0.kuuluu(suodatin) }
        let h = haku.trimmingCharacters(in: .whitespaces)
        return (h.isEmpty ? kaikki : kaikki.filter { $0.osuu(h) })
            .sorted { $0.aktiivinen != $1.aktiivinen ? $0.aktiivinen : $0.aika > $1.aika }
    }

    var body: some View {
        NavigationStack {
            List {
                if let virhe { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("sivupalkki-virhe") }
                Section {
                    ForEach(kohteet) { k in
                        Button { valitse(k) } label: { rivi(k).contentShape(Rectangle()) }
                            .buttonStyle(.plain)
                            .listRowBackground(valittu(k) ? Color.accentColor.opacity(0.15) : nil)
                            .accessibilityIdentifier(k.id)
                    }
                }
            }
            .listStyle(.plain)
            // Ohut reunaviiva erottaa palkin chatista (käyttäjä 13.10.2026, kuten Claude-äpissä). Alkaa haun alta
            // listan yläreunasta: yläreunan turva-alue on navigointipalkki ja haku.
            .overlay(alignment: .trailing) {
                Rectangle().fill(Color(.systemGray3)).frame(width: 1).ignoresSafeArea(edges: .bottom)
            }
            .searchable(text: $haku, placement: .navigationBarDrawer(displayMode: .always), prompt: "Hae chateista ja skoopeista")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) { suodatinNapit }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { navigaatio.uusiSkooppiAuki = true } label: { Image(systemName: "plus") }
                        .accessibilityIdentifier("uusi")
                }
                ToolbarItemGroup(placement: .bottomBar) {
                    Button { navigaatio.avaa(.infra) } label: { Label("Infra", systemImage: "point.3.connected.trianglepath.dotted") }
                        .labelStyle(.titleAndIcon)
                        .accessibilityIdentifier("sivupalkki-infra")
                    Spacer()
                    Button { navigaatio.asetuksetAuki = true } label: { Label("Asetukset", systemImage: "gearshape") }
                        .labelStyle(.titleAndIcon)
                        .accessibilityIdentifier("asetukset")
                }
            }
            .refreshable { await lataa() }
        }
        .task(id: "\(auki)" + asetukset.osoite + asetukset.avain) { if auki || chatit.isEmpty && skoopit.isEmpty { await lataa() } }
    }

    // Kolme rinnakkaista nappia otsikon paikalla; valittu korostettu.
    private var suodatinNapit: some View {
        HStack(spacing: 8) {
            ForEach(Suodatin.allCases, id: \.self) { s in
                Button { suodatin = s } label: {
                    Text(s.rawValue).font(.body.weight(.semibold)).padding(.horizontal, 20).padding(.vertical, 8)
                        .foregroundStyle(suodatin == s ? Color.white : Color.primary)
                        .background(suodatin == s ? Color.claude : Color(.systemGray5), in: Capsule())
                        .contentShape(Capsule())
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("suodatin-\(s.rawValue.lowercased())")
                .accessibilityAddTraits(suodatin == s ? .isSelected : [])
            }
        }
    }

    private func valittu(_ k: Kohde) -> Bool {
        switch k {
        case let .chat(c): return navigaatio.nakyma == .chat && navigaatio.nykyinenChat == c.id
        case let .skooppi(s): return navigaatio.nakyma == .skooppi(s.nimi)
        }
    }

    private func valitse(_ k: Kohde) {
        switch k {
        case let .chat(c): navigaatio.avaaChat(c.id)
        case let .skooppi(s): navigaatio.avaa(.skooppi(s.nimi))
        }
    }

    @ViewBuilder private func rivi(_ k: Kohde) -> some View {
        switch k {
        case let .chat(c):
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "bubble.left").foregroundStyle(.secondary).frame(width: 22)
                VStack(alignment: .leading, spacing: 3) {
                    Text(c.otsikko).font(.body).lineLimit(2)
                    Text([agentit.first { $0.nimi == c.agentti }?.otsikko ?? c.agentti, paiva(c.aika)].compactMap { $0 }.joined(separator: " · "))
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
        case let .skooppi(s):
            HStack(alignment: .top, spacing: 10) {
                KansioIkoni(tila: s.tilaNyt).frame(width: 22)
                SkooppiRivi(skooppi: s)
            }
        }
    }

    private func paiva(_ iso: String) -> String? { isoPaiva(iso)?.formatted(date: .abbreviated, time: .shortened) }

    // Skoopit ja chatit haetaan rinnakkain; kumpikin näkyy, vaikka toinen epäonnistuu.
    private func lataa() async {
        guard asetukset.valmis else { virhe = "Anna palvelimen osoite ja avain asetuksissa."; return }
        async let s = asiakas.skoopit()
        async let c = asiakas.keskustelut()
        async let a = asiakas.agentit()
        var virheet: [String] = []
        do { skoopit = try await s } catch { virheet.append(error.localizedDescription) }
        do { chatit = try await c } catch { virheet.append(error.localizedDescription) }
        agentit = (try? await a) ?? agentit
        virhe = virheet.isEmpty ? nil : Array(Set(virheet)).joined(separator: "\n")
    }
}

// Skoopin kansioikoni tilan mukaan; käsittelyssä oranssi hehku sykkii.
private struct KansioIkoni: View {
    let tila: String
    var body: some View {
        switch tila {
        case "kasittely":
            Image(systemName: "folder.fill").foregroundStyle(Color.claude)
                .phaseAnimator([false, true]) { ikoni, hehku in
                    ikoni.shadow(color: Color.claude.opacity(hehku ? 0.95 : 0.25), radius: hehku ? 7 : 2)
                } animation: { _ in .easeInOut(duration: 0.9) }
                .accessibilityLabel("käsittelyssä")
        case "odottaa":
            Image(systemName: "folder.fill").foregroundStyle(.yellow).accessibilityLabel("odottaa vastausta")
        default:
            Image(systemName: "folder").foregroundStyle(Color(.systemGray)).accessibilityLabel("pakattu")
        }
    }
}
