import SwiftUI
import AppKit
import ScopesCore
import ScopesUI

public struct MacRootView: View {
    @State private var valittuNakyma: MacPaanakyma = .skoopit
    @State private var valittuSkooppi: String? = nil
    @State private var skoopit: [SkooppiYhteenveto] = []
    @State private var viestit: [Viesti] = []
    @State private var viestiTeksti: String = ""
    @State private var viestiLiitteet: [URL] = []
    @State private var voiLahettaa: Bool = true
    @State private var onLataamassa: Bool = false
    @State private var virheTeksti: String? = nil
    @State private var ilmoitusTeksti: String? = nil

    @State private var naytaUusiSkooppiSheet: Bool = false
    @State private var naytaPuraSheet: Bool = false
    @State private var uusiSkooppiNimi: String = ""
    @State private var naytaInspector: Bool = true
    @State private var kayttoraja: Kayttoraja? = nil
    @State private var nykyinenIstunto: Istunto? = nil
    @State private var nykyinenMalli: String? = nil
    @State private var nykyinenEffort: String? = nil

    // AGY-asetukset
    @AppStorage("agy_purku_ymparisto") private var purkuYmparisto: String = "macos"
    @AppStorage("agy_purku_malli") private var purkuMalli: String = "gemini-3.8-flash-high"
    @AppStorage("agy_siirto_ymparisto") private var siirtoYmparisto: String = "oneplus_linux"
    @AppStorage("agy_siirto_malli") private var siirtoMalli: String = "gemini-3.8-flash-high"
    @AppStorage("agy_pakkaus_ymparisto") private var pakkausYmparisto: String = "oneplus_linux"
    @AppStorage("agy_pakkaus_malli") private var pakkausMalli: String = "gemini-3.8-flash-high"

    public init() {}

    private var client: ScopesClient {
        let osoite = UserDefaults.standard.string(forKey: "scopes_osoite") ?? "http://127.0.0.1:8787"
        let avain = (try? MacKeychain.jaettu.haeAvain(palvelu: "scopes", tili: "avain")) ?? ""
        return ScopesClient(osoite: osoite, avain: avain)
    }

    public var body: some View {
        NavigationSplitView {
            MacSidebar(
                valittuNakyma: $valittuNakyma,
                valittuSkooppi: $valittuSkooppi,
                skoopit: skoopit,
                onToiminto: { toiminto, skooppi in
                    suoritaToiminto(toiminto: toiminto, skooppi: skooppi)
                },
                onUusiSkooppi: {
                    naytaUusiSkooppiSheet = true
                }
            )
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    Button {
                        Task { await paivitaKaikki() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .help("Päivitä (Cmd+R)")
                }

                ToolbarItem(placement: .automatic) {
                    Button {
                        NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
                    } label: {
                        Image(systemName: "gearshape")
                    }
                    .help("Asetukset (Cmd+,)")
                }
            }
        } detail: {
            switch valittuNakyma {
            case .kordinaattori:
                MacKordinaattoriView(client: client)
            case .skoopit:
                skooppiDetailView
            case .chat:
                MacChatView(client: client)
            case .infra:
                MacInfraView(client: client, onValitseSkooppi: { skooppi in
                    valittuNakyma = .skoopit
                    valittuSkooppi = skooppi
                })
            case .android:
                MacAndroidView(client: client)
            case .localregister:
                MacLrView(client: client)
            case .viat:
                MacViatView(client: client)
            }
        }
        .inspector(isPresented: Binding(
            get: { naytaInspector && valittuNakyma == .skoopit },
            set: { naytaInspector = $0 }
        )) {
            Group {
            if let valittu = valittuSkooppi {
                MacInspectorView(
                    skooppi: valittu,
                    yhteenveto: nykyinenSkooppi,
                    client: client,
                    onToiminto: { toiminto, skooppi in
                        suoritaToiminto(toiminto: toiminto, skooppi: skooppi)
                    }
                )
            } else {
                ContentUnavailableView(
                    "Ei valittua skooppia",
                    systemImage: "sidebar.right",
                    description: Text("Valitse skooppi nähdäksesi inspektorin ja rekisterin tiedot.")
                )
            }
            }
            .inspectorColumnWidth(min: 240, ideal: 300, max: 420)
        }
        .sheet(isPresented: $naytaUusiSkooppiSheet) {
            uusiSkooppiNakyma
        }
        .sheet(isPresented: $naytaPuraSheet) {
            if let valittu = valittuSkooppi {
                MacPuraValintaSheet(
                    skooppi: valittu,
                    client: client,
                    onPura: { ymparisto, malli in
                        naytaPuraSheet = false
                        suoritaPura(skooppi: valittu, ymparisto: ymparisto, malli: malli)
                    },
                    onPeru: {
                        naytaPuraSheet = false
                    }
                )
            }
        }
        .task {
            await paivitaSkoopit()
        }
        .task(id: valittuSkooppi) {
            if let skooppi = valittuSkooppi {
                await paivitaViestit(skooppi: skooppi)
                await seuraaAktiivisuutta(skooppi: skooppi)
            } else {
                viestit = []
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .scopesSuoritaToiminto)) { notif in
            guard let toiminto = notif.userInfo?["toiminto"] as? String,
                  let skooppi = valittuSkooppi else { return }
            suoritaToiminto(toiminto: toiminto, skooppi: skooppi)
        }
        .onReceive(NotificationCenter.default.publisher(for: .scopesUusiSkooppi)) { _ in
            naytaUusiSkooppiSheet = true
        }
        .onReceive(NotificationCenter.default.publisher(for: .scopesPaivitaKaikki)) { _ in
            Task { await paivitaKaikki() }
        }
        .onReceive(NotificationCenter.default.publisher(for: .scopesToggleInspector)) { _ in
            naytaInspector.toggle()
        }
    }

