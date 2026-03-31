import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
});

export default async function handler(req, res) {
  const data = await redis.lrange("chat_messages", 0, 100);
  const messages = data.map(m => JSON.parse(m)).reverse();
  res.status(200).json(messages);
}