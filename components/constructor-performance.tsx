"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRaceStore } from "@/lib/race-store"
import { neonClient } from "@/lib/neon-client"

export function ConstructorPerformance() {
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

  const { data: totalTeamsData, isLoading: totalTeamsLoading } = useQuery<any[]>({
    queryKey: ["total-constructors", selectedYear],
    enabled: !!selectedYear,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`SELECT COUNT(DISTINCT constructor_id) as count FROM enhanced_dataset WHERE year = ${year}`)
    },
  })

  const totalTeams = useMemo(() => {
    const row = Array.isArray(totalTeamsData) ? totalTeamsData[0] : undefined
    const raw = row?.count
    return raw != null ? Number(raw) : 0
  }, [totalTeamsData])

  const { data: leadingTeamData, isLoading: leadingTeamLoading } = useQuery<any[]>({
    queryKey: ["leading-constructor", selectedYear],
    enabled: !!selectedYear && !isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`
        WITH per_race AS (
          SELECT year, round, constructor_id,
                 MIN(constructor_name) AS team,
                 driver_id,
                 MIN(position) AS position
          FROM enhanced_dataset
          WHERE year = ${year}
          GROUP BY year, round, constructor_id, driver_id
        )
        SELECT constructor_id,
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
        GROUP BY constructor_id
        ORDER BY points DESC NULLS LAST, wins DESC, podiums DESC
        LIMIT 1
      `)
    },
  })

  const leadingTeamName = useMemo(() => {
    const row = Array.isArray(leadingTeamData) ? leadingTeamData[0] : undefined
    return row?.team || ""
  }, [leadingTeamData])

  const leadingTeamPoints = useMemo(() => {
    const row = Array.isArray(leadingTeamData) ? leadingTeamData[0] : undefined
    const raw = row?.points
    return raw != null ? Number(raw) : 0
  }, [leadingTeamData])

  // Use official Ergast constructor standings for accurate points (includes sprints/FL)
  const { data: ergastConstructors } = useQuery<any | null>({
    queryKey: ["ergast-constructor-standings", selectedYear],
    enabled: !!selectedYear && isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`)
      if (!res.ok) return null
      return await res.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  const ergastLeadingTeam = useMemo(() => {
    try {
      const lists = ergastConstructors?.MRData?.StandingsTable?.StandingsLists || []
      const constructors = lists[0]?.ConstructorStandings || []
      const top = constructors[0]
      if (!top) return { name: "", points: undefined as number | undefined }
      const name = top?.Constructor?.name || ""
      const pts = top?.points != null ? Number(top.points) : undefined
      return { name, points: pts }
    } catch {
      return { name: "", points: undefined as number | undefined }
    }
  }, [ergastConstructors])

  // removed Most Wins DB query (card replaced by Total Races)

  // We'll derive "Unique Teams with Podiums" directly from computed constructors
  // Use official Ergast constructor standings for accurate points (includes sprints/FL)
  const { data: constructorStandingsData, isLoading: constructorStandingsLoading } = useQuery<any | null>({
    queryKey: ["ergast-constructor-standings-full", selectedYear],
    enabled: !!selectedYear && isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`)
      if (!res.ok) return null
      return await res.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Fetch podium-position results separately to compute accurate wins/podiums per constructor
  const { data: podiumResultSets } = useQuery<any[] | null>({
    queryKey: ["ergast-constructor-podiums", selectedYear],
    enabled: !!selectedYear && isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      const urls = [1,2,3].map((p) => `https://api.jolpi.ca/ergast/f1/${year}/results/${p}.json?limit=1000`)
      const resps = await Promise.all(urls.map((u) => fetch(u)))
      const jsons = await Promise.all(resps.map((r) => r.ok ? r.json() : null))
      return jsons
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // DB standings for completed seasons
  const { data: constructorStandingsDbData, isLoading: constructorStandingsDbLoading } = useQuery<any[]>({
    queryKey: ["constructor-standings-db", selectedYear],
    enabled: !!selectedYear && !isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`
        WITH per_race AS (
          SELECT year, round, constructor_id,
                 MIN(constructor_name) AS team,
                 driver_id,
                 MIN(position) AS position
          FROM enhanced_dataset
          WHERE year = ${year}
          GROUP BY year, round, constructor_id, driver_id
        )
        SELECT constructor_id,
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
        GROUP BY constructor_id
        ORDER BY points DESC NULLS LAST, wins DESC, podiums DESC
      `)
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // DB total races for completed seasons
  const { data: totalRacesDbData } = useQuery<any[]>({
    queryKey: ["total-races-db", selectedYear],
    enabled: !!selectedYear && !isLiveSeason,
    queryFn: async () => {
      const year = selectedYear as number
      return await neonClient.query(`SELECT COUNT(DISTINCT round) as races FROM enhanced_dataset WHERE year = ${year}`)
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const getTeamColor = (teamName: string) => {
    const name = teamName.toLowerCase()
    if (name.includes('red bull')) return 'team-badge-red-bull'
    if (name.includes('ferrari')) return 'team-badge-ferrari'
    if (name.includes('mercedes')) return 'team-badge-mercedes'
    if (name.includes('mclaren')) return 'team-badge-mclaren'
    if (name.includes('alpine')) return 'team-badge-alpine'
    if (name.includes('williams')) return 'team-badge-williams'
    if (name.includes('rb') || name.includes('racing bulls')) return 'team-badge-rb'
    if (name.includes('aston')) return 'team-badge-aston-martin'
    if (name.includes('sauber') || name.includes('stake')) return 'team-badge-sauber'
    if (name.includes('haas')) return 'team-badge-haas'
    return 'bg-muted text-foreground'
  }

  const constructors = useMemo(() => {
    try {
      if (!isLiveSeason) {
        const rows = Array.isArray(constructorStandingsDbData) ? constructorStandingsDbData : []
        return rows.map((row: any) => ({
          name: row?.team || "",
          points: Number(row?.points) || 0,
          wins: Number(row?.wins) || 0,
          podiums: Number(row?.podiums) || 0,
          color: getTeamColor(row?.team || ""),
        }))
      }

      // Build total podium finishes (can exceed race count) and wins by constructorId (live season)
      const statsByConstructorId = new Map<string, { wins: number; podiums: number }>()
      try {
        const sets = podiumResultSets || []
        sets.forEach((j: any, idx: number) => {
          const position = idx + 1
          const races = j?.MRData?.RaceTable?.Races || []
          for (const race of races) {
            const results = race?.Results || []
            for (const res of results) {
              const cid = res?.Constructor?.constructorId
              if (!cid) continue
              const current = statsByConstructorId.get(cid) || { wins: 0, podiums: 0 }
              if (position === 1) current.wins += 1
              current.podiums += 1
              statsByConstructorId.set(cid, current)
            }
          }
        })
      } catch {}

      const lists = constructorStandingsData?.MRData?.StandingsTable?.StandingsLists || []
      const standings = lists[0]?.ConstructorStandings || []
      return standings.map((constructor: any) => {
        const name = constructor?.Constructor?.name || ""
        const cid = constructor?.Constructor?.constructorId || ""
        const fromResults = statsByConstructorId.get(cid)
        return {
          name,
          points: Number(constructor?.points) || 0,
          wins: Number(constructor?.wins ?? fromResults?.wins ?? 0) || 0,
          podiums: Number(fromResults?.podiums ?? 0) || 0,
          color: getTeamColor(name)
        }
      })
    } catch {
      return []
    }
  }, [isLiveSeason, constructorStandingsDbData, constructorStandingsData, podiumResultSets])

  type ConstructorRow = { name: string; points: number; wins: number; podiums: number; color: string }

  const uniquePodiumTeamsCount = useMemo(() => {
    try {
      return constructors.filter((t: ConstructorRow) => (t.podiums || 0) > 0).length
    } catch {
      return 0
    }
  }, [constructors])

  const totalRaces = useMemo(() => {
    try {
      if (!isLiveSeason) {
        const row = Array.isArray(totalRacesDbData) ? totalRacesDbData[0] : undefined
        const raw = row?.races
        return raw != null ? Number(raw) : 0
      }
      const winnersSet = Array.isArray(podiumResultSets) ? podiumResultSets[0] : null
      const races = winnersSet?.MRData?.RaceTable?.Races || []
      return races.length || 0
    } catch {
      return 0
    }
  }, [isLiveSeason, totalRacesDbData, podiumResultSets])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
      <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Team Performance</h2>
        <p className="text-muted-foreground">Team championship standings and performance metrics</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
            <CardDescription className="text-xs">Number of unique constructors in the selected season</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalTeamsLoading ? "-" : totalTeams}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Teams with Podiums</CardTitle>
            <CardDescription className="text-xs">Number of distinct teams achieving a podium this season</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{constructorStandingsLoading ? "-" : uniquePodiumTeamsCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Races</CardTitle>
            <CardDescription className="text-xs">Number of championship rounds this season</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{constructorStandingsLoading ? "-" : totalRaces}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leading Team</CardTitle>
            <CardDescription className="text-xs">Team with the highest overall season points</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">{(ergastLeadingTeam.name || (leadingTeamLoading ? "-" : leadingTeamName)) || "-"}</p>
            <p className="text-xs text-muted-foreground mt-1">{
              ergastLeadingTeam.points != null
                ? `${ergastLeadingTeam.points} points`
                : (leadingTeamLoading ? "" : `${leadingTeamPoints} points`)
            }</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>{selectedYear ? `${selectedYear} Constructor Championship` : `Constructor Championship`}</CardTitle>
          <CardDescription>Team standings with detailed performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {constructorStandingsLoading && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">Loading standings...</div>
            )}
            {!constructorStandingsLoading && constructors.map((team: ConstructorRow) => (
              <div key={team.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${team.color}`} />
                    <div>
                      <p className="font-medium text-foreground">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.wins} wins • {team.podiums} podiums
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{team.points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${team.color}`}
                    style={{ width: `${constructors.length > 0 ? (team.points / constructors[0].points) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
