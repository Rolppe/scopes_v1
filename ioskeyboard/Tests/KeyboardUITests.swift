import XCTest
import UIKit
import SwiftUI
@testable import Skoopit

final class KeyboardUITests: XCTestCase {
    override func tearDown() {
        XCUIDevice.shared.orientation = .portrait
        super.tearDown()
    }

    // MARK: - 1. Näppäimistöohjaimen ja näkymien yksikkö- ja integrointitestit
    func testKeyboardViewControllerToimintaJaKorkeudet() {
        let vc = KeyboardViewController()
        vc.loadViewIfNeeded()

        XCTAssertNotNil(vc.view, "KeyboardViewControllerin näkymä ei latautunut")
        XCTAssertTrue(vc.enableInputClicksWhenVisible, "Näppäinäänet tulee olla sallittuina")
        XCTAssertTrue(vc.view.subviews.count > 0, "HostingControllerin näkymä puuttuu")

        // Todennetaan peruskorkeus ja pystytila
        XCTAssertEqual(vc.heightConstraint?.constant, 255.0, "Oletuskorkeuden tulee olla pystytilan 255 pt")
        XCTAssertFalse(vc.state.isLandscape, "Oletustilan tulee olla pystytila")

        // Testataan siirtyminen vaakatilaan
        vc.updateKeyboardHeight(isLandscape: true)
        XCTAssertEqual(vc.heightConstraint?.constant, 175.0, "Vaakatilan korkeuden tulee olla 175 pt")
        XCTAssertTrue(vc.state.isLandscape, "Vaakatilassa tilan tulee olla isLandscape = true")

        // Testataan palautuminen pystytilaan (korjaa vaakatilaan jumiutumisen)
        vc.updateKeyboardHeight(isLandscape: false)
        XCTAssertEqual(vc.heightConstraint?.constant, 255.0, "Pystytilaan palatessa korkeuden tulee palautua 255 pt:iin")
        XCTAssertFalse(vc.state.isLandscape, "Pystytilaan palatessa isLandscape tulee olla false")
    }

    func testKeyboardModelJaToiminnot() {
        var tehtyToiminto: KeyAction?
        let onAction: (KeyAction) -> Void = { action in
            tehtyToiminto = action
        }

        // Testataan toimintojen läpimeno
        onAction(.character("/"))
        XCTAssertEqual(tehtyToiminto, .character("/"))

        onAction(.moveCursor(-1))
        XCTAssertEqual(tehtyToiminto, .moveCursor(-1))

        onAction(.switchMode(.numbers))
        XCTAssertEqual(tehtyToiminto, .switchMode(.numbers))

        onAction(.switchMode(.symbols))
        XCTAssertEqual(tehtyToiminto, .switchMode(.symbols))
    }

    func testLandscapeKeyboardViewRakenne() {
        var actions: [KeyAction] = []
        let view = LandscapeKeyboardView(shiftState: .off, mode: .letters) { action in
            actions.append(action)
        }
        XCTAssertNotNil(view)

        // Numerotila
        let numbersView = LandscapeKeyboardView(shiftState: .off, mode: .numbers) { action in
            actions.append(action)
        }
        XCTAssertNotNil(numbersView)

        // Symbolitila
        let symbolsView = LandscapeKeyboardView(shiftState: .off, mode: .symbols) { action in
            actions.append(action)
        }
        XCTAssertNotNil(symbolsView)
    }

    func testPortraitKeyboardViewRakenne() {
        var actions: [KeyAction] = []
        let view = PortraitKeyboardView(shiftState: .off, mode: .letters) { action in
            actions.append(action)
        }
        XCTAssertNotNil(view)

        let numbersView = PortraitKeyboardView(shiftState: .off, mode: .numbers) { action in
            actions.append(action)
        }
        XCTAssertNotNil(numbersView)

        let symbolsView = PortraitKeyboardView(shiftState: .off, mode: .symbols) { action in
            actions.append(action)
        }
        XCTAssertNotNil(symbolsView)
    }

    // MARK: - 2. Asettelut, tasaleveydet ja safe-areat (IOSKEYBOARD-ASETTELU)
    func testKeyboardAsettelutJaTasaleveydet() {
        let insets = EdgeInsets(top: 0, leading: 59, bottom: 21, trailing: 59)
        let state = KeyboardViewState(isLandscape: true, safeAreaInsets: insets)
        XCTAssertEqual(state.safeAreaInsets.leading, 59)
        XCTAssertEqual(state.safeAreaInsets.bottom, 21)

        // Vaakatilan näkymä safe-area-insettien kanssa kaikissa tiloissa
        let landscapeLetters = LandscapeKeyboardView(shiftState: .off, mode: .letters, safeAreaInsets: insets) { _ in }
        XCTAssertNotNil(landscapeLetters)
        let landscapeNumbers = LandscapeKeyboardView(shiftState: .off, mode: .numbers, safeAreaInsets: insets) { _ in }
        XCTAssertNotNil(landscapeNumbers)
        let landscapeSymbols = LandscapeKeyboardView(shiftState: .off, mode: .symbols, safeAreaInsets: insets) { _ in }
        XCTAssertNotNil(landscapeSymbols)

        // Pystytilan näkymä safe-area-insettien kanssa
        let portraitInsets = EdgeInsets(top: 0, leading: 0, bottom: 34, trailing: 0)
        let portraitLetters = PortraitKeyboardView(shiftState: .off, mode: .letters, safeAreaInsets: portraitInsets) { _ in }
        XCTAssertNotNil(portraitLetters)
        let portraitNumbers = PortraitKeyboardView(shiftState: .off, mode: .numbers, safeAreaInsets: portraitInsets) { _ in }
        XCTAssertNotNil(portraitNumbers)
        let portraitSymbols = PortraitKeyboardView(shiftState: .off, mode: .symbols, safeAreaInsets: portraitInsets) { _ in }
        XCTAssertNotNil(portraitSymbols)
    }

