import { neon } from '@neondatabase/serverless'

type QueryParams = Record<string, string | number | boolean | undefined | null>

export class NeonRestClient {
  private sql: any

  constructor() {
    // Use Neon Serverless Driver with direct connection
    this.sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!)
  }

  public async get<T = unknown>(path: string, params?: QueryParams): Promise<T> {
    try {
      // Extract table name from path (e.g., "public.predictions" -> "predictions")
      const tableName = path.split('.').pop() || path
      
      // Build query with optional limit
      let query = `SELECT * FROM ${tableName}`
      if (params?.limit) {
        query += ` LIMIT ${params.limit}`
      } else if (tableName === 'enhanced_dataset') {
        // For enhanced_dataset, get ALL records - no limit
        // query += ` LIMIT 1000`  // REMOVED LIMIT
      } else {
        query += ` LIMIT 10`
      }
      
      // Query the table directly using Neon Serverless Driver
      const result = await this.sql.query(query)
      
      return result as T
    } catch (error) {
      throw new Error(`Neon query failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  public async query<T = unknown>(sqlText: string): Promise<T> {
    try {
      const result = await this.sql.query(sqlText)
      return result as T
    } catch (error) {
      throw new Error(`Neon raw query failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

export const neonClient = new NeonRestClient()