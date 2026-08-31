# Speech2Text project handover

## Purpose

Speech2Text is intended to help a French-speaking university student follow English lectures. The app captures the teacher's speech and displays live English captions. Later, selected passages can be translated or simplified in French.

The product is an assistance tool. It is not intended to be an official or guaranteed lecture transcript.

## Important development constraint

The current development machine is Windows and there is no Mac available.

Therefore, the recommended first release is a mobile web app/PWA:

- develop on Windows;
- test first in a desktop browser;
- deploy over HTTPS;
- open it in iPhone Safari;
- optionally add it to the iPhone Home Screen.

The native SwiftUI files are retained as a future option if a Mac or cloud macOS build service becomes available. A native App Store build cannot be compiled and signed directly on this Windows machine.

## Current architecture

```text
Browser/PWA microphone
        |
        | 16-bit PCM, 16 kHz, mono audio
        v
Gemini Live API WebSocket
        |
        +--> interim transcription --> temporary caption
        |
        +--> final transcription ----> localStorage transcript

Browser/PWA --> token broker --> short-lived Gemini ephemeral token
```

The browser must never contain the permanent Gemini API key. The token broker keeps `GEMINI_API_KEY` secret and returns a short-lived token for one Live API session.

The planned public deployment is:

- Hostinger Premium for the static PWA frontend;
- Supabase for authentication and PostgreSQL data storage;
- Render for the Node.js Gemini broker.

The Supabase project is `https://jjdcjuxeuxbnxggxzbsl.supabase.co`. The frontend uses the modern publishable key format, never the service role key.

Google references used by the implementation:

- https://ai.google.dev/gemini-api/docs/live-api/live-transcribe
- https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens
- https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket

The WebSocket endpoint for ephemeral tokens is the constrained endpoint:

```text
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained
```

## Current MVP scope

The first working version should:

1. Start a lecture session.
2. Ask for microphone permission.
3. Display interim English captions.
4. Commit finalized captions without duplicate interim text.
5. Stop the session cleanly.
6. Save finalized text locally on the device.
7. Share or export the stored transcript.
8. Allow the stored text to be cleared.
9. Translate the finalized transcript into English, French, Japanese, or German on demand.
10. Organize local transcripts by workspace, course subject, and lecture session.
11. Take free-form notes inside each lecture session while transcription is running.
12. Delete lecture sessions, and delete course subjects only after their sessions have been removed.

The following are deliberately postponed:

- live French translation of every sentence;
- summaries and question answering;
- cloud account synchronization;
- raw audio retention;
- speaker identification;
- background or locked-screen recording;
- App Store distribution;
- long-lecture session resumption.

## Repository layout

```text
README.md
PROJECT_SUMMARY.md
docs/MVP_SPEC.md
docs/DEPLOYMENT_PLAN.md

web/
  index.html                 PWA page and French interface
  styles.css                 mobile-friendly visual design
  app.js                     microphone, WebSocket, captions, translations, local subject/session library
  server.mjs                 simple Node static web server
  manifest.webmanifest       PWA metadata
  sw.js                      basic offline shell cache

server/
  index.mjs                 local token broker
  package.json               @google/genai dependency and start script
  README.md                  token endpoint and setup notes

ios/Speech2Text/
  Speech2TextApp.swift      future native SwiftUI entry point
  ContentView.swift         future native caption screen
  AudioCapture.swift        future native microphone/resampling code
  LiveTranscriptionClient.swift
  LiveTranscriptionViewModel.swift
  Models.swift
  AppConfig.swift

supabase/
  schema.sql                first cloud database schema with row-level security
  add_workspaces.sql        migration for existing Supabase projects that adds the Workspaces level
  grant_api_access.sql      explicit authenticated API grants, useful if Supabase grants are missing
```

## Local Windows setup

The workspace already passed JavaScript syntax checks. To run the local prototype:

### Terminal 1: token broker

```powershell
cd "C:\Users\emmanuels\Dropbox\Applications\Speech2text\server"
npm install
$env:GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
$env:WEB_ORIGIN = "http://localhost:5173"
npm start
```

### Terminal 2: PWA server

```powershell
cd "C:\Users\emmanuels\Dropbox\Applications\Speech2text"
node web/server.mjs
```

Open this URL on the Windows computer:

```text
http://localhost:5173
```

Then grant microphone permission and test a short recording.

## Gemini configuration

The current PWA configuration is in `web/app.js`:

```javascript
const TOKEN_ENDPOINT = "https://speech2text-broker.onrender.com/api/live-token";
const TRANSLATE_ENDPOINT = "https://speech2text-broker.onrender.com/api/translate";
const MODEL = "gemini-3.5-transcribe-live";
const TARGET_SAMPLE_RATE = 16_000;
```

The token broker is configured for automatic speech-language detection and text-only response modality. The audio is resampled in the browser to 16 kHz mono PCM before being sent.

## Before testing on the iPhone

The local URL will not work from the iPhone because `localhost` on the iPhone means the iPhone itself. For phone testing:

1. Deploy the token broker to an HTTPS host.
2. Deploy the `web/` files to an HTTPS host.
3. Keep `TOKEN_ENDPOINT` and `TRANSLATE_ENDPOINT` in `web/app.js` pointed at the deployed Render broker.
4. Set the server's `WEB_ORIGIN` to the deployed PWA origin.
5. Open the PWA in Safari on the iPhone.
6. Add it to the Home Screen if desired.

