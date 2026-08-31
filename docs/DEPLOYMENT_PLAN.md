# Deployment plan

## Target architecture

```text
Hostinger Premium static site
  hosts the PWA frontend
  uses HTTPS and a public domain

Supabase project
  handles user sign-up/sign-in
  stores workspaces, courses, lecture sessions, notes, transcript segments, and translations
  enforces row-level security per authenticated user

Render Node.js web service
  keeps GEMINI_API_KEY private
  creates Gemini Live ephemeral tokens
  performs server-side translation requests
  validates Supabase JWTs before issuing Gemini access
```

Supabase project URL:

```text
https://jjdcjuxeuxbnxggxzbsl.supabase.co
```

Temporary Hostinger frontend URL:

```text
https://floralwhite-pheasant-876581.hostingersite.com
```

## Why this split

Hostinger Premium can host static sites and WordPress, but not a Node.js Web App. The current Gemini broker is Node.js and should stay server-side because it protects the permanent Gemini API key.

Supabase is a good fit for authentication and database storage. Render is a good fit for the small Node.js broker because it can run the existing backend with environment variables.

## Phase 1: Cloud-ready local app

1. Keep the local `localStorage` library as an offline fallback.
2. Supabase auth is wired into the PWA with email/password sign-up, sign-in, and sign-out.
3. Add a cloud sync layer that maps local records to Supabase rows.
4. Keep recording usable only after sign-in for the public version.
5. Send the user's Supabase access token to the Render broker for protected Gemini token and translation calls.

## Phase 2: Supabase setup

1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.
   For an existing project that already has the first schema, run `supabase/add_workspaces.sql` instead to migrate the current data.
3. Enable email authentication.
4. Configure the site URL and redirect URLs once the Hostinger domain is known.
5. Copy the Supabase `anon` public key into the frontend config.

Do not put the Supabase service role key in the frontend. If it is ever needed, keep it only in the Render environment.

## Phase 3: Render backend

Create a Render Web Service from the backend project with:

```text
Root directory: server
Build command: npm install
Start command: npm start
```

Required environment variables:

```text
GEMINI_API_KEY=...
WEB_ORIGIN=https://floralwhite-pheasant-876581.hostingersite.com
SUPABASE_URL=https://jjdcjuxeuxbnxggxzbsl.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The backend should reject `/api/live-token` and `/api/translate` requests that do not include a valid Supabase user session.

## Phase 4: Hostinger frontend

1. Build or package the static `web/` folder.
2. Upload it to Hostinger Premium.
3. Configure the frontend endpoints:

```javascript
const TOKEN_ENDPOINT = "https://your-render-service.onrender.com/api/live-token";
const TRANSLATE_ENDPOINT = "https://your-render-service.onrender.com/api/translate";
```

4. Set Supabase redirect URLs to the Hostinger domain.
5. Test on desktop and smartphone.

## First public beta checklist

- Sign-up and sign-in work.
- A signed-out user cannot request a Gemini token.
- A signed-in user sees only their own workspaces, and can load one workspace at a time with its courses and sessions.
- Course deletion is blocked while sessions exist.
- Recording works on mobile Safari/Chrome while the app stays in the foreground.
- Notes autosave to Supabase and still work locally during temporary network loss.
- No raw audio is stored by the app.
- The privacy text clearly says that live audio is sent to Google for transcription.
