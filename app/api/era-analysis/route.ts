import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/neon-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'lap_times' or 'speeds'

    if (!type) {
      return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 })
    }

    let query = ''
    let result = []

    if (type === 'lap_times') {
      // Lap times analysis query
      query = `
        SELECT 
          CASE 
            WHEN year BETWEEN 2018 AND 2021 THEN '2018-2021'
            WHEN year >= 2022 THEN '2022+'
          END as era,
          AVG(avg_lap_time) as avg_lap_time
        FROM enhanced_dataset 
        WHERE year BETWEEN 2018 AND 2024
        AND avg_lap_time IS NOT NULL
        GROUP BY 
          CASE 
            WHEN year BETWEEN 2018 AND 2021 THEN '2018-2021'
            WHEN year >= 2022 THEN '2022+'
          END
        ORDER BY era
      `
    } else if (type === 'speeds') {
      // Speeds analysis query
      query = `
        SELECT 
          CASE 
            WHEN year BETWEEN 2018 AND 2021 THEN '2018-2021'
            WHEN year >= 2022 THEN '2022+'
          END as era,
          AVG(avg_speed) as avg_speed
        FROM enhanced_dataset 
        WHERE year BETWEEN 2018 AND 2024
        AND avg_speed IS NOT NULL
        GROUP BY 
          CASE 
            WHEN year BETWEEN 2018 AND 2021 THEN '2018-2021'
            WHEN year >= 2022 THEN '2022+'
          END
        ORDER BY era
      `
    }

    if (query) {
      result = await neonClient.query(query)
    }

    return NextResponse.json({ data: result || [] })
  } catch (error) {
    console.error('Error fetching era analysis data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