The token broker must not be deployed as an unrestricted public endpoint. Before broader use, add authentication, rate limiting, usage limits, and logging that excludes audio and transcript contents.

## Known limitations and risks

- The browser version has not yet been tested against a real Gemini API key.
- The browser version has not yet been tested on an iPhone.
- Transcript copy is implemented with a clipboard-first flow: the original transcript and each translated block have their own copy button, plus a global "Copier tout" action.
- The PWA stores a local library in `speech2text.library.v1`, organized as workspaces containing course subjects, which contain lecture sessions. The UI displays one active workspace at a time; the sidebar tree only shows that workspace's courses and sessions. Older `speech2text.segments` data is migrated into a default workspace and default course on first load.
- Each lecture session now also stores a local notes field. Notes are edited in a compact panel below the transcript, autosaved while typing, and included in the full copied export.
- Lecture sessions can be deleted after an in-app confirmation. A course subject can only be deleted when it no longer contains any sessions; otherwise the delete action is disabled and the app explains why.
- Course subjects can be folded and unfolded in the sidebar with `+` / `−` controls to keep large libraries readable. Workspaces are switched from a dedicated loader instead of being shown as tree nodes.
- New lecture sessions are created with a small per-subject `+` action in the sidebar, so the insertion target is clear.
- Subjects and sessions can be reordered with subtle up/down controls that appear on row hover/focus. This was chosen over drag-and-drop for mobile reliability.
- Sidebar subjects are visually separated with thin dividers; transcript text uses the same compact reading size as translated text.
- The main header shows the active subject and session. Workspace, subject, and session names are renamed inline from the sidebar with a double-click, then Enter or blur to save.
- Main lecture actions now live in a compact top-right toolbar with icons and short labels, instead of large full-width buttons at the bottom of the screen.
- Starting a recording expands the active course subject in the sidebar so the active lecture remains visible.
- On mobile, starting a recording switches to a compact lecture layout: the course tree is temporarily hidden, transcript and notes get priority, and nonessential translation/diagnostic panels are tucked away until recording stops.
- Supabase Auth is wired into the PWA with email/password sign-up, sign-in, and sign-out. A first authenticated cloud sync now mirrors the local library to Supabase and reloads existing cloud data on sign-in.
- The Gemini broker now requires a valid Supabase access token for `/api/live-token` and `/api/translate`, unless `AUTH_REQUIRED=false` is explicitly set for local diagnostics.
- The interface is bilingual English/French with flag buttons, defaults to English, and uses an in-app dialog rather than the browser prompt when creating a course.
- The PWA sends the Gemini setup message as soon as the WebSocket opens and waits briefly after `audioStreamEnd` so the final transcript is not cut off during stop.
- Browser WebSocket messages from Gemini may arrive as `Blob` objects; the PWA decodes string, `Blob`, and `ArrayBuffer` messages before parsing JSON.
- The stop flow now waits only briefly when no interim caption is pending, and waits longer only when a final transcript may still arrive. Diagnostics log concise lifecycle events instead of full Gemini JSON.
- The finalized transcript can be translated on demand through `POST /api/translate`; the browser never receives the permanent Gemini API key. Translation controls are global, not repeated after each segment.
- Translation defaults to fast text models (`gemini-3.5-flash-lite`, then `gemini-3.5-flash`) with per-model timeouts. Override with `GEMINI_TRANSLATE_MODELS` if needed.
- The token broker currently has minimal protection and is suitable only for local development.
- Ephemeral tokens and live sessions expire; lectures longer than one session require session resumption or reconnection logic.
- Wi-Fi quality, classroom distance, accents, background noise, and technical vocabulary will affect accuracy.
- The first version should stay in the foreground because iOS may suspend microphone/WebSocket activity when the screen is locked or backgrounded.
- Obtain teacher permission and follow university/classroom rules before recording or transmitting classroom audio.
- Audio is sent to Google for transcription; this must be clearly disclosed to users.

## Recommended next steps

1. Create a Gemini API key.
2. Run the local token broker and PWA using the commands above.
3. Test a short lecture or prepared English audio in a desktop browser.
4. Fix any Gemini authentication or WebSocket message-format errors.
5. Measure latency and transcription quality with real university vocabulary.
6. Run `supabase/schema.sql` in the Supabase SQL Editor.
7. For an existing Supabase project, execute `supabase/add_workspaces.sql` before testing the updated app.
8. Execute `supabase/grant_api_access.sql` if API grants are missing on the Supabase project.
9. Test authenticated cloud sync from the browser with a real user account.
10. Deploy the broker to Render and require a valid Supabase session before issuing Gemini tokens.
11. Deploy the static PWA to Hostinger Premium over HTTPS and test on the iPhone in Safari.
12. Add long-session reconnection/session resumption.
12. Decide whether a native iOS build is worth the cost of a Mac or cloud macOS service.

## Product direction after MVP

The most useful next feature is probably not continuous translation. It is a button on a finalized caption segment:

```text
Select passage -> Translate to French
                Explain difficult words
                Simplify the English
```

This keeps the live captions responsive and lets the student request help only when needed.