    @ViewBuilder
    private var skooppiDetailView: some View {
        if let valittu = valittuSkooppi {
            VStack(spacing: 0) {
                // Yläpalkki
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 8) {
                            Text(valittu)
                                .font(.title3)
                                .bold()
                            if let skooppi = nykyinenSkooppi {
                                Text(skooppi.tilaNyt)
                                    .font(.caption2)
                                    .bold()
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Capsule().fill(tilavari(skooppi.tilaNyt).opacity(0.2)))
                                    .foregroundColor(tilavari(skooppi.tilaNyt))
                            }
                        }

                        if let skooppi = nykyinenSkooppi {
                            Text("Istuntoja: \(skooppi.istuntoja) • Avoimia: \(skooppi.avoimia) • Vikoja: \(skooppi.vikoja)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }

                    Spacer()

                    // Pika-toiminnot yläpalkissa
                    HStack(spacing: 8) {
                        MalliValikko(
                            malli: nykyinenMalli ?? nykyinenIstunto?.malli,
                            effort: nykyinenEffort ?? nykyinenIstunto?.effort,
                            tyyppi: nykyinenIstunto?.tyyppi,
                            vapaa: voiLahettaa,
                            kayttoraja: kayttoraja
                        ) { uusiMalli, uusiEffort in
                            Task {
                                await vaihdaMalli(skooppi: valittu, malli: uusiMalli, effort: uusiEffort)
                            }
                        }

                        KayttorajaRenkaat(raja: kayttoraja, malli: nykyinenMalli ?? nykyinenIstunto?.malli)

                        if !voiLahettaa || nykyinenSkooppi?.tilaNyt == "kasittely" {
                            Button {
                                suoritaToiminto(toiminto: "stop", skooppi: valittu)
                            } label: {
                                Label("Stop", systemImage: "stop.circle.fill")
                                    .foregroundColor(.red)
                            }
                            .buttonStyle(.bordered)
                            .help("Pysäytä vastaus (Cmd+.)")
                        }

                        Menu {
                            Button("Pura uuteen istuntoon (Cmd+Shift+P)") {
                                naytaPuraSheet = true
                            }
                            Button("Automaattisiirto") {
                                suoritaToiminto(toiminto: "automaattisiirto", skooppi: valittu)
                            }
                            Button("Pakkaa istunto (Cmd+Shift+K)") {
                                suoritaToiminto(toiminto: "pakkaa", skooppi: valittu)
                            }
                            Divider()
                            Button("Pysäytä (Stop)", role: .destructive) {
                                suoritaToiminto(toiminto: "stop", skooppi: valittu)
                            }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                        .menuStyle(.borderlessButton)
                        .help("Skoopin toiminnot")

                        if onLataamassa {
                            ProgressView()
                                .controlSize(.small)
                                .padding(.horizontal, 4)
                        }

                        Button {
                            Task { await paivitaViestit(skooppi: valittu) }
                        } label: {
                            Image(systemName: "arrow.clockwise")
                        }
                        .help("Päivitä viestit")

                        Button {
                            naytaInspector.toggle()
                        } label: {
                            Image(systemName: "sidebar.right")
                        }
                        .help("Näytä/piilota inspektori (Cmd+Option+I)")
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(Color(nsColor: .controlBackgroundColor))

                Divider()

                // Ilmoitus- ja virhepalkit
                if let ilmoitus = ilmoitusTeksti {
                    HStack {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(.accentColor)
                        Text(ilmoitus)
                            .font(.caption)
                        Spacer()
                        Button("Sulje") { ilmoitusTeksti = nil }
                            .buttonStyle(.borderless)
                            .font(.caption)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.accentColor.opacity(0.1))
                }

                if let virhe = virheTeksti {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.yellow)
                        Text(virhe)
                            .font(.caption)
                        Spacer()
                        Button("Sulje") { virheTeksti = nil }
                            .buttonStyle(.borderless)
                            .font(.caption)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.yellow.opacity(0.1))
                }

                // Viestilista
                if viestit.isEmpty && !onLataamassa {
                    VStack(spacing: 8) {
                        Spacer()
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 36))
                            .foregroundColor(.secondary)
                        Text("Ei viestejä")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Kirjoita ensimmäinen viesti aloittaaksesi keskustelun.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(alignment: .leading, spacing: 12) {
                                ForEach(viestit) { v in
                                    viestiRivi(v)
                                }
                            }
                            .padding(16)
                        }
                        .onChange(of: viestit.count) { _, _ in
                            if let viim = viestit.last {
                                withAnimation {
                                    proxy.scrollTo(viim.id, anchor: .bottom)
                                }
                            }
                        }
                    }
                }

