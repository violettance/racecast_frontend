import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/neon-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || '2024'
    const type = searchParams.get('type') // 'standings' or 'stats'

    if (!type) {
      return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 })
    }

    let query = ''
    let result = []

    if (type === 'standings') {
      // Constructor standings query
      query = `
        WITH constructor_stats AS (
          SELECT 
            constructor_id,
            constructor_name,
            COUNT(CASE WHEN position = 1 THEN 1 END) as wins,
            COUNT(CASE WHEN position <= 3 THEN 1 END) as podiums,
            SUM(points) as points
          FROM enhanced_dataset 
          WHERE year = ${year}
          GROUP BY constructor_id, constructor_name
        )
        SELECT 
          constructor_id,
          constructor_name,
          wins,
          podiums,
          points
        FROM constructor_stats
        WHERE points > 0
        ORDER BY points DESC, wins DESC, podiums DESC
      `
    } else if (type === 'stats') {
      // Constructor statistics query
      query = `
        SELECT 
          constructor_id,
          constructor_name,
          COUNT(CASE WHEN position = 1 THEN 1 END) as wins,
          COUNT(CASE WHEN position <= 3 THEN 1 END) as podiums,
          COUNT(CASE WHEN position <= 10 THEN 1 END) as top_10s,
          AVG(position) as avg_position,
          SUM(points) as total_points
        FROM enhanced_dataset 
        WHERE year = ${year}
        GROUP BY constructor_id, constructor_name
        ORDER BY total_points DESC, wins DESC, podiums DESC
      `
    }

    if (query) {
      result = await neonClient.query(query)
    }

    return NextResponse.json({ data: result || [] })
  } catch (error) {
    console.error('Error fetching constructor performance data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
