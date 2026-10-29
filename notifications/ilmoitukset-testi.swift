// ilmoitukset()-funktion testi macOS:llä ilman simulaattoria (NOTIFICATIONS-PAIKALLINEN). Ajo palvelimelta:
//   bash scopes/notifications/testi.sh
// Kääntää Malli.swift + Ilmoitukset.swift (UIKit-osa jää pois macOS:llä) + tämän tiedoston.
import Foundation

func s(_ nimi: String, tila: String? = "kasittely", vikoja: Int = 0, seuraava: String? = "A", konteksti: Int? = nil) -> SkooppiYhteenveto {
    let json: [String: Any?] = ["nimi": nimi, "seuraava": seuraava, "avoimia": 0, "vikoja": vikoja, "istuntoja": 1,
                                "suurinKonteksti": konteksti, "aika": nil, "tila": tila]
    let data = try! JSONSerialization.data(withJSONObject: json.compactMapValues { $0 })
    return try! JSONDecoder().decode(SkooppiYhteenveto.self, from: data)
}

var virheet = 0
func tarkista(_ nimi: String, _ saatu: [Ilmoitus], _ odotettu: [IlmoitusLaji]) {
    let lajit = saatu.map(\.laji)
    if lajit == odotettu { print("ok   \(nimi)") } else { virheet += 1; print("EI   \(nimi): \(lajit) ≠ \(odotettu)") }
}

