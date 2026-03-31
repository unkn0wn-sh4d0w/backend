export default async function handler(req, res) {
  const UPSTASH_URL = process.env.KV_REST_API_URL;
  const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let last = "";

  const interval = setInterval(async () => {
    try {
      const r = await fetch(`${UPSTASH_URL}/lrange/chat_messages/0/49`, {
        headers: { "Authorization": `Bearer ${UPSTASH_TOKEN}` }
      });
      const data = await r.json();
      const current = JSON.stringify(data.result);
      if (current !== last) {
        last = current;
        res.write(`data: ${JSON.stringify(data.result)}\n\n`);
      }
    } catch (err) {
      console.error(err);
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}