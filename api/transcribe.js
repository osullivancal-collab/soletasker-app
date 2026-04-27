// api/transcribe.js
// Vercel Serverless Function
// Handles BOTH speech-to-text AND parsing server-side
// OPENAI_API_KEY only — never exposed to browser

export const config = { api: { bodyParser: false } };

const TEAM_MEMBERS = ["Me", "VA", "Jake Holden", "Matt Reeves"];

async function transcribeAudio(buffer) {
  const boundary = "----STBoundary" + Date.now().toString(36);
  const CRLF = "\r\n";

  const fileHeader = Buffer.from(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="file"; filename="audio.webm"${CRLF}` +
    `Content-Type: audio/webm${CRLF}${CRLF}`
  );
  const modelPart = Buffer.from(
    `${CRLF}--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="model"${CRLF}${CRLF}` +
    `gpt-4o-mini-transcribe`
  );
  const langPart = Buffer.from(
    `${CRLF}--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="language"${CRLF}${CRLF}` +
    `en`
  );
  const promptPart = Buffer.from(
    `${CRLF}--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="prompt"${CRLF}${CRLF}` +
    `Tradie voice note. Australian English. May include: P1, P2, priority one, priority two, address, job, task, reminder, SWMS, Part P, EIC, switchboard, invoice, certificate, builder, sparky, apprentice.`
  );
  const closing = Buffer.from(`${CRLF}--${boundary}--${CRLF}`);
  const body = Buffer.concat([fileHeader, buffer, modelPart, langPart, promptPart, closing]);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) throw new Error(`STT failed: ${await res.text()}`);
  const data = await res.json();
  return data.text || "";
}

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
  "job_id": "matching job id from available jobs or null",
  "job_name": "optional job name if relevant or null",
  "client_name": "optional client name or null",
  "address": "optional address or null",
  "tasks": [{"title": "task description", "priority": "P1 | P2 | P3", "assigned_to": "team member or Me", "due_date": "YYYY-MM-DD or null"}],
  "task_title": "if single task: concise title or null",
  "priority": "P1 | P2 | P3",
  "assigned_to": "one of the team members or Me",
  "reminder_text": "extracted reminder text or null",
  "reminder_date": "YYYY-MM-DD or null",
  "notes": "cleaned up summary or null",
  "smart_suggestions": []
}

RULES:
- Always infer intent (task, job, reminder, or note)
- Clean up messy language
- Break multiple actions into tasks array
- Do NOT hallucinate unknown details
- If unsure leave fields null
- Keep output minimal and clean
- No markdown, no commentary, JSON only
- Priority: P1=urgent/today, P2=this week, P3=low
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

  if (!res.ok) throw new Error(`Parse failed: ${await res.text()}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Collect audio body
    const chunks = [];
    for await (const chunk of req) { chunks.push(chunk); }
    const buffer = Buffer.concat(chunks);

    // Get job names hint from query param (optional)
    const jobNames = req.query.jobs || "";

    // Step 1: Transcribe
    const transcript = await transcribeAudio(buffer);

    // Step 2: Parse
    let parsed = null;
    try {
      parsed = await parseTranscript(transcript, jobNames);
    } catch (parseErr) {
      console.error("Parse error (non-fatal):", parseErr);
      // Return transcript even if parsing fails
    }

    return res.status(200).json({ transcript, parsed });

  } catch (err) {
    console.error("Transcribe/parse error:", err);
    return res.status(500).json({ error: "Server error", transcript: "", parsed: null });
  }
}

