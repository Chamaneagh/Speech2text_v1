import Foundation
import AVFoundation
import Combine

@MainActor
final class LiveTranscriptionViewModel: ObservableObject {
    @Published private(set) var status: TranscriptionStatus = .idle
    @Published private(set) var segments: [TranscriptSegment] = []
    @Published private(set) var interimText = ""
    @Published var errorMessage: String?

    private let audioCapture = AudioCapture()
    private var client: LiveTranscriptionClient?

    init() {
        audioCapture.onPCMData = { [weak self] data in
            self?.client?.sendAudio(data)
        }
        audioCapture.onError = { [weak self] error in
            Task { @MainActor in
                self?.fail(error.localizedDescription)
            }
        }
    }

    func start() {
        guard status == .idle || isFailed else { return }
        errorMessage = nil
        segments = []
        interimText = ""
        status = .connecting

        Task {
            do {
                let token = try await fetchEphemeralToken()
                let newClient = LiveTranscriptionClient()
                client = newClient
                newClient.onConnected = { [weak self] in
                    Task { @MainActor in
                        guard let self else { return }
                        do {
                            try self.audioCapture.start()
                            self.status = .listening
                        } catch {
                            self.fail(error.localizedDescription)
                        }
                    }
                }
                newClient.onInterimText = { [weak self] text in
                    Task { @MainActor in self?.interimText = text }
                }
                newClient.onFinalText = { [weak self] text in
                    Task { @MainActor in
                        guard let self, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
                        self.segments.append(TranscriptSegment(text: text))
                        self.interimText = ""
                    }
                }
                newClient.onDisconnected = { [weak self] error in
                    Task { @MainActor in
                        guard let self, self.status == .listening else { return }
                        self.audioCapture.stop()
                        self.fail(error?.localizedDescription ?? "La connexion a été interrompue.")
                    }
                }
                newClient.connect(token: token, languageCode: AppConfig.languageCode)
            } catch {
                fail(error.localizedDescription)
            }
        }
    }

    func stop() {
        guard status == .listening || status == .connecting else { return }
        status = .stopping
        audioCapture.stop()
        client?.stop()
        client = nil
        interimText = ""
        status = .idle
    }

    private var isFailed: Bool {
        if case .failed = status { return true }
        return false
    }

    private func fetchEphemeralToken() async throws -> String {
        var request = URLRequest(url: AppConfig.tokenEndpoint)
        request.httpMethod = "GET"
        request.timeoutInterval = 15

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode) else {
            throw TokenError.invalidResponse
        }
        let result = try JSONDecoder().decode(TokenResponse.self, from: data)
        guard !result.token.isEmpty else { throw TokenError.emptyToken }
        return result.token
    }

    private func fail(_ message: String) {
        audioCapture.stop()
        client?.stop()
        client = nil
        errorMessage = message
        status = .failed(message)
    }
}

private struct TokenResponse: Decodable {
    let token: String
}

private enum TokenError: LocalizedError {
    case invalidResponse
    case emptyToken

    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "Le serveur de connexion n'a pas fourni de jeton valide."
        case .emptyToken: return "Le jeton de connexion est vide."
        }
    }
}
