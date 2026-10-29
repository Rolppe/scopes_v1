import XCTest
@testable import ScopesCore

final class ScopesCoreTests: XCTestCase {
    func testVersio() {
        XCTAssertEqual(ScopesCore.versio, "0.1.0")
    }
}
