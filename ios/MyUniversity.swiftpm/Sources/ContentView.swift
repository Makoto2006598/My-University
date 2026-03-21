import SwiftUI

struct ContentView: View {
    var body: some View {
        GameWebView()
            // Extend into safe-area / notch so the full screen is used.
            .ignoresSafeArea()
            // Force light mode to match the web game's colour scheme.
            .preferredColorScheme(.light)
    }
}
