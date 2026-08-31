import http from "node:http";
import { GoogleGenAI } from "@google/genai";

const port = Number(process.env.PORT ?? 8787);
const apiKey = process.env.GEMINI_API_KEY;
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";
const supabaseUrl = process.env.SUPABASE_URL ?? "https://jjdcjuxeuxbnxggxzbsl.supabase.co";
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_81wK9xZIlCC9CBukLWIu-g_yx851dCK";
const authRequired = process.env.AUTH_REQUIRED !== "false";
const authTimeoutMs = Number(process.env.AUTH_TIMEOUT_MS ?? 8_000);
const translateModels = (process.env.GEMINI_TRANSLATE_MODELS ?? "gemini-3.5-flash-lite,gemini-3.5-flash")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const translateTimeoutMs = Number(process.env.TRANSLATE_TIMEOUT_MS ?? 12_000);
const serverVersion = "2026-08-30.auth-timeout";
const targetLanguages = new Map([
  ["en", "English"],
  ["fr", "French"],
  ["ja", "Japanese"],
  ["de", "German"]
]);

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is required");
}

if (authRequired && (!supabaseUrl || !supabasePublishableKey)) {
  throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required when AUTH_REQUIRED is enabled");
}

const client = new GoogleGenAI({ apiKey });

function sendJSON(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": webOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  response.end(JSON.stringify(body));
}

class AuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.statusCode = 401;
  }
}

async function authenticateRequest(request) {
  if (!authRequired) return undefined;

  const authorization = request.headers.authorization ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new AuthError();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), authTimeoutMs);

  let response;
  try {
    response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${match[1]}`
      },
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") throw new AuthError("Supabase authentication timed out");
    throw new AuthError("Unable to validate Supabase session");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw new AuthError("Invalid or expired session");
  const user = await response.json().catch(() => undefined);
  if (!user?.id) throw new AuthError("Invalid Supabase user");
  return user;
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function parseJSONBody(body) {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("Invalid JSON");
  }
}

function getSourceLanguageName(sourceLanguage) {
  if (!sourceLanguage) return "the detected source language";
  const baseLanguage = sourceLanguage.toLowerCase().split("-")[0];
  return targetLanguages.get(baseLanguage) ?? sourceLanguage;
}

async function translateText({ text, targetLanguage, sourceLanguage }) {
  const targetLanguageName = targetLanguages.get(targetLanguage);
  if (!targetLanguageName) {
    const allowed = [...targetLanguages.keys()].join(", ");
    throw new Error(`Unsupported target language. Use one of: ${allowed}`);
  }

  const sourceLanguageName = getSourceLanguageName(sourceLanguage);
  const prompt = [
    `Translate from ${sourceLanguageName} to ${targetLanguageName}.`,
    "Return only the translation. Preserve meaning, names, numbers, and academic terms.",
    text
  ].join("\n");

  const failures = [];
  for (const model of translateModels) {
    try {
      return await generateTranslation({ model, prompt });
    } catch (error) {
      failures.push(`${model}: ${error.message}`);
    }
  }

  throw new Error(`Translation failed after ${translateModels.length} attempt(s). ${failures.join(" | ")}`);
}

async function generateTranslation({ model, prompt }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), translateTimeoutMs);

  try {
    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048
        }
      }),
      signal: controller.signal
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error?.message || `HTTP ${response.status}`);

    const translation = result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!translation) throw new Error("empty response");
    return translation;
  } catch (error) {
    if (error.name === "AbortError") throw new Error(`timed out after ${translateTimeoutMs} ms`);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": webOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJSON(response, 200, {
      ok: true,
      version: serverVersion,
      features: ["live-token", "translate", "supabase-auth"],
      authRequired,
      authTimeoutMs,
      translateModels,
      translateTimeoutMs
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/translate") {
    try {
      await authenticateRequest(request);
      const body = parseJSONBody(await readRequestBody(request));
      const text = typeof body.text === "string" ? body.text.trim() : "";
      const targetLanguage = typeof body.targetLanguage === "string" ? body.targetLanguage : "";
      const sourceLanguage = typeof body.sourceLanguage === "string" ? body.sourceLanguage : "";

      if (!text) {
        sendJSON(response, 400, { error: "Text is required" });
        return;
      }

      const translation = await translateText({ text, targetLanguage, sourceLanguage });
      if (!translation) {
        sendJSON(response, 502, { error: "Gemini returned an empty translation" });
        return;
      }

      sendJSON(response, 200, { translation });
    } catch (error) {
      if (error.statusCode !== 401) console.error("Unable to translate transcript", error);
      sendJSON(response, error.statusCode ?? 502, { error: error.message || "Unable to translate transcript" });
    }
    return;
  }

  if (request.method !== "GET" || url.pathname !== "/api/live-token") {
    sendJSON(response, 404, { error: "Not found" });
    return;
  }

  try {
    await authenticateRequest(request);
    const now = Date.now();
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60 * 1000),
        newSessionExpireTime: new Date(now + 60 * 1000),
        liveConnectConstraints: {
          model: "gemini-3.5-transcribe-live",
          config: {
            responseModalities: ["TEXT"],
            inputAudioTranscription: {
              languageCodes: []
            }
          }
        }
      }
    });

    sendJSON(response, 200, { token: token.name });
  } catch (error) {
    if (error.statusCode !== 401) console.error("Unable to create ephemeral token", error);
    sendJSON(response, error.statusCode ?? 502, {
      error: error.statusCode === 401 ? error.message : "Unable to create transcription token"
    });
  }
});

server.listen(port, () => {
  console.log(`Speech2Text token broker listening on http://localhost:${port}`);
});
