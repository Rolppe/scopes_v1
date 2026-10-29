// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ScopesCore",
    platforms: [
        .macOS(.v14),
        .iOS(.v17)
    ],
    products: [
        .library(name: "ScopesCore", targets: ["ScopesCore"])
    ],
    dependencies: [],
    targets: [
        .target(name: "ScopesCore", dependencies: []),
        .testTarget(name: "ScopesCoreTests", dependencies: ["ScopesCore"])
    ]
)
