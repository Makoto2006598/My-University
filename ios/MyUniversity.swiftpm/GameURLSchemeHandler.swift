import WebKit

/// Serves the bundled web game files over the custom `game://` URL scheme.
///
/// Using a custom scheme (rather than `file://`) lets WKWebView treat the
/// origin as a secure context, which enables:
///   • localStorage / sessionStorage
///   • Web Crypto API
///   • Service Workers (if needed in the future)
///
/// All requests to `game://localhost/<path>` are resolved against the
/// `web/` resource directory that was copied into the app bundle by
/// `scripts/build-ios.sh`.
final class GameURLSchemeHandler: NSObject, WKURLSchemeHandler {

    // Root URL of the bundled web assets inside the app bundle.
    private let webRoot: URL = {
        guard let root = Bundle.module.resourceURL?.appendingPathComponent("web") else {
            fatalError("web/ resource directory missing – run scripts/build-ios.sh first")
        }
        return root
    }()

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let requestURL = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }

        let relativePath = requestURL.path.isEmpty ? "index.html"
                         : String(requestURL.path.dropFirst()) // strip leading "/"

        let fileURL = webRoot.appendingPathComponent(relativePath.isEmpty ? "index.html" : relativePath)

        // Serve the file, or fall back to index.html only for HTML navigation
        // (SPA client-side routing). Never fall back for asset requests (.js,
        // .css, .png, etc.) – those should 404 cleanly rather than returning
        // HTML, which would corrupt the resource.
        let isAssetRequest = !fileURL.pathExtension.isEmpty && fileURL.pathExtension != "html"
        let targetURL: URL
        if FileManager.default.fileExists(atPath: fileURL.path) {
            targetURL = fileURL
        } else if isAssetRequest {
            // Return 404 for missing assets.
            let response = HTTPURLResponse(url: requestURL, statusCode: 404,
                                           httpVersion: "HTTP/1.1", headerFields: nil)!
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didReceive(Data())
            urlSchemeTask.didFinish()
            return
        } else {
            targetURL = webRoot.appendingPathComponent("index.html")
        }

        do {
            let data = try Data(contentsOf: targetURL)
            let mime = mimeType(for: targetURL.pathExtension)
            let response = HTTPURLResponse(
                url: requestURL,
                statusCode: 200,
                httpVersion: "HTTP/1.1",
                headerFields: [
                    "Content-Type": mime,
                    "Content-Length": String(data.count),
                    // Allow the page to call any same-origin fetch.
                    "Access-Control-Allow-Origin": "*",
                ]
            )!
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didReceive(data)
            urlSchemeTask.didFinish()
        } catch {
            urlSchemeTask.didFailWithError(error)
        }
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // No async work to cancel.
    }

    // MARK: - MIME helpers

    private func mimeType(for ext: String) -> String {
        switch ext.lowercased() {
        case "html":        return "text/html; charset=utf-8"
        case "js", "mjs":   return "application/javascript; charset=utf-8"
        case "css":         return "text/css; charset=utf-8"
        case "json":        return "application/json; charset=utf-8"
        case "png":         return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "gif":         return "image/gif"
        case "svg":         return "image/svg+xml"
        case "ico":         return "image/x-icon"
        case "woff":        return "font/woff"
        case "woff2":       return "font/woff2"
        case "ttf":         return "font/ttf"
        default:            return "application/octet-stream"
        }
    }
}
