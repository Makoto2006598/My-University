// swift-tools-version: 5.9
import PackageDescription
import AppleProductTypes

let package = Package(
    name: "MyUniversity",
    platforms: [
        .iOS(.v16),
    ],
    products: [
        // Swift Playgrounds 4 requires .iOSApplication product to recognize
        // this package as a runnable App (not just a library/playground).
        .iOSApplication(
            name: "MyUniversity",
            targets: ["MyUniversity"],
            bundleIdentifier: "com.myuniversity.campusplanner",
            displayVersion: "1.0",
            bundleVersion: "1",
            appCategory: .games,
            supportedDeviceFamilies: [.pad, .phone],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeLeft,
                .landscapeRight,
            ]
        ),
    ],
    targets: [
        .executableTarget(
            name: "MyUniversity",
            path: ".",
            resources: [
                .copy("Resources/web"),
            ]
        ),
    ]
)
