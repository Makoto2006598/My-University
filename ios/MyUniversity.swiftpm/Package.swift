// swift-tools-version: 5.9
import PackageDescription
import AppleProductTypes

let package = Package(
    name: "MyUniversity",
    platforms: [
        .iOS(.v16),
    ],
    products: [
        .iOSApplication(
            name: "MyUniversity",
            targets: ["MyUniversity"],
            bundleIdentifier: "com.myuniversity.campusplanner",
            displayVersion: "1.0",
            bundleVersion: "1",
            supportedDeviceFamilies: [.pad, .phone],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeLeft,
                .landscapeRight,
            ],
            appCategory: .games
        ),
    ],
    targets: [
        .executableTarget(
            name: "MyUniversity",
            path: "."
        ),
    ]
)
