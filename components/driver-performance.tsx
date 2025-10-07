"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { useRaceStore } from "@/lib/race-store"
import { neonClient } from "@/lib/neon-client"

export function DriverPerformance() {
  const selectedYear = useRaceStore((s) => s.selectedYear)
  const setSelectedYear = useRaceStore((s) => s.setSelectedYear)
  const isLiveSeason = selectedYear === 2025

  const { data: yearsData } = useQuery<any[]>({
    queryKey: ["enhanced-dataset-years"],
    queryFn: async () => {
      return await neonClient.query(`SELECT DISTINCT year FROM enhanced_dataset ORDER BY year DESC`)
    },
  })

  const years = useMemo(() => (Array.isArray(yearsData) ? yearsData : []).map((r: any) => r.year), [yearsData])

  useEffect(() => {
    if ((selectedYear == null || isNaN(selectedYear as any)) && years.length > 0) {
      setSelectedYear(years[0])
    }
  }, [years, selectedYear, setSelectedYear])

  const { data: totalDriversData, isLoading: totalDriversLoading } = useQuery<any[]>({
    queryKey: ["total-drivers", selectedYear],
    enabled: !!selectedYear && !isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`SELECT COUNT(DISTINCT driver_id) as count FROM enhanced_dataset WHERE year = ${year}`)
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const totalDrivers = useMemo(() => {
    const row = Array.isArray(totalDriversData) ? totalDriversData[0] : undefined
    const raw = row?.count
    return raw != null ? Number(raw) : 0
  }, [totalDriversData])

  // Live-season (2025) drivers and results
  const { data: driverAllResults } = useQuery<any | null>({
    queryKey: ["ergast-driver-results-all", selectedYear],
    enabled: !!selectedYear && isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/results.json?limit=2000`)
      if (!res.ok) return null
      return await res.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  const { data: driversList } = useQuery<any | null>({
    queryKey: ["ergast-drivers-list", selectedYear],
    enabled: !!selectedYear && isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/drivers.json?limit=1000`)
      if (!res.ok) return null
      return await res.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  const totalDriversLive = useMemo(() => {
    // Prefer drivers endpoint; fallback to unique drivers from results
    try {
      const list = driversList?.MRData?.DriverTable?.Drivers
      if (Array.isArray(list)) return list.length
    } catch {}
    try {
      const races = driverAllResults?.MRData?.RaceTable?.Races || []
      const set = new Set<string>()
      races.forEach((r: any) => (r?.Results || []).forEach((res: any) => {
        const id = res?.Driver?.driverId
        if (id) set.add(id)
      }))
      return set.size
    } catch {
      return 0
    }
  }, [driversList, driverAllResults])

  const { data: avgPointsData, isLoading: avgPointsLoading } = useQuery<any[]>({
    queryKey: ["avg-points-per-race", selectedYear],
    enabled: !!selectedYear && !isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`SELECT AVG(driver_career_avg_points) as avg_points FROM enhanced_dataset WHERE year = ${year}`)
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const avgPoints = useMemo(() => {
    const row = Array.isArray(avgPointsData) ? avgPointsData[0] : undefined
    const raw = row?.avg_points
    const num = raw != null ? Number(raw) : 0
    return Number.isFinite(num) ? num : 0
  }, [avgPointsData])

  const { data: mostWinsData, isLoading: mostWinsLoading } = useQuery<any[]>({
    queryKey: ["most-wins", selectedYear],
    enabled: !!selectedYear && !isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`
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
      `)
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const mostWins = useMemo(() => {
    const row = Array.isArray(mostWinsData) ? mostWinsData[0] : undefined
    const raw = row?.wins
    return raw != null ? Number(raw) : 0
  }, [mostWinsData])

  const mostWinsDriver = useMemo(() => {
    const row = Array.isArray(mostWinsData) ? mostWinsData[0] : undefined
    const fn = row?.first_name
    const ln = row?.last_name
    if (fn || ln) return `${fn || ""} ${ln || ""}`.trim()
    return row?.driver_id || ""
  }, [mostWinsData])

  const { data: mostPodiumsData, isLoading: mostPodiumsLoading } = useQuery<any[]>({
    queryKey: ["most-podiums", selectedYear],
    enabled: !!selectedYear && !isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`
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
      `)
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const mostPodiums = useMemo(() => {
    const row = Array.isArray(mostPodiumsData) ? mostPodiumsData[0] : undefined
    const raw = row?.podiums
    return raw != null ? Number(raw) : 0
  }, [mostPodiumsData])

  const mostPodiumsDriver = useMemo(() => {
    const row = Array.isArray(mostPodiumsData) ? mostPodiumsData[0] : undefined
    const fn = row?.first_name
    const ln = row?.last_name
    if (fn || ln) return `${fn || ""} ${ln || ""}`.trim()
    return row?.driver_id || ""
  }, [mostPodiumsData])

  const { data: standingsData, isLoading: standingsLoading } = useQuery<any[]>({
    queryKey: ["season-standings", selectedYear],
    enabled: !!selectedYear && !isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`
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
      `)
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: ergastStandings } = useQuery<any | null>({
    queryKey: ["ergast-standings", selectedYear],
    enabled: !!selectedYear && isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`)
      if (!res.ok) return null
      return await res.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  const ergastPointsByDriverId = useMemo(() => {
    const map = new Map<string, number>()
    try {
      const lists = ergastStandings?.MRData?.StandingsTable?.StandingsLists || []
      const drivers = lists[0]?.DriverStandings || []
      drivers.forEach((d: any) => {
        const driverId = d?.Driver?.driverId // e.g., "max_verstappen"
        const pts = d?.points != null ? Number(d.points) : undefined
        if (driverId && typeof pts === 'number' && Number.isFinite(pts)) {
          map.set(driverId, pts)
        }
      })
    } catch {}
    return map
  }, [ergastStandings])

  const ergastNationalityByDriverId = useMemo(() => {
    const map = new Map<string, string>()
    try {
      const lists = ergastStandings?.MRData?.StandingsTable?.StandingsLists || []
      const drivers = lists[0]?.DriverStandings || []
      drivers.forEach((d: any) => {
        const driverId = d?.Driver?.driverId
        const nat = d?.Driver?.nationality
        if (driverId && nat) map.set(driverId, nat)
      })
    } catch {}
    return map
  }, [ergastStandings])

  const ergastRounds = useMemo(() => {
    try {
      const lists = ergastStandings?.MRData?.StandingsTable?.StandingsLists || []
      const round = lists[0]?.round
      return round ? Number(round) : undefined
    } catch {
      return undefined
    }
  }, [ergastStandings])

  // Surprise Performer: highest average positions gained (qualifying -> race)
  const { data: surpriseData, isLoading: surpriseLoading } = useQuery<any[]>({
    queryKey: ["surprise-performer", selectedYear],
    enabled: !!selectedYear && !isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`
        WITH per_race AS (
          SELECT year, round, driver_id,
                 MIN(driver_first_name) AS first_name,
                 MIN(driver_last_name) AS last_name,
                 MIN(grid_position) AS grid,
                 MIN(position) AS finish
          FROM enhanced_dataset
          WHERE year = ${year}
          GROUP BY year, round, driver_id
        )
        SELECT driver_id,
               MIN(first_name) AS first_name,
               MIN(last_name) AS last_name,
               AVG((grid)::float - (finish)::float) AS avg_gain,
               COUNT(*) FILTER (WHERE grid IS NOT NULL AND finish IS NOT NULL) AS races
        FROM per_race
        WHERE grid IS NOT NULL AND finish IS NOT NULL
        GROUP BY driver_id
        HAVING COUNT(*) > 0
        ORDER BY avg_gain DESC
        LIMIT 1
      `)
    },
  })

  const surpriseGain = useMemo(() => {
    if (isLiveSeason) {
      try {
        const races = driverAllResults?.MRData?.RaceTable?.Races || []
        const sums = new Map<string, { sum: number; n: number }>()
        races.forEach((r: any) => (r?.Results || []).forEach((res: any) => {
          const id = res?.Driver?.driverId
          const grid = Number(res?.grid)
          const finish = Number(res?.position)
          if (!id || !Number.isFinite(grid) || !Number.isFinite(finish)) return
          const cur = sums.get(id) || { sum: 0, n: 0 }
          cur.sum += (grid - finish)
          cur.n += 1
          sums.set(id, cur)
        }))
        let best = 0; let bestId = ""
        sums.forEach(({ sum, n }, id) => {
          if (n > 0) {
            const avg = sum / n
            if (avg > best) { best = avg; bestId = id }
          }
        })
        return best
      } catch { return 0 }
    }
    const row = Array.isArray(surpriseData) ? surpriseData[0] : undefined
    const raw = row?.avg_gain
    const num = raw != null ? Number(raw) : 0
    return Number.isFinite(num) ? num : 0
  }, [isLiveSeason, driverAllResults, surpriseData])

  const surpriseDriver = useMemo(() => {
    if (isLiveSeason) {
      try {
        const races = driverAllResults?.MRData?.RaceTable?.Races || []
        const sums = new Map<string, { sum: number; n: number }>()
        races.forEach((r: any) => (r?.Results || []).forEach((res: any) => {
          const id = res?.Driver?.driverId
          const grid = Number(res?.grid)
          const finish = Number(res?.position)
          if (!id || !Number.isFinite(grid) || !Number.isFinite(finish)) return
          const cur = sums.get(id) || { sum: 0, n: 0 }
          cur.sum += (grid - finish)
          cur.n += 1
          sums.set(id, cur)
        }))
        let best = -Infinity; let bestId = ""
        sums.forEach(({ sum, n }, id) => {
          if (n > 0) {
            const avg = sum / n
            if (avg > best) { best = avg; bestId = id }
          }
        })
        // Map to human name from Ergast standings if available
        const lists = ergastStandings?.MRData?.StandingsTable?.StandingsLists || []
        const drivers = lists[0]?.DriverStandings || []
        const d = drivers.find((x: any) => x?.Driver?.driverId === bestId)
        const fn = d?.Driver?.givenName || ""; const ln = d?.Driver?.familyName || ""
        return `${fn} ${ln}`.trim() || bestId
      } catch { return "" }
    }
    const row = Array.isArray(surpriseData) ? surpriseData[0] : undefined
    const fn = row?.first_name
    const ln = row?.last_name
    if (fn || ln) return `${fn || ""} ${ln || ""}`.trim()
    return row?.driver_id || ""
  }, [isLiveSeason, driverAllResults, ergastStandings, surpriseData])
  const drivers = [
    {
      name: "Max Verstappen",
      team: "Red Bull Racing",
      wins: 19,
      podiums: 21,
      points: 575,
      trend: "up",
      change: "+12%",
    },
    { name: "Lando Norris", team: "McLaren", wins: 3, podiums: 15, points: 356, trend: "up", change: "+45%" },
    { name: "Charles Leclerc", team: "Ferrari", wins: 2, podiums: 12, points: 325, trend: "stable", change: "0%" },
    { name: "Oscar Piastri", team: "McLaren", wins: 2, podiums: 10, points: 292, trend: "up", change: "+38%" },
    { name: "Carlos Sainz", team: "Ferrari", wins: 2, podiums: 11, points: 290, trend: "down", change: "-8%" },
    { name: "Lewis Hamilton", team: "Mercedes", wins: 2, podiums: 8, points: 234, trend: "up", change: "+15%" },
    { name: "George Russell", team: "Mercedes", wins: 1, podiums: 7, points: 215, trend: "stable", change: "+2%" },
    { name: "Sergio Perez", team: "Red Bull Racing", wins: 0, podiums: 5, points: 152, trend: "down", change: "-35%" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Driver Performance</h2>
          <p className="text-muted-foreground">Comprehensive driver statistics and performance trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear ? String(selectedYear) : undefined} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Drivers</CardTitle>
            <CardDescription className="text-xs">Number of unique drivers in the selected season</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalDriversLoading ? "-" : totalDrivers}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Surprise Performer</CardTitle>
            <CardDescription className="text-xs">Average positions gained from grid to finish across the season</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{surpriseLoading ? "-" : `${surpriseGain >= 0 ? "+" : ""}${surpriseGain.toFixed(1)}`}</p>
            <p className="text-xs text-muted-foreground mt-1">{surpriseLoading ? "" : surpriseDriver}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Wins</CardTitle>
            <CardDescription className="text-xs">Driver with the highest number of wins in the season</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{mostWinsLoading ? "-" : mostWins}</p>
            <p className="text-xs text-muted-foreground mt-1">{mostWinsLoading ? "" : mostWinsDriver}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Podiums</CardTitle>
            <CardDescription className="text-xs">Driver with the highest number of podiums in the season</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{mostPodiumsLoading ? "-" : mostPodiums}</p>
            <p className="text-xs text-muted-foreground mt-1">{mostPodiumsLoading ? "" : mostPodiumsDriver}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>{selectedYear ? `${selectedYear} Season Standings` : `Season Standings`}</CardTitle>
          <CardDescription>Driver championship standings with performance trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
              <div className="col-span-1">Pos</div>
              <div className="col-span-3">Driver</div>
              <div className="col-span-2">Nationality</div>
              <div className="col-span-2">Team</div>
              <div className="col-span-1 text-center">Wins</div>
              <div className="col-span-1 text-center">Podiums</div>
              <div className="col-span-2 text-right">Points</div>
            </div>
            {standingsLoading && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">Loading standings...</div>
            )}
            {!standingsLoading && Array.isArray(standingsData) && standingsData.map((row: any, index: number) => (
              <div
                key={row.driver_id}
                className="grid grid-cols-12 gap-4 items-center py-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="col-span-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      (row.team || '').toLowerCase().includes('red bull') ? 'team-badge-red-bull' :
                      (row.team || '').toLowerCase().includes('ferrari') ? 'team-badge-ferrari' :
                      (row.team || '').toLowerCase().includes('mercedes') ? 'team-badge-mercedes' :
                      (row.team || '').toLowerCase().includes('mclaren') ? 'team-badge-mclaren' :
                      (row.team || '').toLowerCase().includes('alpine') ? 'team-badge-alpine' :
                      (row.team || '').toLowerCase().includes('williams') ? 'team-badge-williams' :
                      (row.team || '').toLowerCase().includes('rb') ? 'team-badge-rb' :
                      (row.team || '').toLowerCase().includes('aston') ? 'team-badge-aston-martin' :
                      (row.team || '').toLowerCase().includes('stake') || (row.team || '').toLowerCase().includes('sauber') ? 'team-badge-sauber' :
                      (row.team || '').toLowerCase().includes('haas') ? 'team-badge-haas' : 'bg-muted text-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
                <div className="col-span-3 font-medium text-foreground">{row.first_name || ""} {row.last_name || ""}</div>
                <div className="col-span-2 text-sm text-muted-foreground">{ergastNationalityByDriverId.get(row.driver_id) || row.nationality || ""}</div>
                <div className="col-span-2 text-sm text-muted-foreground">{row.team || ""}</div>
                <div className="col-span-1 text-center font-medium text-foreground">{row.wins ?? 0}</div>
                <div className="col-span-1 text-center font-medium text-foreground">{row.podiums ?? 0}</div>
                <div className="col-span-2 text-right font-bold text-foreground">{ergastPointsByDriverId.get(row.driver_id) ?? row.points ?? 0}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
