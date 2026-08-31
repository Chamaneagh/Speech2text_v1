# Speech2Text MVP specification

## User outcome

The student can start a lecture and read a large, continuously updating English transcript when she does not fully understand the teacher.

This is an assistance tool, not an official recording or guaranteed transcript.

## MVP user flow

1. Open the app.
2. Tap **Démarrer le cours**.
3. Grant microphone permission if requested.
4. Read live English captions while the lecture continues.
5. Tap **Arrêter** at the end.
6. Review or copy the locally saved transcript.
7. Create or select a workspace, course subject, and lecture session for the transcript.
8. Add personal notes to the active lecture session while listening.
9. Delete obsolete lecture sessions; delete a course subject only after it has no sessions left.

## Deliberately postponed

- live French translation of every sentence;
- automatic lecture recording;
- cloud transcript storage or account synchronization;
- speaker identification;
- background/locked-screen recording;
- summaries and question answering;
- multi-user distribution.

## Technical decisions

- Responsive mobile web interface/PWA for the first release, so development and testing can happen on Windows.
- Browser microphone capture using `getUserMedia` and Web Audio.
- Browser WebSocket for the Gemini Live connection.
- Native SwiftUI remains a later option if a Mac or cloud macOS build service becomes available.
- 16-bit PCM, 16 kHz, mono audio chunks.
- Interim text is displayed temporarily and never saved as a permanent segment.
- Final text is saved as transcript segments.
- Transcript segments are grouped locally by workspace, course subject, and lecture session. Only one workspace is displayed at a time; users load another workspace from a dedicated workspace switcher.
- Free-form lecture notes are stored locally on the active session and autosaved while typing.
- English is the initial speech-language hint (`en-US`); make this configurable after testing.
- Verbatim transcription is the initial mode so the app does not silently rewrite the teacher's words.
- Raw audio is not retained by the app in the MVP.

## Acceptance criteria for the first device test

- The app asks for microphone permission with a clear explanation.
- Starting a session shows a visible recording indicator.
- Starting a session expands the active course in the sidebar and keeps the active lecture visually selected.
- Finalized captions appear without duplicate interim text.
- Stopping the session closes the audio stream and WebSocket cleanly.
- The app shows a useful error for missing permission, missing token, network failure, or expired session.
- A 10-minute test session can be reviewed after stopping.
- Notes typed during a session remain attached to the correct lecture after switching away and back.
- Deleting a course that still contains sessions is blocked; deleting an empty course asks for confirmation.

## Privacy and classroom requirements

Before real classroom use, obtain the teacher's permission and follow university rules. The app must clearly show when audio is being transmitted. The privacy screen should explain that live audio is sent to Google for transcription, and the app should provide deletion controls for saved transcripts.

## Next technical milestone

Run the token broker and PWA locally, test one 10-minute session in a desktop browser, then deploy both over HTTPS and test on a real iPhone. Only after that test should we add French translation or long-lecture session resumption.
