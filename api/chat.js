export default async function handler(req,res){
  const UPSTASH_URL = process.env.KV_REST_API_URL;
  const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;

  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");

  if(req.method==="OPTIONS") return res.status(200).end();
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});

  try{
    const r = await fetch(`${UPSTASH_URL}/lrange/chat_messages/0/99`,{
      headers: { "Authorization": `Bearer ${UPSTASH_TOKEN}` }
    });
    const data = await r.json();
    // Make sure every message is parsed safely
    const messages = data.result.map(m=>{
      try { return JSON.parse(m); } catch(e){ return null; }
    }).filter(m=>m && m.user && m.text).reverse(); // filter invalid
    res.status(200).json(messages);
  }catch(err){
    console.error("Chat fetch error:",err);
    res.status(500).json({error:"Internal Server Error"});
  }
}