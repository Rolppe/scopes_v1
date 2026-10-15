// Yhteyden reitti (SCOPES-ETAYHTEYS 14.10.2026): kotiverkossa suoraan palvelun osoitteeseen, kodin ulkopuolella
// äpin oman WireGuard-tunnelin läpi (Tunneli.xcframework, tunneli/tunneli.go) ilman erillistä VPN-äppiä.
// Tunnelin asetus haetaan palvelulta (/api/wg-asetus) aina kun kotiverkko vastaa, ja se tallennetaan avainnippuun.
// Valinta pysyy, kunnes yhteys katkeaa tai äppi palaa etualalle; sitten kotiverkko kokeillaan uudelleen.
// UI-testi pakottaa tunnelin ympäristömuuttujalla SCOPES_TUNNELI=pakota.
import Foundation
import Tunneli

actor Reitti {
    static let jaettu = Reitti()

    enum Tila: Equatable { case tuntematon, koti, tunneli, eiTunnelia }

    private var valittu: (perus: String, tehtava: Task<String, Never>)?
    private(set) var tila = Tila.tuntematon
    private var avaaPortti = false
    private let pakota = ProcessInfo.processInfo.environment["SCOPES_TUNNELI"] == "pakota"

    // Osoite, johon pyyntö lähetetään: `perus` kotiverkossa, muuten tunnelin paikallinen portti.
    func osoite(_ perus: String, avain: String) async -> String {
        if let v = valittu, v.perus == perus { return await v.tehtava.value }
        let t = Task { await valitse(perus, avain: avain) }
        valittu = (perus, t)
        return await t.value
    }

    // Katkos unohtaa reitin. -1004 tunnelin portissa tarkoittaa, että iOS otti jäädytetyn äpin kuuntelijan eikä Accept
    // ole vielä huomannut sitä: portti avataan uudelleen ennen seuraavaa pyyntöä. Ajastetut haut laukeavat ennen
    // heraa()-kutsua, ja uusinta sai muuten saman kuolleen portin (V-487 todennus 15.10.2026).
    func unohda(_ virhe: Error? = nil) {
        if tila == .tunneli, (virhe as? URLError)?.code == .cannotConnectToHost { avaaPortti = true }
        valittu = nil
    }

    // Etualalle palatessa verkko on voinut vaihtua: UDP-pistoke ja DDNS-nimi uudelleen, reitti valitaan uudelleen.
    func heraa() {
        valittu = nil
        TunneliPaivita(nil)
    }

    private func valitse(_ perus: String, avain: String) async -> String {
        let koti = await vastaa(perus)
        if koti { await haeAsetus(perus, avain: avain) }
        if koti && !pakota {
            tila = .koti
            return perus
        }
        guard let asetus = Avainnippu.lue("wg"), let url = URL(string: perus), let isanta = url.host() else {
            tila = .eiTunnelia
            return perus
        }
        // gomobilen vapaat funktiot eivät muunnu Swiftin throwsiksi: virhe tulee NSError-osoittimeen.
        if avaaPortti {
            avaaPortti = false
            TunneliPaivita(nil)
        }
        var portti = 0
        var virhe: NSError?
        guard TunneliKaynnista(asetus, "\(isanta):\(url.port ?? 80)", &portti, &virhe) else {
            tila = .eiTunnelia
            return perus
        }
        tila = .tunneli
        return "http://127.0.0.1:\(portti)"
    }

    private func vastaa(_ perus: String) async -> Bool {
        guard let url = URL(string: perus.trimmingCharacters(in: CharacterSet(charactersIn: "/ ")) + "/api/terveys") else { return false }
        let pyynto = URLRequest(url: url, timeoutInterval: 1.5)
        let koodi = try? await URLSession(configuration: .ephemeral).data(for: pyynto).1
        return (koodi as? HTTPURLResponse)?.statusCode == 200
    }

    private func haeAsetus(_ perus: String, avain: String) async {
        guard let url = URL(string: perus.trimmingCharacters(in: CharacterSet(charactersIn: "/ ")) + "/api/wg-asetus") else { return }
        var pyynto = URLRequest(url: url, timeoutInterval: 5)
        pyynto.setValue("Bearer \(avain)", forHTTPHeaderField: "Authorization")
        guard let (data, vastaus) = try? await URLSession(configuration: .ephemeral).data(for: pyynto),
              (vastaus as? HTTPURLResponse)?.statusCode == 200,
              let asetus = (try? JSONDecoder().decode([String: String].self, from: data))?["asetus"],
              asetus != Avainnippu.lue("wg") else { return }
        Avainnippu.tallenna(asetus, tili: "wg")
    }
}
