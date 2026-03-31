import { Redis } from "@upstash/redis";

export const config = { runtime: "edge" };

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
});

export default async function handler(req) {
  const stream = new ReadableStream({
    async start(controller) {
      let last = "";
      while (true) {
        const data = await redis.lrange("chat_messages", 0, 50);
        const current = JSON.stringify(data);
        if (current !== last) {
          controller.enqueue(`data: ${current}\n\n`);
          last = current;
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    }
  });
}