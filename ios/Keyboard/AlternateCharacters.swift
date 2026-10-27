import Foundation

/// Tarjoaa natiivit pitkän painalluksen vaihtoehtoiset merkit (IOSKEYBOARD-TUNTUMA).
public enum AlternateCharacters {
    private static let mapping: [String: [String]] = [
        // Kirjaimet (pienet)
        "a": ["ä", "å", "á", "à", "â", "ã", "ā", "æ"],
        "e": ["é", "è", "ê", "ë", "ē", "ė", "ę"],
        "i": ["í", "ì", "î", "ï", "ī", "į"],
        "o": ["ö", "ó", "ò", "ô", "õ", "ō", "ø", "œ"],
        "u": ["ü", "ú", "ù", "û", "ū"],
        "y": ["ý", "ÿ"],
        "s": ["š", "ß", "$"],
        "c": ["č", "ç", "ć"],
        "z": ["ž", "ź", "ż"],
        "d": ["ð", "ď"],
        "n": ["ñ", "ń"],
        "r": ["ř"],
        "t": ["þ", "ť"],
        "l": ["ł"],
        "å": ["å", "ä", "a"],
        "ä": ["ä", "å", "a", "æ"],
        "ö": ["ö", "ø", "o", "œ"],

        // Numerot
        "0": ["°"],
        "1": ["¹", "½", "⅓", "¼"],
        "2": ["²"],
        "3": ["³"],

        // Erikoismerkit ja symbolit
        "-": ["–", "—", "•"],
        "/": ["\\"],
        "$": ["€", "$", "£", "¥", "₽", "¢"],
        "€": ["$", "€", "£", "¥", "₽", "¢"],
        "\"": ["”", "“", "«", "»"],
        "'": ["’", "‘", "`"],
        ".": ["…"],
        "?": ["¿"],
        "!": ["¡"],
        "%": ["‰"],
        "=": ["≠", "≈"],
        "<": ["≤", "«"],
        ">": ["≥", "»"]
    ]

    /// Hakee vaihtoehtoiset merkit annetulle perusmerkille.
    /// Jos `isShifted` on tosi, kirjaimet muutetaan suuraakkosiksi.
    public static func alternates(for base: String, isShifted: Bool = false) -> [String] {
        let key = base.lowercased()
        guard let list = mapping[key] else { return [] }

        if isShifted {
            return list.map { $0.uppercased() }
        }
        return list
    }

    /// Tarkistaa, onko annetulla merkillä vaihtoehtoisia merkkejä.
    public static func hasAlternates(for base: String) -> Bool {
        return mapping[base.lowercased()] != nil
    }
}
