export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const { type, message, username } = req.body;

  let webhook;

  if (type === "giveaway") {
    webhook = process.env.GIVEAWAY_WEBHOOK;
  } else if (type === "comment") {
    webhook = process.env.COMMENT_WEBHOOK;
  } else {
    return res.status(400).json({ error: "Invalid type" });
  }

  let content = "";

  if (type === "giveaway") {
    content = `🎉 New giveaway entry: ${username}`;
  }

  if (type === "comment") {
    content = `💬 ${username}: ${message}`;
  }

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  res.status(200).json({ success: true });
}
