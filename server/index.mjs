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
const summaryModels = (process.env.GEMINI_SUMMARY_MODELS ?? "gemini-3.5-flash-lite,gemini-3.5-flash")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const summaryTimeoutMs = Number(process.env.SUMMARY_TIMEOUT_MS ?? 25_000);
const ttsModels = (process.env.GEMINI_TTS_MODELS ?? "gemini-2.5-flash-preview-tts")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const ttsTimeoutMs = Number(process.env.TTS_TIMEOUT_MS ?? 45_000);
const serverVersion = "2026-09-02.summary-notes-profiles";
const targetLanguages = new Map([
  ["en", "English"],
  ["fr", "French"],
  ["ja", "Japanese"],
  ["de", "German"]
]);
const summaryProfiles = new Map([
  ["student", {
    title: "Study Sheet",
    instruction: "Use concise, useful wording for a student preparing exams.",
    sections: ["Short Summary", "Main Ideas", "Key Concepts", "Important Details", "Possible Exam Questions", "Vocabulary"]
  }],
  ["business", {
    title: "Business Brief",
    instruction: "Write for a professional who needs clear decisions, priorities, risks and next actions.",
    sections: ["Executive Summary", "Business Context", "Decisions", "Action Items", "Risks", "Opportunities", "Next Steps"]
  }],
  ["meeting", {
    title: "Meeting Notes",
    instruction: "Write as practical meeting notes that can be shared with participants after the discussion.",
    sections: ["Overview", "Topics Discussed", "Decisions", "Action Items", "Open Questions", "Follow-ups"]
  }],
  ["research", {
    title: "Research Brief",
    instruction: "Write as an analytical research note, distinguishing claims, evidence and uncertainties.",
    sections: ["Abstract", "Main Thesis", "Evidence", "Methods or Reasoning", "Limitations", "Points to Verify", "Further Questions"]
  }]
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
      if (body.length > 1_500_000) {
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
  if (!sourceLanguage || sourceLanguage === "mixed") return "the detected language of each sentence or phrase";
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
    `Detect the source language independently for each sentence or phrase, and translate every part that is not already natural ${targetLanguageName}.`,
    "Return only the translation. Preserve meaning, names, numbers, academic terms, paragraph breaks, and useful line breaks.",
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

async function summarizeText({
  text,
  targetLanguage,
  summaryProfile,
  summaryProfileTitle,
  summaryProfileSections,
  includeNotes,
  notes,
  courseTitle,
  sessionTitle
}) {
  const targetLanguageName = targetLanguages.get(targetLanguage) ?? "English";
  const profile = getSummaryProfileConfig({ summaryProfile, summaryProfileTitle, summaryProfileSections });
  const notesText = includeNotes && notes ? notes.trim() : "";
  const prompt = [
    `Create a structured ${profile.title.toLowerCase()} in ${targetLanguageName} from this transcript.`,
    "Return only Markdown. Do not invent facts that are not supported by the transcript.",
    profile.instruction,
    notesText
      ? "Use the personal notes as additional context and clarification. If notes conflict with the transcript, mention the uncertainty rather than silently overwriting the transcript."
      : "",
    "Include these sections:",
    `# ${profile.title}`,
    ...profile.sections.map((section) => `## ${section}`),
    "",
    `Course: ${courseTitle || "Unknown course"}`,
    `Lecture: ${sessionTitle || "Unknown lecture"}`,
    "",
    notesText ? `Personal notes:\n${notesText}\n` : "",
    "Transcript:",
    text
  ].filter(Boolean).join("\n");

  const failures = [];
  for (const model of summaryModels) {
    try {
      return await generateSummary({ model, prompt });
    } catch (error) {
      failures.push(`${model}: ${error.message}`);
    }
  }

  throw new Error(`Summary failed after ${summaryModels.length} attempt(s). ${failures.join(" | ")}`);
}

function getSummaryProfileConfig({ summaryProfile, summaryProfileTitle, summaryProfileSections }) {
  const builtIn = summaryProfiles.get(summaryProfile);
  if (builtIn) return builtIn;

  const title = cleanText(summaryProfileTitle, 80) || "Custom Summary";
  const sections = Array.isArray(summaryProfileSections)
    ? summaryProfileSections.map((section) => cleanText(section, 80)).filter(Boolean).slice(0, 12)
    : [];

  if (!sections.length) return summaryProfiles.get("student");

  return {
    title,
    instruction: "Follow the custom structure closely. Treat each custom section as a heading or keyword to cover when supported by the transcript.",
    sections
  };
}

function cleanText(value, maxLength) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

async function generateSummary({ model, prompt }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), summaryTimeoutMs);

  try {
    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096
        }
      }),
      signal: controller.signal
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error?.message || `HTTP ${response.status}`);

    const summary = result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!summary) throw new Error("empty response");
    return summary;
  } catch (error) {
    if (error.name === "AbortError") throw new Error(`timed out after ${summaryTimeoutMs} ms`);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function synthesizeSpeech({ text, targetLanguage }) {
  const languageName = targetLanguages.get(targetLanguage) ?? "English";
  const prompt = [
    `Read the following ${languageName} text aloud clearly and naturally.`,
    "Use a calm, neutral educational tone.",
    "",
    text
  ].join("\n");

  const failures = [];
  for (const model of ttsModels) {
    try {
      return await generateSpeech({ model, prompt });
    } catch (error) {
      failures.push(`${model}: ${error.message}`);
    }
  }

  throw new Error(`Speech generation failed after ${ttsModels.length} attempt(s). ${failures.join(" | ")}`);
}

async function generateSpeech({ model, prompt }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ttsTimeoutMs);

  try {
    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Kore"
              }
            }
          }
        }
      }),
      signal: controller.signal
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error?.message || `HTTP ${response.status}`);

    const inlineData = result.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData;
    const data = inlineData?.data;
    if (!data) throw new Error("empty response");

    const sampleRate = parseSampleRate(inlineData.mimeType) || 24_000;
    return createWavBuffer(Buffer.from(data, "base64"), sampleRate);
  } catch (error) {
    if (error.name === "AbortError") throw new Error(`timed out after ${ttsTimeoutMs} ms`);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseSampleRate(mimeType = "") {
  const match = mimeType.match(/rate=(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function createWavBuffer(pcmBuffer, sampleRate, channels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
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
      features: ["live-token", "translate", "summarize", "speech", "supabase-auth"],
      authRequired,
      authTimeoutMs,
      translateModels,
      translateTimeoutMs,
      summaryModels,
      summaryTimeoutMs,
      ttsModels,
      ttsTimeoutMs,
      summaryProfiles: [...summaryProfiles.keys()]
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

  if (request.method === "POST" && url.pathname === "/api/summarize") {
    try {
      await authenticateRequest(request);
      const body = parseJSONBody(await readRequestBody(request));
      const text = typeof body.text === "string" ? body.text.trim() : "";
      const targetLanguage = typeof body.targetLanguage === "string" ? body.targetLanguage : "en";
      const summaryProfile = typeof body.summaryProfile === "string" ? body.summaryProfile : "student";
      const summaryProfileTitle = typeof body.summaryProfileTitle === "string" ? body.summaryProfileTitle.trim() : "";
      const summaryProfileSections = Array.isArray(body.summaryProfileSections) ? body.summaryProfileSections : [];
      const includeNotes = Boolean(body.includeNotes);
      const notes = typeof body.notes === "string" ? body.notes.trim() : "";
      const courseTitle = typeof body.courseTitle === "string" ? body.courseTitle.trim() : "";
      const sessionTitle = typeof body.sessionTitle === "string" ? body.sessionTitle.trim() : "";

      if (!text) {
        sendJSON(response, 400, { error: "Text is required" });
        return;
      }

      const summary = await summarizeText({
        text,
        targetLanguage,
        summaryProfile,
        summaryProfileTitle,
        summaryProfileSections,
        includeNotes,
        notes,
        courseTitle,
        sessionTitle
      });
      if (!summary) {
        sendJSON(response, 502, { error: "Gemini returned an empty summary" });
        return;
      }

      sendJSON(response, 200, { summary });
    } catch (error) {
      if (error.statusCode !== 401) console.error("Unable to summarize transcript", error);
      sendJSON(response, error.statusCode ?? 502, { error: error.message || "Unable to summarize transcript" });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/speech") {
    try {
      await authenticateRequest(request);
      const body = parseJSONBody(await readRequestBody(request));
      const text = typeof body.text === "string" ? body.text.trim() : "";
      const targetLanguage = typeof body.targetLanguage === "string" ? body.targetLanguage : "en";

      if (!text) {
        sendJSON(response, 400, { error: "Text is required" });
        return;
      }

      const audio = await synthesizeSpeech({ text, targetLanguage });
      response.writeHead(200, {
        "Content-Type": "audio/wav",
        "Content-Length": audio.length,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": webOrigin,
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      });
      response.end(audio);
    } catch (error) {
      if (error.statusCode !== 401) console.error("Unable to generate speech", error);
      sendJSON(response, error.statusCode ?? 502, { error: error.message || "Unable to generate speech" });
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
