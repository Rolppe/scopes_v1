import UIKit
import AudioToolbox

/// Palautetyyppi haptiikalle ja järjestelmä-äänille.
public enum FeedbackType: Hashable {
    case standard       // Tavalliset kirjaimet ja numerot
    case delete         // Askelpalautin / poisto
    case modifier       // Vaihto-, tila-, ja ohjausnäppäimet
    case space          // Välilyönti
    case returnKey      // Rivinvaihto / Syötä
    case cursor         // Kohdistinnuolet
    case popoverTrigger // Pitkän painalluksen popoverin aukeaminen
    case popoverSelection // Vaihtoehtoisen merkin valinta liukumalla
}

/// Keskitetty haptiikan ja järjestelmän näppäinäänten hallinta (IOSKEYBOARD-TUNTUMA).
public final class KeyboardFeedback {
    public static let shared = KeyboardFeedback()

    private let lightImpact = UIImpactFeedbackGenerator(style: .light)
    private let mediumImpact = UIImpactFeedbackGenerator(style: .medium)
    private let rigidImpact = UIImpactFeedbackGenerator(style: .rigid)
    private let softImpact = UIImpactFeedbackGenerator(style: .soft)
    private let selectionFeedback = UISelectionFeedbackGenerator()

    public init() {
        prepare()
    }

    /// Esilämmittää haptiikkamoottorit viiveettömän vasteen takaamiseksi.
    public func prepare() {
        lightImpact.prepare()
        mediumImpact.prepare()
        rigidImpact.prepare()
        softImpact.prepare()
        selectionFeedback.prepare()
    }

    /// Laukaisee toimintoon sopivan haptisen palautteen ja järjestelmä-äänen.
    public func trigger(_ type: FeedbackType) {
        switch type {
        case .standard:
            lightImpact.impactOccurred()
            lightImpact.prepare()
            playAudio(soundID: 1104)
        case .delete:
            mediumImpact.impactOccurred()
            mediumImpact.prepare()
            playAudio(soundID: 1155)
        case .modifier:
            rigidImpact.impactOccurred()
            rigidImpact.prepare()
            playAudio(soundID: 1156)
        case .space:
            softImpact.impactOccurred()
            softImpact.prepare()
            playAudio(soundID: 1104)
        case .returnKey:
            mediumImpact.impactOccurred()
            mediumImpact.prepare()
            playAudio(soundID: 1156)
        case .cursor:
            lightImpact.impactOccurred()
            lightImpact.prepare()
            playAudio(soundID: 1104)
        case .popoverTrigger:
            mediumImpact.impactOccurred()
            mediumImpact.prepare()
        case .popoverSelection:
            selectionFeedback.selectionChanged()
            selectionFeedback.prepare()
        }
    }

    private func playAudio(soundID: SystemSoundID) {
        AudioServicesPlaySystemSound(soundID)
        UIDevice.current.playInputClick()
    }
}