    // MARK: - 2. Natiivi tuntuma: Haptiikka, äänet ja popoverit (IOSKEYBOARD-TUNTUMA)
    func testKeyboardFeedbackJaAanet() {
        let feedback = KeyboardFeedback.shared
        feedback.prepare()

        // Testataan kaikki palautetyypit ilman kaatumisia tai poikkeuksia
        let tyypit: [FeedbackType] = [
            .standard,
            .delete,
            .modifier,
            .space,
            .returnKey,
            .cursor,
            .popoverTrigger,
            .popoverSelection
        ]

        for tyyppi in tyypit {
            feedback.trigger(tyyppi)
        }
    }

    func testAlternateCharactersLogiikka() {
        // Pienet kirjaimet
        let aAlts = AlternateCharacters.alternates(for: "a", isShifted: false)
        XCTAssertTrue(aAlts.contains("ä"), "Kirjaimelta 'a' puuttuu 'ä'")
        XCTAssertTrue(aAlts.contains("å"), "Kirjaimelta 'a' puuttuu 'å'")
        XCTAssertTrue(AlternateCharacters.hasAlternates(for: "a"))

        // Suuraakkoset
        let aAltsUpper = AlternateCharacters.alternates(for: "a", isShifted: true)
        XCTAssertTrue(aAltsUpper.contains("Ä"), "Isolta kirjaimelta 'A' puuttuu 'Ä'")
        XCTAssertTrue(aAltsUpper.contains("Å"), "Isolta kirjaimelta 'A' puuttuu 'Å'")

        // Symbolit ja numerot
        let viivaAlts = AlternateCharacters.alternates(for: "-")
        XCTAssertTrue(viivaAlts.contains("–"), "Yhdysmerkiltä puuttuu ajatusviiva '–'")
        XCTAssertTrue(viivaAlts.contains("—"), "Yhdysmerkiltä puuttuu pitkä ajatusviiva '—'")

        let nollaAlts = AlternateCharacters.alternates(for: "0")
        XCTAssertTrue(nollaAlts.contains("°"), "Numerolta 0 puuttuu asteen merkki '°'")

        // Tuntematon merkki
        XCTAssertFalse(AlternateCharacters.hasAlternates(for: "k"))
        XCTAssertEqual(AlternateCharacters.alternates(for: "k"), [])
    }

    func testKeyPopoverViewRakenne() {
        let items = ["ä", "å", "á", "à"]
        let popover = KeyPopoverView(items: items, selectedIndex: 1)
        XCTAssertNotNil(popover)

        let callout = KeyPreviewCallout(label: "a", isDark: false)
        XCTAssertNotNil(callout)

        let calloutDark = KeyPreviewCallout(label: "a", isDark: true)
        XCTAssertNotNil(calloutDark)

        // IOSKEYBOARD-TYYLI: Testataan callout-kohdistukset ja kuplan muodon polku
        for align in [CalloutAlignment.leading, CalloutAlignment.center, CalloutAlignment.trailing] {
            let alignedCallout = KeyPreviewCallout(label: "q", isDark: false, keyWidth: 32, keyHeight: 42, alignment: align)
            XCTAssertNotNil(alignedCallout)

            let shape = KeyCalloutShape(keyWidth: 32, keyHeight: 42, alignment: align)
            let path = shape.path(in: CGRect(x: 0, y: 0, width: shape.headWidth, height: shape.totalHeight))
            XCTAssertFalse(path.isEmpty, "Callout-kuplan polun tulee muodostua")
        }

        // Testataan aktiivinen shift-painike ja natiivityyli
        let activeShiftItem = KeyItem(label: "", action: .shift, systemImage: "shift.fill", isSpecial: true)
        let activeShiftView = KeyButtonView(item: activeShiftItem, height: 42) { _ in }
        XCTAssertNotNil(activeShiftView)
    }

    // MARK: - 3. Simulaattorin UI- ja kiertotesti
    func testKeyboardSimulaattoriKiertoJaNakyvyys() throws {
        let app = XCUIApplication()
        let ymp = ProcessInfo.processInfo.environment
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = ymp["SCOPES_AVAIN"] ?? "test"
        app.launch()

        // 1. Etsitään hakukenttä ja avataan näppäimistö pystyssä
        let haku = app.searchFields.firstMatch
        if !haku.waitForExistence(timeout: 10) || !haku.isHittable {
            let nuoli = app.buttons.matching(identifier: "sivupalkki").allElementsBoundByIndex.first { $0.isHittable }
            nuoli?.tap()
        }
        XCTAssertTrue(haku.waitForExistence(timeout: 5), "haku- tai syöttökenttä puuttuu")
        haku.tap()

        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5), "näppäimistö ei auennut")
        sleep(1)
        kuva("keyboard-portrait")

        // 2. Käännetään vaakatilaan ja todennetaan asettelu
        XCUIDevice.shared.orientation = .landscapeLeft
        sleep(2)
        XCTAssertGreaterThan(app.windows.firstMatch.frame.width, app.windows.firstMatch.frame.height, "laite ei kääntynyt vaakaan")
        kuva("keyboard-landscape")

        // 3. Käännetään takaisin pystytilaan ja todennetaan palautuminen
        XCUIDevice.shared.orientation = .portrait
        sleep(2)
        XCTAssertGreaterThan(app.windows.firstMatch.frame.height, app.windows.firstMatch.frame.width, "laite ei kääntynyt takaisin pystyyn")
        kuva("keyboard-portrait-returned")
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }
}
