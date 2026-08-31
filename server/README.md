# Token broker contract

The iOS app calls:

```text
GET /api/live-token
```

The response must be JSON:

```json
{
  "token": "the ephemeral token name returned by Gemini"
}
```

The server must hold `GEMINI_API_KEY` as a secret and call Gemini's ephemeral-token provisioning endpoint. Constrain the token to the transcription model and text-only response modality. A one-use, short-lived token is appropriate for the first prototype.

`index.mjs` is a minimal local-only starter implementation. To run it:

```text
cd server
npm install
$env:GEMINI_API_KEY = "your-key"
$env:WEB_ORIGIN = "http://localhost:5173"
$env:SUPABASE_URL = "https://jjdcjuxeuxbnxggxzbsl.supabase.co"
$env:SUPABASE_PUBLISHABLE_KEY = "sb_publishable_..."
npm start
```

The PWA in `web/` is configured for the local broker at `http://localhost:8787/api/live-token`. For deployment, change `TOKEN_ENDPOINT` in `web/app.js` to the HTTPS broker URL and set `WEB_ORIGIN` to the PWA's HTTPS origin.

By default, `/api/live-token` and `/api/translate` require a valid Supabase user session sent as:

```text
Authorization: Bearer <supabase-access-token>
```

For a temporary local-only diagnostic run, authentication can be disabled with `AUTH_REQUIRED=false`, but this must never be used for a public deployment.

The PWA also calls:

```text
POST /api/translate
```

With JSON:

```json
{
  "text": "the finalized transcript segment",
  "sourceLanguage": "en",
  "targetLanguage": "fr"
}
```

The response is:

```json
{
  "translation": "translated text"
}
```

Supported MVP target languages are `en`, `fr`, `ja`, and `de`. This route uses `GEMINI_TRANSLATE_MODELS` when set as a comma-separated fallback list, otherwise `gemini-3.5-flash-lite,gemini-3.5-flash`.

In a second PowerShell window, serve the PWA:

```text
node web/server.mjs
```

For a physical iPhone, the app cannot reach the computer using `localhost`; use the computer's local network address during development or deploy the broker behind HTTPS and update `AppConfig.swift`.

Do not proxy the continuous audio stream through this server unless there is a specific product or compliance reason. The intended flow is: authenticated iOS app → token broker → direct iOS WebSocket connection to Gemini.

Before production, add rate limiting, usage limits, structured logging without audio, and a clear token-expiry/reconnection strategy for lectures longer than one session.
