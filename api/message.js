import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
});

const bannedWords = ["fuck","shit","nigger","rape","hitler"];
function clean(text) {
  return !bannedWords.some(w => new RegExp(`\\b${w}\\b`, "i").test(text));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, user, id } = req.body;
  if (!text || !user || !id) return res.status(400).json({ error: "Missing data" });
  if (!clean(text) || !clean(user)) return res.status(403).json({ error: "Blocked by automod" });
  if (text.length > 300) return res.status(403).json({ error: "Message too long" });

  const msg = { text, user, id, time: Date.now() };

  await redis.lpush("chat_messages", JSON.stringify(msg));
  await redis.ltrim("chat_messages", 0, 100); messages

  return res.status(200).json({ success: true });
}