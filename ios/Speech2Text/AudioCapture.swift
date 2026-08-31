import AVFoundation
import Foundation

final class AudioCapture {
    private let audioEngine = AVAudioEngine()
    private var converter: AVAudioConverter?
    private var targetFormat: AVAudioFormat?

    var onPCMData: ((Data) -> Void)?
    var onError: ((Error) -> Void)?

    func start() throws {
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: [.duckOthers])
        try audioSession.setPreferredSampleRate(Double(AppConfig.audioSampleRate))
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)

        let inputNode = audioEngine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)
        guard let format = AVAudioFormat(
            commonFormat: .pcmFormatInt16,
            sampleRate: Double(AppConfig.audioSampleRate),
            channels: 1,
            interleaved: true
        ) else {
            throw AudioCaptureError.cannotCreateTargetFormat
        }

        targetFormat = format
        converter = AVAudioConverter(from: inputFormat, to: format)

        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 2_048, format: inputFormat) { [weak self] buffer, _ in
            self?.convertAndEmit(buffer)
        }

        audioEngine.prepare()
        try audioEngine.start()
    }

    func stop() {
        audioEngine.inputNode.removeTap(onBus: 0)
        audioEngine.stop()
        converter = nil
        targetFormat = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    private func convertAndEmit(_ inputBuffer: AVAudioPCMBuffer) {
        guard let converter, let targetFormat else { return }

        let ratio = targetFormat.sampleRate / inputBuffer.format.sampleRate
        let capacity = AVAudioFrameCount(Double(inputBuffer.frameLength) * ratio) + 1
        guard let outputBuffer = AVAudioPCMBuffer(
            pcmFormat: targetFormat,
            frameCapacity: capacity
        ) else { return }

        var suppliedInput = false
        var conversionError: NSError?
        converter.convert(to: outputBuffer, error: &conversionError) { _, status in
            if suppliedInput {
                status.pointee = .noDataNow
                return nil
            }
            suppliedInput = true
            status.pointee = .haveData
            return inputBuffer
        }

        if let conversionError {
            onError?(conversionError)
            return
        }

        guard let channelData = outputBuffer.int16ChannelData else { return }
        let bytesPerFrame = Int(targetFormat.streamDescription.pointee.mBytesPerFrame)
        let byteCount = Int(outputBuffer.frameLength) * bytesPerFrame
        let data = Data(bytes: channelData[0], count: byteCount)
        onPCMData?(data)
    }
}

enum AudioCaptureError: LocalizedError {
    case cannotCreateTargetFormat

    var errorDescription: String? {
        "Impossible de préparer le format audio du microphone."
    }
}

