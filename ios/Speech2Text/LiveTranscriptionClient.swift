import Foundation

final class LiveTranscriptionClient: NSObject, URLSessionWebSocketDelegate {
    var onInterimText: ((String) -> Void)?
    var onFinalText: ((String) -> Void)?
    var onConnected: (() -> Void)?
    var onDisconnected: ((Error?) -> Void)?

    private var session: URLSession?
    private var socket: URLSessionWebSocketTask?
    private var languageCode = AppConfig.languageCode

    func connect(token: String, languageCode: String) {
        self.languageCode = languageCode
        var components = URLComponents(
            string: "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained"
        )!
        components.queryItems = [URLQueryItem(name: "access_token", value: token)]

        let configuration = URLSessionConfiguration.default
        session = URLSession(configuration: configuration, delegate: self, delegateQueue: nil)
        socket = session?.webSocketTask(with: components.url!)
        socket?.resume()

        receiveNextMessage()
    }

    func sendAudio(_ data: Data) {
        sendJSON([
            "realtimeInput": [
                "audio": [
                    "data": data.base64EncodedString(),
                    "mimeType": "audio/pcm;rate=16000"
                ]
            ]
        ])
    }

    func stop() {
        sendJSON(["realtimeInput": ["audioStreamEnd": true]])
        socket?.cancel(with: .normalClosure, reason: nil)
        session?.invalidateAndCancel()
        socket = nil
        session = nil
    }

    private func sendSetup(languageCode: String) {
        sendJSON([
            "setup": [
                "model": "models/\(AppConfig.model)",
                "generationConfig": [
                    "responseModalities": ["TEXT"]
                ],
                "inputAudioTranscription": [
                    "languageCodes": [languageCode]
                ]
            ]
        ])
    }

    private func sendJSON(_ object: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: object),
              let text = String(data: data, encoding: .utf8) else { return }
        socket?.send(.string(text)) { error in
            if let error {
                self.onDisconnected?(error)
            }
        }
    }

    private func receiveNextMessage() {
        socket?.receive { [weak self] result in
            guard let self else { return }

            switch result {
            case .success(.string(let text)):
                self.handle(text: text)
                self.receiveNextMessage()
            case .success(.data(let data)):
                if let text = String(data: data, encoding: .utf8) {
                    self.handle(text: text)
                }
                self.receiveNextMessage()
            case .failure(let error):
                self.onDisconnected?(error)
            @unknown default:
                self.receiveNextMessage()
            }
        }
    }

    private func handle(text: String) {
        guard let data = text.data(using: .utf8),
              let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let serverContent = root["serverContent"] as? [String: Any] else { return }

        if let interim = serverContent["interimInputTranscription"] as? [String: Any],
           let value = interim["text"] as? String {
            onInterimText?(value)
        }

        if let finalized = serverContent["inputTranscription"] as? [String: Any],
           let value = finalized["text"] as? String {
            onFinalText?(value)
        }
    }

    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
        sendSetup(languageCode: languageCode)
        onConnected?()
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        onDisconnected?(error)
    }
}
