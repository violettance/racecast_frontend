import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/neon-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')
    const constructorId = searchParams.get('constructorId')
    const type = searchParams.get('type') // 'driver' or 'constructor'

    if (!type || (!driverId && !constructorId)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    let query = ''
    let result = []

    if (type === 'driver' && driverId) {
      // Driver trends query
      query = `
        SELECT 
          year,
          COUNT(CASE WHEN position = 1 THEN 1 END) as wins,
          COUNT(CASE WHEN position <= 3 THEN 1 END) as podiums
        FROM enhanced_dataset 
        WHERE year BETWEEN 2018 AND 2024
        AND driver_id = '${driverId}'
        GROUP BY year
        HAVING COUNT(CASE WHEN position = 1 THEN 1 END) > 0 OR COUNT(CASE WHEN position <= 3 THEN 1 END) > 0
        ORDER BY year
      `
    } else if (type === 'constructor' && constructorId) {
      // Constructor trends query
      query = `
        SELECT 
          year,
          COUNT(CASE WHEN position = 1 THEN 1 END) as wins,
          COUNT(CASE WHEN position <= 3 THEN 1 END) as podiums
        FROM enhanced_dataset 
        WHERE year BETWEEN 2018 AND 2024
      `
      
      if (constructorId === 'rb') {
        query += ` AND (constructor_id = 'rb' OR constructor_id = 'alphatauri' OR constructor_id = 'toro_rosso')`
      } else if (constructorId === 'stake_f1_team') {
        query += ` AND (constructor_id = 'stake_f1_team' OR constructor_id = 'sauber' OR constructor_id = 'alfa_romeo')`
      } else if (constructorId === 'alpine') {
        query += ` AND (constructor_id = 'alpine' OR constructor_id = 'renault')`
      } else if (constructorId === 'aston_martin') {
        query += ` AND (constructor_id = 'aston_martin' OR constructor_id = 'force_india' OR constructor_id = 'racing_point')`
      } else {
        query += ` AND constructor_id = '${constructorId}'`
      }
      
      query += `
        GROUP BY year
        HAVING COUNT(CASE WHEN position = 1 THEN 1 END) > 0 OR COUNT(CASE WHEN position <= 3 THEN 1 END) > 0
        ORDER BY year
      `
    }

    if (query) {
      result = await neonClient.query(query)
    }

    return NextResponse.json({ data: result || [] })
  } catch (error) {
    console.error('Error fetching winning trends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
