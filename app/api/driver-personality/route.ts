import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/neon-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || '2024'
    const type = searchParams.get('type') // 'wins' or 'why'

    if (!type) {
      return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 })
    }

    let query = ''
    let result = []

    if (type === 'wins') {
      // Driver typology analysis query
      query = `
        WITH names AS (
            SELECT TRIM(CONCAT(driver_first_name, ' ', driver_last_name)) AS full_name,
                   position,
                   avg_speed
           FROM enhanced_dataset
            WHERE driver_first_name IS NOT NULL AND driver_last_name IS NOT NULL
              AND year = ${year}
         ),
          joined AS (
            SELECT UPPER(TRIM(dp.typology)) AS typology,
                   n.full_name,
                   n.position,
                   n.avg_speed
            FROM driver_personality dp
            JOIN names n ON LOWER(TRIM(dp.driver_full_name)) = LOWER(TRIM(n.full_name))
            WHERE dp.typology IS NOT NULL AND TRIM(dp.typology) <> ''
          )
          SELECT typology,
                 COUNT(DISTINCT LOWER(TRIM(full_name)))::int AS drivers,
                 COUNT(*) FILTER (WHERE position = 1)::int AS wins,
                 COUNT(*) FILTER (WHERE position <= 3)::int AS podiums,
                 AVG(avg_speed)::float AS avg_speed
          FROM joined
          GROUP BY typology
          ORDER BY wins DESC
      `
    } else if (type === 'why') {
      // Number selection patterns query
      query = `
        WITH names AS (
           SELECT TRIM(CONCAT(driver_first_name, ' ', driver_last_name)) AS full_name
           FROM enhanced_dataset
           WHERE driver_first_name IS NOT NULL AND driver_last_name IS NOT NULL
             AND year = ${year}
           GROUP BY 1
         )
         SELECT COALESCE(dp.why_choose_number_categorical, 'Unknown') AS bucket,
                COUNT(DISTINCT LOWER(TRIM(dp.driver_full_name)))::int AS count
         FROM driver_personality dp
         JOIN names n ON LOWER(TRIM(dp.driver_full_name)) = LOWER(TRIM(n.full_name))
         GROUP BY 1
         ORDER BY count DESC
      `
    } else if (type === 'archetype_drivers') {
      // Archetype drivers query
      query = `
        WITH names AS (
           SELECT TRIM(CONCAT(driver_first_name, ' ', driver_last_name)) AS full_name
           FROM enhanced_dataset
           WHERE driver_first_name IS NOT NULL AND driver_last_name IS NOT NULL
             AND year = ${year}
           GROUP BY 1
         )
         SELECT UPPER(TRIM(dp.typology)) AS typology,
                dp.driver_full_name
         FROM driver_personality dp
         JOIN names n ON LOWER(TRIM(dp.driver_full_name)) = LOWER(TRIM(n.full_name))
         WHERE dp.typology IS NOT NULL AND TRIM(dp.typology) <> ''
         ORDER BY dp.typology, dp.driver_full_name
      `
    }

    if (query) {
      result = await neonClient.query(query) as any[]
    }

    return NextResponse.json({ data: result || [] })
  } catch (error) {
    console.error('Error fetching driver personality data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
