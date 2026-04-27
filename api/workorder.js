// api/workorder.js
// Vercel Serverless Function
// Receives work order text or image → extracts job details → returns structured JSON
// OPENAI_API_KEY server-side only

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => { data += chunk; });
      req.on("end", () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
      req.on("error", reject);
    });

    const systemPrompt = `You are parsing a builder's work order for an Australian tradie using SoleTasker.

Extract ALL job details. Return ONLY valid JSON, no markdown:
{
  "address": "full site address or null",
  "client": "homeowner or client name or null",
  "builder": "builder or builder company name or null",
  "phone": "phone number or null",
  "email": "email address or null",
  "date_required": "YYYY-MM-DD or null",
  "scope": "full scope of works — every task mentioned, written as clear instructions",
  "value": "dollar amount as number or null",
  "notes": "any other relevant info or null"
}

Rules:
- address is the SITE address, not the builder's office
- scope should be thorough — this is what the tradie works from
- Australian date formats: convert DD/MM/YYYY to YYYY-MM-DD
- Return JSON only, no commentary`;

    let messages;
    if (body.type === "image") {
      messages = [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${body.mediaType};base64,${body.data}` } },
          { type: "text", text: "Extract all job details from this work order. Return JSON only." }
        ]
      }];
    } else {
      messages = [{
        role: "user",
        content: `Work order text:\n${body.text}\n\nExtract all job details. Return JSON only.`
      }];
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 800,
        messages: [{ role: "system", content: systemPrompt }, ...messages]
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${await response.text()}`);
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return res.status(200).json({ result });

  } catch (err) {
    console.error("Workorder parse error:", err);
    return res.status(500).json({ result: null, error: "Parse failed" });
  }
}
