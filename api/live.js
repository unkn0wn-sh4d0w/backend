import { kv } from "@vercel/kv";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const stream = new ReadableStream({
    async start(controller) {
      let last = "";

      while (true) {
        const data = await kv.lrange("messages", 0, 50);
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