import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let last = "";

  // Poll every 1 second
  const interval = setInterval(async () => {
    try {
      const data = await redis.lrange("chat_messages", 0, 50);
      const current = data.join("");
      if (current !== last) {
        last = current;
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    } catch (err) {
      console.error("Redis error:", err);
    }
  }, 1000);

  // Stop interval when client disconnects
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}