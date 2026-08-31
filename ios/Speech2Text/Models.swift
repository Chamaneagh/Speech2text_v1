import Foundation

struct TranscriptSegment: Identifiable, Codable, Hashable {
    let id: UUID
    let text: String
    let createdAt: Date

    init(text: String) {
        self.id = UUID()
        self.text = text
        self.createdAt = Date()
    }
}

enum TranscriptionStatus: Equatable {
    case idle
    case connecting
    case listening
    case stopping
    case failed(String)

    var label: String {
        switch self {
        case .idle: return "Prêt"
        case .connecting: return "Connexion…"
        case .listening: return "Écoute en cours"
        case .stopping: return "Arrêt…"
        case .failed(let message): return message
        }
    }
}

