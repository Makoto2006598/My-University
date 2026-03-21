// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MyUniversity",
    platforms: [
        .iOS(.v16),
    ],
    targets: [
        .executableTarget(
            name: "MyUniversity",
            path: "Sources",
            resources: [
                // Copy the entire web/ directory (built by scripts/build-ios.sh)
                // into the app bundle so WKWebView can load it locally.
                .copy("Resources/web"),
            ]
        ),
    ]
)
