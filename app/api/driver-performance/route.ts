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

    if (type === 'years') {
      // Years query
      query = `SELECT DISTINCT year FROM enhanced_dataset ORDER BY year DESC`
    } else if (type === 'total_drivers') {
      // Total drivers query
      query = `SELECT COUNT(DISTINCT driver_id) as count FROM enhanced_dataset WHERE year = ${year}`
    } else if (type === 'avg_points') {
      // Average points query
      query = `SELECT AVG(driver_career_avg_points) as avg_points FROM enhanced_dataset WHERE year = ${year}`
    } else if (type === 'most_wins') {
      // Most wins query
      query = `
        WITH per_race AS (
          SELECT year, round, driver_id,
                 MIN(driver_first_name) AS first_name,
                 MIN(driver_last_name) AS last_name,
                 MIN(position) AS position
          FROM enhanced_dataset
          WHERE year = ${year}
          GROUP BY year, round, driver_id
        )
        SELECT driver_id,
               MIN(first_name) AS first_name,
               MIN(last_name) AS last_name,
               COUNT(*) AS wins
        FROM per_race
        WHERE position = 1
        GROUP BY driver_id
        ORDER BY wins DESC
        LIMIT 1
      `
    } else if (type === 'most_podiums') {
      // Most podiums query
      query = `
        WITH per_race AS (
          SELECT year, round, driver_id,
                 MIN(driver_first_name) AS first_name,
                 MIN(driver_last_name) AS last_name,
                 MIN(position) AS position
          FROM enhanced_dataset
          WHERE year = ${year}
          GROUP BY year, round, driver_id
        )
        SELECT driver_id,
               MIN(first_name) AS first_name,
               MIN(last_name) AS last_name,
               COUNT(*) AS podiums
        FROM per_race
        WHERE position BETWEEN 1 AND 3
        GROUP BY driver_id
        ORDER BY podiums DESC
        LIMIT 1
      `
    } else if (type === 'standings') {
      // Driver standings query
      query = `
        WITH per_race AS (
          SELECT year, round, driver_id,
                 MIN(driver_first_name) AS first_name,
                 MIN(driver_last_name) AS last_name,
                 MIN(driver_nationality) AS nationality,
                 MIN(constructor_name) AS team,
                 MIN(position) AS position
          FROM enhanced_dataset
          WHERE year = ${year}
          GROUP BY year, round, driver_id
        )
        SELECT driver_id,
               MIN(first_name) AS first_name,
               MIN(last_name) AS last_name,
               MIN(nationality) AS nationality,
               MIN(team) AS team,
               SUM(CASE position
                     WHEN 1 THEN 25
                     WHEN 2 THEN 18
                     WHEN 3 THEN 15
                     WHEN 4 THEN 12
                     WHEN 5 THEN 10
                     WHEN 6 THEN 8
                     WHEN 7 THEN 6
                     WHEN 8 THEN 4
                     WHEN 9 THEN 2
                     WHEN 10 THEN 1
                     ELSE 0
                   END) AS points,
               COUNT(*) FILTER (WHERE position = 1) AS wins,
               COUNT(*) FILTER (WHERE position BETWEEN 1 AND 3) AS podiums
        FROM per_race
        GROUP BY driver_id
        ORDER BY points DESC NULLS LAST, wins DESC, podiums DESC
      `
    } else if (type === 'stats') {
      // Driver statistics query
      query = `
        SELECT 
          driver_id,
          first_name,
          last_name,
          nationality,
          team,
          COUNT(CASE WHEN position = 1 THEN 1 END) as wins,
          COUNT(CASE WHEN position <= 3 THEN 1 END) as podiums,
          COUNT(CASE WHEN position <= 10 THEN 1 END) as top_10s,
          AVG(position) as avg_position,
          SUM(points) as total_points
        FROM enhanced_dataset 
        WHERE year = ${year}
        GROUP BY driver_id, first_name, last_name, nationality, team
        ORDER BY total_points DESC, wins DESC, podiums DESC
      `
    }

    if (query) {
      result = await neonClient.query(query)
    }

    return NextResponse.json({ data: result || [] })
  } catch (error) {
    console.error('Error fetching driver performance data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
