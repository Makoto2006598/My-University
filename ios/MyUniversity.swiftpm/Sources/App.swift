import SwiftUI

@main
struct MyUniversityApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                // Lock to landscape so the campus grid fits comfortably.
                .supportedInterfaceOrientations(.landscape)
        }
    }
}
