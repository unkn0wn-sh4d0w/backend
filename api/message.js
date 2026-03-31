import { kv } from "@vercel/kv";

const bannedWords = ["fuck","shit","nigger","rape"];

function clean(text) {
  return !bannedWords.some(w => new RegExp(`\\b${w}\\b`, "i").test(text));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, user, id } = req.body;

  if (!text || !user || !id) {
    return res.status(400).json({ error: "Missing data" });
  }

  if (!clean(text) || !clean(user)) {
    return res.status(403).json({ error: "Blocked by automod" });
  }

  if (text.length > 300) {
    return res.status(403).json({ error: "Too long" });
  }

  const msg = {
    text,
    user,
    id,
    time: Date.now()
  };

  await kv.lpush("messages", JSON.stringify(msg));
  await kv.ltrim("messages", 0, 100); // keep last 100

  return res.status(200).json({ success: true });
}