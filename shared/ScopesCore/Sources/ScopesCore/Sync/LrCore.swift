import CryptoKit
import Foundation

public typealias LrVektori = [String: Int]

public enum LrSuhde: Sendable {
    case sama, uudempi, vanhempi, rinnakkainen
}

public struct LrMeta: Codable, Hashable, Sendable {
    public var rekisteri: String
    public var versio: LrVektori
    public var poistettu: Bool

    public init(rekisteri: String, versio: LrVektori, poistettu: Bool) {
        self.rekisteri = rekisteri
        self.versio = versio
        self.poistettu = poistettu
    }
}

public struct LrSisar: Codable, Hashable, Sendable {
    public var sisalto: String
    public var poistettu: Bool
    public var versio: LrVektori
    public var muutettu: String?
    public var muuttaja: String?

    public init(sisalto: String, poistettu: Bool, versio: LrVektori, muutettu: String? = nil, muuttaja: String? = nil) {
        self.sisalto = sisalto
        self.poistettu = poistettu
        self.versio = versio
        self.muutettu = muutettu
        self.muuttaja = muuttaja
    }
}

public struct LrYksikko: Codable, Identifiable, Hashable, Sendable {
    public var id: String
    public var rekisteri: String
    public var laji: String
    public var osio: String?
    public var jarjestys: String
    public var sisalto: String
    public var versio: LrVektori
    public var muutettu: String?
    public var muuttaja: String?
    public var poistettu: Bool
    public var rinnakkaiset: [LrSisar]?

    public var riidassa: Bool { !(rinnakkaiset ?? []).isEmpty }

    public init(id: String, rekisteri: String, laji: String, osio: String? = nil, jarjestys: String, sisalto: String, versio: LrVektori, muutettu: String? = nil, muuttaja: String? = nil, poistettu: Bool = false, rinnakkaiset: [LrSisar]? = nil) {
        self.id = id
        self.rekisteri = rekisteri
        self.laji = laji
        self.osio = osio
        self.jarjestys = jarjestys
        self.sisalto = sisalto
        self.versio = versio
        self.muutettu = muutettu
        self.muuttaja = muuttaja
        self.poistettu = poistettu
        self.rinnakkaiset = rinnakkaiset
    }
}

public struct LrRekisteri: Codable, Sendable {
    public var meta: LrMeta
    public var yksikot: [String: LrYksikko]

    public init(meta: LrMeta, yksikot: [String: LrYksikko]) {
        self.meta = meta
        self.yksikot = yksikot
    }
}

public enum LrLaskenta {
    public static func ennen(_ a: String, _ b: String) -> Bool {
        a.utf16.lexicographicallyPrecedes(b.utf16)
    }

    public static func vertaa(_ a: LrVektori, _ b: LrVektori) -> LrSuhde {
        var suurempi = false
        var pienempi = false
        for k in Set(a.keys).union(b.keys) {
            let x = a[k] ?? 0
            let y = b[k] ?? 0
            if x > y { suurempi = true }
            if x < y { pienempi = true }
        }
        return suurempi && pienempi ? .rinnakkainen : suurempi ? .uudempi : pienempi ? .vanhempi : .sama
    }

    public static func vektori(_ v: LrVektori) -> String {
        v.keys.sorted(by: ennen).map { "\($0)=\(v[$0]!)" }.joined(separator: ",")
    }

    public static func sha(_ s: String) -> String {
        SHA256.hash(data: Data(s.utf8)).map { String(format: "%02x", $0) }.joined()
    }
}
