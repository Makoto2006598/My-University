// swift-tools-version: 5.8
import PackageDescription

let package = Package(
    name: "MyUniversity",
    platforms: [
        .iOS("16.0")
    ],
    products: [
        .iOSApplication(
            name: "MyUniversity",
            targets: ["AppModule"],
            bundleIdentifier: "com.myuniversity.game",
            teamIdentifier: "",
            displayVersion: "1.0",
            bundleVersion: "1",
            appIcon: .placeholder(icon: .book),
            accentColor: .presetColor(.blue),
            supportedDeviceFamilies: [
                .pad,
                .phone
            ],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeRight,
                .landscapeLeft,
                .portraitUpsideDown(.when(deviceFamilies: [.pad]))
            ]
        )
    ],
    targets: [
        .executableTarget(
            name: "AppModule",
            path: "Sources"
        )
    ]
)