let r = 100_000
tarkista("ei muutosta", ilmoitukset(edellinen: [s("x")], uusi: [s("x")], raja: r), [])
tarkista("uusi skooppi ei ilmoita", ilmoitukset(edellinen: [], uusi: [s("x", tila: "odottaa")], raja: r), [])
tarkista("käsittely → odottaa", ilmoitukset(edellinen: [s("x")], uusi: [s("x", tila: "odottaa")], raja: r), [.odottaa])
tarkista("käsittely → kysely omana lajina", ilmoitukset(edellinen: [s("x")], uusi: [s("x", tila: "kysely")], raja: r), [.kysely])
tarkista("odottaa → kysely", ilmoitukset(edellinen: [s("x", tila: "odottaa")], uusi: [s("x", tila: "kysely")], raja: r), [.kysely])
tarkista("odottaa pysyy", ilmoitukset(edellinen: [s("x", tila: "odottaa")], uusi: [s("x", tila: "odottaa")], raja: r), [])
tarkista("V-300 idle omana tilana", ilmoitukset(edellinen: [s("x")], uusi: [s("x", tila: "idle")], raja: r), [.odottaa])
tarkista("idle → odottaa ei toista", ilmoitukset(edellinen: [s("x", tila: "idle")], uusi: [s("x", tila: "odottaa")], raja: r), [])
tarkista("pakattiin", ilmoitukset(edellinen: [s("x", tila: "odottaa")], uusi: [s("x", tila: "pakattu")], raja: r), [.valmis])
tarkista("seuraava vaihtui ja odottaa → vain valmis", ilmoitukset(edellinen: [s("x")], uusi: [s("x", tila: "odottaa", seuraava: "B")], raja: r), [.valmis])
tarkista("seuraava nil → arvo ei ilmoita", ilmoitukset(edellinen: [s("x", seuraava: nil)], uusi: [s("x", seuraava: "B")], raja: r), [])
tarkista("uusi vika", ilmoitukset(edellinen: [s("x", vikoja: 1)], uusi: [s("x", vikoja: 2)], raja: r), [.vika])
tarkista("vika korjattu ei ilmoita", ilmoitukset(edellinen: [s("x", vikoja: 2)], uusi: [s("x", vikoja: 1)], raja: r), [])
tarkista("konteksti ylittää rajan", ilmoitukset(edellinen: [s("x", konteksti: 90_000)], uusi: [s("x", konteksti: 101_000)], raja: r), [.konteksti])
tarkista("konteksti pysyy yli", ilmoitukset(edellinen: [s("x", konteksti: 101_000)], uusi: [s("x", konteksti: 110_000)], raja: r), [])
tarkista("konteksti nil → yli", ilmoitukset(edellinen: [s("x")], uusi: [s("x", konteksti: 120_000)], raja: r), [.konteksti])
tarkista("useita lajeja", ilmoitukset(edellinen: [s("x"), s("y")], uusi: [s("x", tila: "odottaa", vikoja: 1), s("y", tila: "pakattu")], raja: r), [.vika, .odottaa, .valmis])
// Asetusten kontekstiraja (NOTIFICATIONS-SIMULAATTORI): puuttuva tai 0 on oletus, tallennettu arvo ohittaa.
let d = UserDefaults(suiteName: "ilmoitukset-testi")!
d.removePersistentDomain(forName: "ilmoitukset-testi")
func raja(_ nimi: String, _ saatu: Int, _ odotettu: Int) {
    if saatu == odotettu { print("ok   \(nimi)") } else { virheet += 1; print("EI   \(nimi): \(saatu) ≠ \(odotettu)") }
}
raja("raja puuttuu → oletus", ilmoitusRaja(d), oletusIlmoitusRaja)
tallennaIlmoitusRaja(150_000, d)
raja("raja tallennettu", ilmoitusRaja(d), 150_000)
tallennaIlmoitusRaja(0, d)
raja("raja 0 → oletus", ilmoitusRaja(d), oletusIlmoitusRaja)
raja("oletus säätöalueella", ilmoitusRajaAlue.contains(oletusIlmoitusRaja) ? 1 : 0, 1)
// Widgetin tilannekuva ja uudelleenlatauksen raja (NOTIFICATIONS-TAUSTA): vain odottavat; sama sisältö alle 30 min ei lataa.
let t0 = Date(timeIntervalSince1970: 1_000_000)
let kuva = tilannekuva([s("x"), s("y", tila: "kysely"), s("z", tila: "pakattu"), s("w", tila: "idle")], aika: t0)
raja("tilannekuvassa vain odottavat", kuva.odottavat.count, 2)
raja("tilannekuvan tila säilyy", kuva.odottavat.contains(Tilannekuva.Rivi(nimi: "y", tila: "kysely")) ? 1 : 0, 1)
raja("ensimmäinen tallennus lataa", kuva.tallenna(d) ? 1 : 0, 1)
raja("luettu = tallennettu", Tilannekuva.lue(d) == kuva ? 1 : 0, 1)
raja("sama sisältö 10 min → ei lataa", tilannekuva([s("y", tila: "kysely"), s("w", tila: "idle")], aika: t0 + 600).tallenna(d) ? 1 : 0, 0)
raja("sama sisältö 31 min → lataa", tilannekuva([s("y", tila: "kysely"), s("w", tila: "idle")], aika: t0 + 1860).tallenna(d) ? 1 : 0, 1)
raja("sisältö muuttui → lataa", tilannekuva([s("y", tila: "kysely")], aika: t0 + 1900).tallenna(d) ? 1 : 0, 1)
// Taustahaun lähtötaso (NOTIFICATIONS-TAUSTA-TESTIT): iOS lopettaa äpin, herätetty taustahaku lukee edellisen listan levyltä.
// BGAppRefreshTaskin käynnistystä ei voi simuloida XCUITestistä (vain LLDB:n _simulateLaunchForTaskWithIdentifier).
raja("ei lähtötasoa → nil", lueLahtotaso(d) == nil ? 1 : 0, 1)
d.set(Data("roskaa".utf8), forKey: "lahtotaso")
raja("rikkinäinen lähtötaso → nil", lueLahtotaso(d) == nil ? 1 : 0, 1)
tallennaLahtotaso([s("x", vikoja: 1, konteksti: 50_000), s("y")], d)
let levylta = lueLahtotaso(d) ?? []
raja("lähtötaso säilyy levyllä", levylta.map(\.nimi) == ["x", "y"] && levylta[0].vikoja == 1 ? 1 : 0, 1)
tarkista("taustahaku levyn lähtötasoa vastaan", ilmoitukset(edellinen: levylta, uusi: [s("x", vikoja: 2, konteksti: 50_000), s("y", tila: "odottaa")], raja: r), [.vika, .odottaa])
tarkista("taustahaku ilman muutosta", ilmoitukset(edellinen: levylta, uusi: levylta, raja: r), [])
// Viimeisin taustahaku Asetuksiin (NOTIFICATIONS-TAUSTA-TODENNUS): -1 = haku epäonnistui.
raja("ei taustahakua → nil", lueTaustahaku(d) == nil ? 1 : 0, 1)
tallennaTaustahaku(2, aika: t0, d)
raja("taustahaku säilyy", lueTaustahaku(d).map { $0.aika == t0 && $0.ilmoituksia == 2 } == true ? 1 : 0, 1)
tallennaTaustahaku(-1, aika: t0 + 60, d)
raja("epäonnistunut taustahaku", lueTaustahaku(d)?.ilmoituksia ?? 0, -1)
d.removePersistentDomain(forName: "ilmoitukset-testi")
print(virheet == 0 ? "VIHREÄ: ilmoitukset" : "PUNAINEN: \(virheet) virhettä")
exit(virheet == 0 ? 0 : 1)