                Divider()

                // Viestikenttä
                MacChatInput(teksti: $viestiTeksti, liitteet: $viestiLiitteet, voiLahettaa: voiLahettaa && !onLataamassa) {
                    lahetaViesti()
                }
            }
        } else {
            ContentUnavailableView(
                "Valitse skooppi",
                systemImage: "sidebar.left",
                description: Text("Valitse skooppi sivupalkista tai luo uusi painamalla Cmd+N.")
            )
        }
    }

    private var nykyinenSkooppi: SkooppiYhteenveto? {
        skoopit.first(where: { $0.nimi == valittuSkooppi })
    }

    @ViewBuilder
    private var uusiSkooppiNakyma: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Luo uusi skooppi")
                .font(.headline)

            Text("Anna skoopin nimi (esim. 'scopes asetukset' tai 'haku').")
                .font(.caption)
                .foregroundColor(.secondary)

            TextField("Skoopin nimi", text: $uusiSkooppiNimi)
                .textFieldStyle(.roundedBorder)

            HStack {
                Spacer()
                Button("Peruuta") {
                    naytaUusiSkooppiSheet = false
                    uusiSkooppiNimi = ""
                }
                .keyboardShortcut(.cancelAction)

                Button("Luo skooppi") {
                    luoSkooppi()
                }
                .keyboardShortcut(.defaultAction)
                .disabled(uusiSkooppiNimi.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .padding(20)
        .frame(width: 380)
    }

    @ViewBuilder
    private func viestiRivi(_ v: Viesti) -> some View {
        if let kysymykset = v.kysymykset, !kysymykset.isEmpty, v.vastattu != true {
            VStack(spacing: 8) {
                ForEach(kysymykset) { k in
                    MacQuestionCard(kysymys: k) { vastaus in
                        vastaaKysymykseen(vastaus: vastaus)
                    }
                }
            }
            .id(v.id)
        } else {
            Viestikupla(viesti: v)
        }
    }

    private func paivitaKaikki() async {
        await paivitaSkoopit()
        if let skooppi = valittuSkooppi {
            await paivitaViestit(skooppi: skooppi)
        }
    }

    private func paivitaSkoopit() async {
        onLataamassa = true
        defer { onLataamassa = false }
        do {
            skoopit = try await client.skoopit()
            virheTeksti = nil
        } catch {
            virheTeksti = "Skooppien haku epäonnistui: \(error.localizedDescription)"
        }
    }

    private func paivitaViestit(skooppi: String) async {
        onLataamassa = true
        defer { onLataamassa = false }
        do {
            let tulos = try await client.viestit(skooppi: skooppi)
            viestit = tulos.viestit
            voiLahettaa = tulos.voiLahettaa
            nykyinenIstunto = tulos.istunto
            if let m = tulos.istunto?.malli { nykyinenMalli = m }
            if let e = tulos.istunto?.effort { nykyinenEffort = e }
            if let raja = try? await client.kayttoraja(skooppi: skooppi, tyyppi: nykyinenIstunto?.tyyppi, agentti: nykyinenMalli ?? nykyinenIstunto?.malli) {
                kayttoraja = raja
            }
            virheTeksti = nil
        } catch {
            virheTeksti = "Viestien haku epäonnistui: \(error.localizedDescription)"
        }
    }

    private func vaihdaMalli(skooppi: String, malli: String?, effort: String?) async {
        do {
            _ = try await client.vaihdaMalli(skooppi: skooppi, malli: malli, effort: effort)
            if let malli { nykyinenMalli = malli }
            if let effort { nykyinenEffort = effort }
            virheTeksti = nil
            try? await Task.sleep(nanoseconds: 1_000_000_000)
            await paivitaViestit(skooppi: skooppi)
        } catch {
            virheTeksti = "Mallin vaihto epäonnistui: \(error.localizedDescription)"
        }
    }

    private func seuraaAktiivisuutta(skooppi: String) async {
        while !Task.isCancelled && valittuSkooppi == skooppi {
            if !voiLahettaa || nykyinenSkooppi?.tilaNyt == "kasittely" {
                try? await Task.sleep(nanoseconds: 2_000_000_000)
                await paivitaViestit(skooppi: skooppi)
                await paivitaSkoopit()
            } else {
                try? await Task.sleep(nanoseconds: 10_000_000_000)
                await paivitaViestit(skooppi: skooppi)
            }
        }
    }

    private func lahetaViesti() {
        guard let skooppi = valittuSkooppi else { return }
        let kirjoitettu = viestiTeksti.trimmingCharacters(in: .whitespacesAndNewlines)
        let liitteet = viestiLiitteet
        guard !kirjoitettu.isEmpty || !liitteet.isEmpty else { return }

        viestiTeksti = ""
        viestiLiitteet = []
        voiLahettaa = false

        Task {
            // Liitteet ensin palveluun; viesti lähtee vasta, kun kaikki polut ovat tiedossa (MAC-17).
            let teksti: String
            do {
                teksti = try await LiitteetMac.lahetaJaMuotoile(kirjoitettu, liitteet: liitteet, skooppi: skooppi, client: client)
            } catch {
                virheTeksti = "Liitteen lähetys epäonnistui: \(error.localizedDescription)"
                if viestiTeksti.isEmpty { viestiTeksti = kirjoitettu; viestiLiitteet = liitteet }
                voiLahettaa = true
                return
            }
            viestit.append(Viesti(rooli: "kayttaja", teksti: teksti))
            var suoratoistoOnnistui = false
            var assistenttiIndeksi: Int? = nil

            do {
                for try await tapahtuma in client.suoratoistaViesti(skooppi: skooppi, teksti: teksti) {
                    suoratoistoOnnistui = true
                    if tapahtuma.tyyppi == "pala", let pala = tapahtuma.teksti {
                        if let idx = assistenttiIndeksi {
                            viestit[idx].teksti += pala
                        } else {
                            let uusi = Viesti(rooli: "assistentti", teksti: pala)
                            viestit.append(uusi)
                            assistenttiIndeksi = viestit.count - 1
                        }
                    } else if tapahtuma.tyyppi == "valmis" {
                        if let vastaus = tapahtuma.vastaus, let idx = assistenttiIndeksi {
                            viestit[idx].teksti = vastaus
                        }
                    } else if tapahtuma.tyyppi == "virhe", let virhe = tapahtuma.virhe {
                        virheTeksti = "Vastausvirhe: \(virhe)"
                    }
                }
            } catch {
                if !suoratoistoOnnistui {
                    do {
                        _ = try await client.laheta(skooppi: skooppi, teksti: teksti)
                    } catch {
                        virheTeksti = "Viestin lähetys epäonnistui: \(error.localizedDescription)"
                    }
                }
            }

            await paivitaViestit(skooppi: skooppi)
            await paivitaSkoopit()
            voiLahettaa = true
        }
    }

    private func vastaaKysymykseen(vastaus: String) {
        guard let skooppi = valittuSkooppi else { return }
        voiLahettaa = false
        Task {
            var suoratoistoOnnistui = false
            var assistenttiIndeksi: Int? = nil

            do {
                for try await tapahtuma in client.suoratoistaViesti(skooppi: skooppi, teksti: vastaus) {
                    suoratoistoOnnistui = true
                    if tapahtuma.tyyppi == "pala", let pala = tapahtuma.teksti {
                        if let idx = assistenttiIndeksi {
                            viestit[idx].teksti += pala
                        } else {
                            let uusi = Viesti(rooli: "assistentti", teksti: pala)
                            viestit.append(uusi)
                            assistenttiIndeksi = viestit.count - 1
                        }
                    } else if tapahtuma.tyyppi == "valmis" {
                        if let valmisTeksti = tapahtuma.vastaus, let idx = assistenttiIndeksi {
                            viestit[idx].teksti = valmisTeksti
                        }
                    } else if tapahtuma.tyyppi == "virhe", let virhe = tapahtuma.virhe {
                        virheTeksti = "Vastausvirhe: \(virhe)"
                    }
                }
            } catch {
                if !suoratoistoOnnistui {
                    do {
                        _ = try await client.laheta(skooppi: skooppi, teksti: vastaus)
                    } catch {
                        virheTeksti = "Vastauksen lähetys epäonnistui: \(error.localizedDescription)"
                    }
                }
            }

            await paivitaViestit(skooppi: skooppi)
            await paivitaSkoopit()
            voiLahettaa = true
        }
    }

    private func suoritaToiminto(toiminto: String, skooppi: String) {
        if toiminto == "pura" {
            naytaPuraSheet = true
            return
        }
        ilmoitusTeksti = "Käynnistetään toiminto '\(toiminto)' kohteelle '\(skooppi)'..."
        Task {
            do {
                if toiminto == "stop" {
                    _ = try await client.pysayta(skooppi: skooppi)
                    ilmoitusTeksti = "Pysäytyspyyntö lähetetty skoopolle '\(skooppi)'."
                } else if toiminto == "pakkaa" {
                    if pakkausYmparisto == "macos" && MacAGYRunner.jaettu.onSaatavilla {
                        let runko = ["purkaja": "macos-agy:\(pakkausMalli)", "ymparisto": "macos"]
                        _ = try await client.toiminto(skooppi: skooppi, toiminto: toiminto, runko: runko)
                        ilmoitusTeksti = "Pakkaus käynnistetty macOS AGY:llä (\(pakkausMalli))."
                    } else {
                        let runko = ["purkaja": "agy:\(pakkausMalli)"]
                        _ = try await client.toiminto(skooppi: skooppi, toiminto: toiminto, runko: runko)
                        ilmoitusTeksti = "Pakkaus käynnistetty OnePlus Linux AGY:llä (\(pakkausMalli))."
                    }
                } else if toiminto == "automaattisiirto" {
                    if siirtoYmparisto == "macos" && MacAGYRunner.jaettu.onSaatavilla {
                        let runko = ["purkaja": "macos-agy:\(siirtoMalli)", "ymparisto": "macos"]
                        _ = try await client.toiminto(skooppi: skooppi, toiminto: toiminto, runko: runko)
                        ilmoitusTeksti = "Automaattisiirto käynnistetty macOS AGY:llä (\(siirtoMalli))."
                    } else {
                        let runko = ["purkaja": "agy:\(siirtoMalli)"]
                        _ = try await client.toiminto(skooppi: skooppi, toiminto: toiminto, runko: runko)
                        ilmoitusTeksti = "Automaattisiirto käynnistetty OnePlus Linux AGY:llä (\(siirtoMalli))."
                    }
                } else {
                    _ = try await client.toiminto(skooppi: skooppi, toiminto: toiminto)
                    ilmoitusTeksti = "Toiminto '\(toiminto)' suoritettu onnistuneesti."
                }
                await paivitaSkoopit()
                if valittuSkooppi == skooppi {
                    await paivitaViestit(skooppi: skooppi)
                }
            } catch {
                virheTeksti = "Toiminto '\(toiminto)' epäonnistui: \(error.localizedDescription)"
                ilmoitusTeksti = nil
            }
        }
    }

    private func suoritaPura(skooppi: String, ymparisto: String, malli: String) {
        ilmoitusTeksti = "Puretaan skooppia \(skooppi) (\(ymparisto): \(malli))..."
        Task {
            do {
                if ymparisto == "macos" && MacAGYRunner.jaettu.onSaatavilla {
                    let mdPolku = try await MacAGYRunner.jaettu.luoPurkutiedosto(skooppi: skooppi)
                    let runko = ["purkaja": "macos-agy:\(malli)", "ymparisto": "macos", "tiedosto": mdPolku]
                    _ = try? await client.toiminto(skooppi: skooppi, toiminto: "pura", runko: runko)
                    ilmoitusTeksti = "macOS AGY -purkutiedosto luotu (\(mdPolku)). Valmis mallille \(malli)."
                } else if ymparisto == "claude" {
                    let runko = ["purkaja": "claude", "malli": malli]
                    _ = try await client.toiminto(skooppi: skooppi, toiminto: "pura", runko: runko)
                    ilmoitusTeksti = "Purku käynnistetty Claudella (\(malli))."
                } else {
                    let runko = ["purkaja": "agy:\(malli)"]
                    _ = try await client.toiminto(skooppi: skooppi, toiminto: "pura", runko: runko)
                    ilmoitusTeksti = "Purku käynnistetty OnePlus Linux AGY:llä (\(malli))."
                }
                await paivitaSkoopit()
                if valittuSkooppi == skooppi {
                    await paivitaViestit(skooppi: skooppi)
                }
            } catch {
                virheTeksti = "Purku epäonnistui: \(error.localizedDescription)"
                ilmoitusTeksti = nil
            }
        }
    }

    private func luoSkooppi() {
        let nimi = uusiSkooppiNimi.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !nimi.isEmpty else { return }
        naytaUusiSkooppiSheet = false
        uusiSkooppiNimi = ""

        Task {
            do {
                _ = try await client.toiminto(skooppi: nimi, toiminto: "pura")
                ilmoitusTeksti = "Uusi skooppi '\(nimi)' luotu ja purettu."
                await paivitaSkoopit()
                valittuSkooppi = nimi
            } catch {
                virheTeksti = "Uuden skoopin luonti epäonnistui: \(error.localizedDescription)"
            }
        }
    }

    private func tilavari(_ tila: String) -> Color {
        switch tila {
        case "kasittely": return .green
        case "kysely": return .yellow
        case "odottaa": return .orange
        default: return .secondary
        }
    }
}
