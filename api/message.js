export default async function handler(req, res) {
  const UPSTASH_URL = process.env.KV_REST_API_URL;
  const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    let body = "";
    await new Promise((resolve, reject) => {
      req.on("data", chunk => body += chunk);
      req.on("end", () => resolve());
      req.on("error", err => reject(err));
    });
    body = JSON.parse(body);

    const { text, user, id } = body;
    if (!text || !user || !id) return res.status(400).json({ error: "Missing data" });

    const banned = ["fuck","shit","nigger","rape"];
    if (banned.some(w => new RegExp(`\\b${w}\\b`, "i").test(text)) ||
        banned.some(w => new RegExp(`\\b${w}\\b`, "i").test(user))) {
      return res.status(403).json({ error: "Blocked by automod" });
    }
    if (text.length > 300) return res.status(403).json({ error: "Message too long" });

    const msg = { text, user, id, time: Date.now() };

    // Push message
    await fetch(`${UPSTASH_URL}/lpush/chat_messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([JSON.stringify(msg)])
    });

    // Keep last 100 messages
    await fetch(`${UPSTASH_URL}/ltrim/chat_messages/0/99`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([]) // required for Upstash REST
    });

    res.status(200).json({ success: true });
  } catch(err) {
    console.error("Message error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}