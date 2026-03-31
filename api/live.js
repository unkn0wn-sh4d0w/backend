import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // --- SSE Headers ---
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Helper to send data
  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let last = "";

  // Poll every 1s
  const interval = setInterval(async () => {
    const data = await redis.lrange("chat_messages", 0, 50);
    const current = data.join("");
    if (current !== last) {
      last = current;
      send(data);
    }
  }, 1000);

  // Clean up when client disconnects
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}