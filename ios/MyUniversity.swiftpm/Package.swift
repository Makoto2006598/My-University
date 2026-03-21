// swift-tools-version: 5.5
import PackageDescription

let package = Package(
    name: "MyUniversity",
    platforms: [
        .iOS(.v15),
    ],
    targets: [
        .executableTarget(
            name: "MyUniversity",
            // Swift Playgrounds 4 requires sources at the package root (path: ".")
            path: ".",
            resources: [
                .copy("Resources/web"),
            ]
        ),
    ]
)
