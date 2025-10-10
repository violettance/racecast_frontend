export const runtime = "nodejs";

async function getCurrentRound(): Promise<number | null> {
  try {
    const response = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json');
    
    if (response.ok) {
      const data = await response.json();
      return parseInt(data.MRData.RaceTable.Races[0].round);
    }
    return null;
  } catch (error) {
    console.error('Error fetching current round:', error);
    return null;
  }
}

async function trigger(url: string, body: any) {
  let attempt = 0;
  while (attempt < 5) {
    attempt++;
    const res = await fetch(url, { 
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_KEY || ''
      },
      body: JSON.stringify(body)
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

  // Get current round from API
  const currentRound = await getCurrentRound();
  
  if (!currentRound) {
    return new Response("❌ Could not fetch current round", { status: 400 });
  }

  if (task === "predict") {
    return trigger("https://racecast-backend.onrender.com/predict", {
      year: 2025,
      round: currentRound
    });
  }
  if (task === "update") {
    return trigger("https://racecast-backend.onrender.com/update_results", {
      year: 2025,
      round: currentRound
    });
  }
  return new Response("Invalid task", { status: 400 });
}
