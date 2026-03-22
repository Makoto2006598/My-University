// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MyUniversity",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .iOSApplication(
            name: "MyUniversity",
            targets: ["MyUniversity"],
            bundleIdentifier: "com.myuniversity.game",
            teamIdentifier: "",
            displayVersion: "1.0",
            bundleVersion: "1",
            appIcon: .placeholder(icon: .graduationCap),
            accentColor: .presetColor(.blue),
            supportedDeviceFamilies: [.pad, .phone],
            supportedInterfaceOrientations: [
                .landscapeRight,
                .landscapeLeft
            ],
            appCategory: .games
        )
    ],
    targets: [
        .executableTarget(
            name: "MyUniversity",
            path: "Sources"
        )
    ]
)
