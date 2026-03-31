export default async function handler(req, res) {
  const UPSTASH_URL = process.env.KV_REST_API_URL;
  const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;

  res.setHeader("Access-Control-Allow-Origin", "*");
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
      const messages = data.result.map(m => JSON.parse(m));
      const current = JSON.stringify(messages);
      if (current !== last) {
        last = current;
        res.write(`data: ${JSON.stringify(messages)}\n\n`);
      }
    } catch (err) {
      console.error("Live error:", err);
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}