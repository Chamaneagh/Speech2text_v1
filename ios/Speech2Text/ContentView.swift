import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = LiveTranscriptionViewModel()

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                statusView

                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 14) {
                            ForEach(viewModel.segments) { segment in
                                Text(segment.text)
                                    .font(.title3)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .id(segment.id)
                            }

                            if !viewModel.interimText.isEmpty {
                                Text(viewModel.interimText)
                                    .font(.title3)
                                    .foregroundStyle(.secondary)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .italic()
                            }
                        }
                        .padding(.horizontal)
                    }
                    .onChange(of: viewModel.segments.count) { _, _ in
                        if let lastID = viewModel.segments.last?.id {
                            withAnimation { proxy.scrollTo(lastID, anchor: .bottom) }
                        }
                    }
                }

                Button(action: toggleSession) {
                    Label(
                        viewModel.status == .listening ? "Arrêter" : "Démarrer le cours",
                        systemImage: viewModel.status == .listening ? "stop.circle.fill" : "mic.circle.fill"
                    )
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                }
                .buttonStyle(.borderedProminent)
                .tint(viewModel.status == .listening ? .red : .blue)
                .disabled(viewModel.status == .connecting || viewModel.status == .stopping)

                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }

                Text("Les sous-titres sont une aide et peuvent contenir des erreurs.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .navigationTitle("Speech2Text")
        }
    }

    private var statusView: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(viewModel.status == .listening ? .red : .secondary)
                .frame(width: 10, height: 10)
            Text(viewModel.status.label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
        }
    }

    private func toggleSession() {
        if viewModel.status == .listening {
            viewModel.stop()
        } else {
            viewModel.start()
        }
    }
}

#Preview {
    ContentView()
}

