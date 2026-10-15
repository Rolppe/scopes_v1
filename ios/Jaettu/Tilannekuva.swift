// Äpin ja lukitusnäytön widgetin yhteinen tilannekuva (NOTIFICATIONS-TAUSTA, käyttäjä 15.10.2026). Äppi kirjoittaa sen
// App Group -oletuksiin jokaisen haun jälkeen (etualan silmukka ja iOS:n ajoittama taustapäivitys), ja widget lukee sen
// verkkoa käyttämättä. Widget ei pysty hakemaan itse: palvelu näkyy kodin ulkopuolella vain äpin oman tunnelin kautta.
import Foundation

let sovellusRyhma = "group.com.example.skoopit"

struct Tilannekuva: Codable, Equatable {
    struct Rivi: Codable, Equatable {
        let nimi: String
        // kysely / odottaa / valmis: sama jako kuin äpin ilmoituksissa (Ilmoitukset.swift odottaa()).
        let tila: String
    }

    let aika: Date
    // Vain käyttäjää odottavat skoopit, tuorein ensin.
    let odottavat: [Rivi]

    static let avain = "tilannekuva"

    static func lue(_ d: UserDefaults? = UserDefaults(suiteName: sovellusRyhma)) -> Tilannekuva? {
        guard let data = d?.data(forKey: avain) else { return nil }
        return try? JSONDecoder().decode(Tilannekuva.self, from: data)
    }

    // Palauttaa true, kun widget kannattaa ladata uudelleen: sisältö muuttui tai widgetin näyttämä hakuaika on yli
    // 30 min vanha. Pelkkä aika ei lataa joka haulla, jotta iOS:n widgetkiintiö (~40–70/vrk) säästyy.
    @discardableResult
    func tallenna(_ d: UserDefaults? = UserDefaults(suiteName: sovellusRyhma)) -> Bool {
        let vanha = Self.lue(d)
        guard let data = try? JSONEncoder().encode(self) else { return false }
        d?.set(data, forKey: Self.avain)
        let ladattu = d?.object(forKey: "widgetLadattu") as? Date ?? .distantPast
        guard vanha?.odottavat != odottavat || aika.timeIntervalSince(ladattu) > 30 * 60 else { return false }
        d?.set(aika, forKey: "widgetLadattu")
        return true
    }
}
