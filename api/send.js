export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const { type, message, username } = req.body;

  if (!username || username.length > 50) {
    return res.status(400).json({ error: "Invalid username" });
  }
  if (type === "comment" && (!message || message.length > 500)) {
    return res.status(400).json({ error: "Invalid message" });
  }

  let webhook;
  if (type === "giveaway") webhook = process.env.GIVEAWAY_WEBHOOK;
  else if (type === "comment") webhook = process.env.COMMENT_WEBHOOK;
  else return res.status(400).json({ error: "Invalid type" });

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        type === "giveaway"
          ? `🎉 New giveaway entry: ${username}`
          : `💬 ${username}: ${message}`,
    }),
  });

  res.status(200).json({ success: true });
}
