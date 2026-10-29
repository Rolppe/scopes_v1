# scopes sideloader — toteutushistoria

## Toteutushistoria

- 28.10.2026: skooppi `scopes sideloader` luotiin komennolla `/pura uusi` (luo-skooppi.mjs; commit 41502694, rakennetesti ok).
- 28.10.2026: SIDELOADER-MAARITTELY tehty: tarkoitus, raja ja vaatimukset kirjattu rekisteriin (commit "docs(scopes sideloader): tarkoitus, raja ja ensimmäinen paketti SIDELOADER-SELVITYS").
- 28.10.2026: SIDELOADER-SELVITYS tehty kolmessa commitissa: vaihtoehtovertailu, EU-kaupat ja LiveContainer sekä toinen Apple ID tarkemmin. Tulos luvussa "Selvitys 28.10.2026 (SIDELOADER-SELVITYS)" rekisterissä.
- Mittaukset 28.10.2026: Mac `security find-identity -v -p codesigning`: yksi identiteetti, "Apple Development: 78311409+Rolppe@users.noreply.github.com (YOUR_CERT_ID)", ilmainen tiimi. `~/scopes-ios/asennus.loki` 27.10.2026 klo 09.44: asennus onnistui, profiili vanhenee 2026-11-03T07:06:36Z. WireGuard: reitittimen wg0, 192.0.2.31/24, julkinen portti 51820/udp (Infra/dokumentaatio/ohjekirja/liite-b-osoitteet.md).
- Lähteet (verkko 28.10.2026): SideStore FAQ (3 äppiä, 10 eri äppiä viikossa), MultiStore README (3 äppiä tiliä kohden, ei testitulosta), iloader #583, #611, #653 (ilmaisten tiimien esto 0xe8008024 heinäkuusta 2026, tiimikohtainen, laitteelle tallennettu), Applen DMA-sivut (notarisointi vaatii maksullisen jäsenyyden), LiveContainer README (push, laajennukset, App Groups heikosti).
