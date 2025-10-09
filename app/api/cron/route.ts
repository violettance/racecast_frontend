export const runtime = "edge";

async function trigger(url: string) {
  let attempt = 0;
  while (attempt < 5) {
    attempt++;
    const res = await fetch(url, { 
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_KEY || ''
      },
      body: JSON.stringify({ year: 2025 })
    });
    if (res.status === 200) {
      return new Response("✅ Success", { status: 200 });
    }
    await new Promise((r) => setTimeout(r, 180000)); // 3 minutes wait
  }
  return new Response("❌ Failed after 5 tries", { status: 400 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const task = url.searchParams.get("task");

  if (task === "predict") {
    return trigger("https://racecast-backend.onrender.com/predict");
  }
  if (task === "update") {
    return trigger("https://racecast-backend.onrender.com/update_results");
  }
  return new Response("Invalid task", { status: 400 });
}
