import SwiftUI
import WebKit

/// SwiftUI wrapper around WKWebView that loads the bundled web game.
///
/// The game is served via a custom `game://` URL scheme so that:
///   • localStorage works (blocked on plain file:// in WKWebView)
///   • The page runs in a secure context
///
/// Pre-requisite: run `./scripts/build-ios.sh` from the project root to
/// populate `Sources/Resources/web/` before building in Xcode / Swift Playgrounds.
struct GameWebView: UIViewRepresentable {

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()

        // Register our custom URL scheme handler.
        config.setURLSchemeHandler(GameURLSchemeHandler(), forURLScheme: "game")

        // Allow inline media (sound effects if added later) without requiring a tap.
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        // Enable JavaScript (required by the React game).
        let pagePrefs = WKWebpagePreferences()
        pagePrefs.allowsContentJavaScript = true
        config.defaultWebpagePreferences = pagePrefs

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.isScrollEnabled = false   // campus map handles its own pan/zoom
        webView.scrollView.bounces = false
        webView.isOpaque = true
        webView.backgroundColor = .white

        // Disable the long-press text selection magnifier.
        webView.configuration.userContentController.addUserScript(
            WKUserScript(
                source: "document.documentElement.style.webkitUserSelect='none';",
                injectionTime: .atDocumentEnd,
                forMainFrameOnly: false
            )
        )

        // Load the game from the custom scheme.
        let startURL = URL(string: "game://localhost/")!
        webView.load(URLRequest(url: startURL))

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        // Nothing to update – the web app manages its own state.
    }
}
