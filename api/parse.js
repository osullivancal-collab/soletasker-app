// api/parse.js
// Vercel Serverless Function
// Receives transcript text → parses with OpenAI → returns structured JSON
// OPENAI_API_KEY server-side only

const TEAM_MEMBERS = ["Me", "VA", "Jake Holden", "Matt Reeves"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const chunks = [];
    for await (const chunk of req) { chunks.push(chunk); }
    const transcript = Buffer.concat(chunks).toString("utf8").trim();
    const jobNames = req.query.jobs || "";

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
- No markdown, no commentary, JSON only
- Priority: P1=urgent/today, P2=this week, P3=low
- Available jobs: ${jobNames || "none"}
- Available team members: ${TEAM_MEMBERS.join(", ")}`;

    const res2 = await fetch("https://api.openai.com/v1/chat/completions", {
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

    if (!res2.ok) throw new Error(`Parse failed: ${await res2.text()}`);
    const data = await res2.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return res.status(200).json({ parsed });

  } catch (err) {
    console.error("Parse error:", err);
    return res.status(500).json({ parsed: null, error: "Parse failed" });
  }
}
