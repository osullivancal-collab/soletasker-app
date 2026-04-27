// api/transcribe.js
// Vercel Serverless Function — Node 18+
// Speech-to-text + parsing, server-side only
// OPENAI_API_KEY never exposed to browser

export const config = { api: { bodyParser: false } };

const TEAM_MEMBERS = ["Me", "VA", "Jake Holden", "Matt Reeves"];

// ─── STEP 1: Speech to Text ───────────────────────────────────────────────────
async function transcribeAudio(buffer, mimeType) {
  const mime = mimeType || "audio/webm";
  const filename = mime.includes("mp4") || mime.includes("m4a") ? "audio.m4a"
    : mime.includes("wav") ? "audio.wav"
    : "audio.webm";

  console.log("[transcribeAudio] buffer size:", buffer.length, "mime:", mime, "filename:", filename);
  console.log("[transcribeAudio] OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

  if (!buffer.length) throw new Error("Empty audio buffer — nothing recorded");

  const formData = new FormData();
  const audioBlob = new Blob([buffer], { type: mime });
  formData.append("file", audioBlob, filename);
  formData.append("model", "whisper-1");
  formData.append("language", "en");
  formData.append("prompt", "Tradie voice note. Australian English. May include: P1, P2, priority one, priority two, address, job, task, reminder, SWMS, Part P, EIC, switchboard, invoice, certificate, builder, sparky, apprentice.");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[transcribeAudio] OpenAI STT error:", res.status, errText);
    throw new Error(`STT failed: ${res.status} — ${errText}`);
  }

  const data = await res.json();
  console.log("[transcribeAudio] transcript preview:", data.text?.slice(0, 80));
  return data.text || "";
}

// ─── STEP 2: Parse Transcript ─────────────────────────────────────────────────
async function parseTranscript(transcript, jobNames) {
  const systemPrompt = `You are an assistant that converts messy voice transcripts from tradies into structured job data.

INPUT:
A raw voice transcript from a job site. It may be messy, incomplete, or informal.

OUTPUT:
Return ONLY valid JSON. No text. No explanation.

SCHEMA:
{
  "intent": "task | job | reminder | note",
  "confidence": "high | medium | low",
  "job_id": "matching job id ONLY if transcript contains exact address or full customer name — otherwise null",
  "job_name": "optional or null",
  "client_name": "optional or null",
  "address": "optional or null",
  "tasks": [{"title": "concise task", "priority": "P1 | P2 | P3", "assigned_to": "team member or Me", "due_date": "YYYY-MM-DD or null"}],
  "task_title": "concise title — remove filler: me, dont forget, urgent, create a task, remind me",
  "priority": "P1 | P2 | P3",
  "assigned_to": "one of the team members or Me",
  "reminder_text": "extracted reminder or null",
  "reminder_date": "YYYY-MM-DD or null",
  "notes": "cleaned summary or null",
  "smart_suggestions": []
}

RULES:
- Infer intent. Clean messy language. Remove filler words.
- Concise task_title — move extra detail to notes
- Break multiple actions into tasks array
- Do NOT hallucinate. If unsure, null.
- Priority: explicit number wins. "priority 3" = P3 even if also says urgent. Only "urgent"/"asap" with no number = P1.
- Dates: tomorrow=+1day, next week=+7days, end of week=Friday, format YYYY-MM-DD
- Job linking: ONLY if transcript contains exact street address or full customer name. If uncertain: job_id=null, confidence=low
- Available jobs: ${jobNames || "none"}
- Available team members: ${TEAM_MEMBERS.join(", ")}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 600,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Voice transcript: "${transcript}"` }
      ]
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[parseTranscript] OpenAI parse error:", res.status, errText);
    throw new Error(`Parse failed: ${res.status}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("[/api/transcribe] Request received");

  try {
    // Collect raw audio body
    const chunks = [];
    for await (const chunk of req) { chunks.push(chunk); }
    const buffer = Buffer.concat(chunks);
    console.log("[/api/transcribe] Audio buffer collected, size:", buffer.length);

    const jobNames = req.query.jobs || "";
    const mimeType = req.query.mime || "audio/webm";

    // Step 1: Transcribe audio
    const transcript = await transcribeAudio(buffer, mimeType);

    // Step 2: Parse transcript (non-fatal if fails)
    let parsed = null;
    try {
      parsed = await parseTranscript(transcript, jobNames);
    } catch (parseErr) {
      console.error("[/api/transcribe] Parse error (non-fatal):", parseErr.message);
    }

    return res.status(200).json({ transcript, parsed });

  } catch (err) {
    console.error("[/api/transcribe] Fatal error:", err.message);
    return res.status(500).json({ error: err.message, transcript: "", parsed: null });
  }
}
