import Foundation

public protocol KeychainProvider: Sendable {
    func haeAvain(palvelu: String, tili: String) throws -> String?
    func tallennaAvain(palvelu: String, tili: String, avain: String) throws
    func poistaAvain(palvelu: String, tili: String) throws
}

public protocol SystemNotifierProtocol: Sendable {
    func lahetaIlmoitus(otsikko: String, viesti: String, tunnus: String) async throws
}
