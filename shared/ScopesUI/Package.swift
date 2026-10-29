// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ScopesUI",
    platforms: [
        .macOS(.v14),
        .iOS(.v17)
    ],
    products: [
        .library(name: "ScopesUI", targets: ["ScopesUI"])
    ],
    dependencies: [
        .package(path: "../ScopesCore")
    ],
    targets: [
        .target(name: "ScopesUI", dependencies: ["ScopesCore"]),
        .testTarget(name: "ScopesUITests", dependencies: ["ScopesUI"])
    ]
)
