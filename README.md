# Speech2Text

An iPhone-friendly companion for students who need live English captions during university lectures.

Because iOS builds require Xcode on macOS, the recommended first release is the mobile web app in `web/`. It can be developed on Windows, served over HTTPS, opened in iPhone Safari, and added to the Home Screen. The Swift files in `ios/` remain as a future native-app route.

The first milestone is a foreground-only SwiftUI prototype that:

- captures microphone audio;
- streams 16 kHz mono PCM to Gemini Live transcription;
- displays interim and finalized English captions; and
- keeps finalized transcript segments locally on the device.

The permanent Gemini API key must stay on a backend. The iOS app should receive a short-lived Gemini ephemeral token from that backend before opening its WebSocket connection.

## Repository layout

- `docs/MVP_SPEC.md` — product scope, acceptance criteria, and privacy decisions.
- `docs/DEPLOYMENT_PLAN.md` — Hostinger/Supabase/Render deployment plan.
- `supabase/schema.sql` — first Supabase database and row-level-security schema.
- `supabase/add_workspaces.sql` — migration that adds the Workspaces level above courses for existing Supabase projects.
- `supabase/admin_usage.sql` — migration that adds admin users and usage-event tracking.
- `web/` — recommended Windows-to-iPhone PWA prototype.
- `ios/Speech2Text/` — native SwiftUI source skeleton for a future Mac/Xcode build.
- `server/README.md` — token-broker contract and setup notes.

## Recommended first test

Run the token broker and web app on Windows, test transcription in a desktop browser first, then deploy both pieces over HTTPS for testing on the iPhone. The browser microphone requires a secure context on the phone; a plain local network URL is not a suitable final test route.

The included `web/server.mjs` serves the PWA without installing another web-server package.

## Current development boundary

This workspace is being prepared on Windows. Xcode, the iOS simulator, and native iPhone signing are therefore not available here. The Swift source is organized for import into a new Xcode iOS App project and must be compiled and tested on macOS before use.

Before running the app, configure:

1. `NSMicrophoneUsageDescription` in the app's `Info.plist`.
2. The backend URL in `AppConfig.swift`.
3. A backend endpoint that returns a constrained ephemeral Gemini token.
