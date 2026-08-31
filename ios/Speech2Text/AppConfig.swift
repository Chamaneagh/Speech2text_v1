import Foundation

enum AppConfig {
    // Replace this with the deployed HTTPS token-broker URL before device testing.
    static let tokenEndpoint = URL(string: "https://YOUR-BACKEND.example/api/live-token")!

    static let model = "gemini-3.5-transcribe-live"
    static let languageCode = "en-US"
    static let audioSampleRate = 16_000
}

