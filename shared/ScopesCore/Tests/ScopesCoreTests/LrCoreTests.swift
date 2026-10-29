import XCTest
@testable import ScopesCore

final class LrCoreTests: XCTestCase {
    func testVektorikellojenVertailu() {
        let v1: LrVektori = ["mac": 1, "iphone": 2]
        let v2: LrVektori = ["mac": 1, "iphone": 2]
        let v3: LrVektori = ["mac": 2, "iphone": 2]
        let v4: LrVektori = ["mac": 1, "iphone": 1]
        let v5: LrVektori = ["mac": 2, "iphone": 1] // rinnakkainen v1:n kanssa (mac uudempi, iphone vanhempi)

        XCTAssertEqual(LrLaskenta.vertaa(v1, v2), .sama)
        XCTAssertEqual(LrLaskenta.vertaa(v3, v1), .uudempi)
        XCTAssertEqual(LrLaskenta.vertaa(v4, v1), .vanhempi)
        XCTAssertEqual(LrLaskenta.vertaa(v5, v1), .rinnakkainen)
    }

    func testShaLaskenta() {
        let tiiviste = LrLaskenta.sha("testi")
        XCTAssertEqual(tiiviste.count, 64)
        XCTAssertEqual(tiiviste, "26e19f2b4dd93a3a7c49c3e785ec8932550af6aa6bea13078672a8c81508f18e")
    }
}
