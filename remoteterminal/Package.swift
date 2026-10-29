// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ScopesRemoteTerminal",
    platforms: [
        .macOS(.v14),
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "ScopesRemoteTerminal",
            targets: ["ScopesRemoteTerminal"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/migueldeicaza/SwiftTerm.git", from: "1.0.0")
    ],
    targets: [
        .target(
            name: "ScopesRemoteTerminal",
            dependencies: [
                .product(name: "SwiftTerm", package: "SwiftTerm")
            ],
            path: "Sources/ScopesRemoteTerminal"
        ),
        .testTarget(
            name: "ScopesRemoteTerminalTests",
            dependencies: ["ScopesRemoteTerminal"],
            path: "Tests/ScopesRemoteTerminalTests"
        )
    ]
)
