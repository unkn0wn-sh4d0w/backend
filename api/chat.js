import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const data = await kv.lrange("messages", 0, 100);
  const messages = data.map(m => JSON.parse(m)).reverse();
  res.status(200).json(messages);
}