import { neonClient } from '@/lib/neon-client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  try {
    let result = []

    if (type === 'predictions') {
      // Get predictions data
      result = await neonClient.get("public.predictions", {
        order: "year.desc,round.desc,position.asc",
        limit: 50,
      }) as any[]
    } else if (type === 'results') {
      // Get results data
      result = await neonClient.get("public.results", {
        order: "year.desc,round.desc,position.asc",
        limit: 50,
      }) as any[]
    } else if (type === 'enhanced_dataset') {
      // Get enhanced dataset for driver/team names
      result = await neonClient.get("public.enhanced_dataset") as any[]
    } else if (type === 'races') {
      // Get race information from Ergast API
      const raceResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/races')
      const data = await raceResponse.json()
      result = data.MRData.RaceTable.Races
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error fetching race prediction data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
