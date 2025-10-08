"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { neonClient } from "@/lib/neon-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MBTI_TITLES: Record<string, string> = {
  ENFJ: "Grid Charismatics",
  ENFP: "Pit Lane Firecrackers",
  ENTJ: "Command Lap Masters",
  ENTP: "Rogue Grid Rebels",
  ESFJ: "Team Bay Harmonizers",
  ESFP: "High-Octane Showmen",
  ESTJ: "Iron Rule Enforcers",
  ESTP: "Adrenaline Apex Chasers",
  INFJ: "Vision Lap Strategists",
  INFP: "Overtake Daydreamers",
  INTJ: "Shadow Strategy Architects",
  INTP: "Circuit Logic Rebels",
  ISFJ: "Reliable Rearguard Shields",
  ISFP: "Flow State Drifters",
  ISTJ: "Grid Discipline Wardens",
  ISTP: "Stone-Cold Speedsters",
}

const MBTI_DESCRIPTIONS: Record<string, string> = {
  ENFJ: "read other drivers’ intentions fast, control pace in battles, strong under pressure",
  ENFP: "improvise instantly, exploit chaos, thrive in changing grip conditions",
  ENTJ: "dominate race rhythm, plan overtakes three corners ahead, relentless focus",
  ENTP: "invent overtaking lines, adapt to rivals’ moves, unpredictable in duels",
  ESFJ: "maintain tire rhythm, handle traffic cleanly, consistent under long stints",
  ESFP: "late brakers, confident wheel-to-wheel, explosive acceleration out of corners",
  ESTJ: "control lap times precisely, manage pace like a metronome, error-free execution",
  ESTP: "fearless overtakers, elite car control, push limits without losing grip",
  INFJ: "anticipate racing lines ahead of time, sense weather and surface changes early",
  INFP: "creative with corner entries, smooth throttle modulation, minimal tire wear",
  INTJ: "master tire phase timing, perfect race pace evolution, precision thinking",
  INTP: "calculate braking and energy use precisely, adaptive to setup feedback",
  ISFJ: "protect position flawlessly, defensive awareness, smart line discipline",
  ISFP: "naturally smooth steering, flow in every corner, perfect tire and balance control",
  ISTJ: "execute race plan flawlessly, consistent lap after lap, zero mental drop-off",
  ISTP: "ultimate car feel, razor-sharp reaction time, unbeatable in pure driving duels",
}

function capitalizeFirst(input: string) {
  if (!input) return input
  const s = input.trim()
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function formatDescription(desc: string | undefined) {
  if (!desc) return ''
  const s = desc.trim().toLowerCase()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function DriverPersonality() {
  const [selectedYear, setSelectedYear] = useState<string>("2024")
  type WinsRow = { typology: string | null; drivers: number; wins: number; podiums: number; avg_speed: number | null }
  const { data: winsData, isLoading: isLoadingWins, isError: isErrorWins, error: errorWins } = useQuery({
    queryKey: ["driver-personality-wins", selectedYear],
    queryFn: async () => {
      return await neonClient.query<WinsRow[]>(
        `WITH names AS (
            SELECT TRIM(CONCAT(driver_first_name, ' ', driver_last_name)) AS full_name,
                   position,
                   avg_speed
           FROM enhanced_dataset
            WHERE driver_first_name IS NOT NULL AND driver_last_name IS NOT NULL
              AND year = ${Number(selectedYear)}
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
          ORDER BY wins DESC`
      )
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  type WhyRow = { bucket: string | null; count: number }
  const { data: whyData, isLoading: isLoadingWhy, isError: isErrorWhy, error: errorWhy } = useQuery({
    queryKey: ["driver-personality-why-categorical", selectedYear],
    queryFn: async () => {
      return await neonClient.query<WhyRow[]>(
        `WITH names AS (
           SELECT TRIM(CONCAT(driver_first_name, ' ', driver_last_name)) AS full_name
           FROM enhanced_dataset
           WHERE driver_first_name IS NOT NULL AND driver_last_name IS NOT NULL
             AND year = ${Number(selectedYear)}
           GROUP BY 1
         )
         SELECT COALESCE(dp.why_choose_number_categorical, 'Unknown') AS bucket,
                COUNT(DISTINCT LOWER(TRIM(dp.driver_full_name)))::int AS count
         FROM driver_personality dp
         JOIN names n ON LOWER(TRIM(dp.driver_full_name)) = LOWER(TRIM(n.full_name))
         GROUP BY 1
         ORDER BY count DESC`
      )
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  if (isLoadingWins) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Driver Personality</h2>
          <p className="text-muted-foreground">Archetype distribution in {selectedYear}</p>
        </div>
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Loading wins by typology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-[90%]" />
            <Skeleton className="h-6 w-[75%]" />
            <Skeleton className="h-6 w-[60%]" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isErrorWins) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Driver Personality</h2>
          <p className="text-muted-foreground">Archetype distribution in {selectedYear}</p>
        </div>
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Failed to load</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              {(errorWins as Error)?.message || "Unknown error"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Driver Personality</h2>
          <p className="text-muted-foreground">Archetype distribution in {selectedYear}</p>
        </div>
        <div className="mt-1">
          <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v)}>
            <SelectTrigger aria-label="Select year">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2019">2019</SelectItem>
              <SelectItem value="2018">2018</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent>
          {!winsData || winsData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            (() => {
              const rows = winsData.filter(r => r.typology)
              const mapped = rows.map(r => ({
                label: MBTI_TITLES[(r.typology || '').toUpperCase()] || (r.typology || ''),
                drivers: Number(r.drivers || 0),
                wins: Number(r.wins || 0),
                efficiency: Number(r.drivers || 0) > 0 ? Number(r.wins || 0) / Number(r.drivers || 0) : 0,
              }))
              return (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Archetype</TableHead>
                      <TableHead className="text-right">Drivers</TableHead>
                      <TableHead className="text-right">Wins</TableHead>
                      <TableHead className="text-right">Podiums</TableHead>
                      <TableHead className="text-right">Avg speed</TableHead>
                      <TableHead className="text-right">Efficiency (wins/drivers)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mapped.map(({ label, drivers, wins, efficiency }) => (
                      <TableRow key={label}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{label}</span>
                            <span className="text-xs text-muted-foreground">
                              {(() => {
                                // Reverse mapping: find code whose title matches label
                                const entry = Object.entries(MBTI_TITLES).find(([, v]) => v === label)
                                const code = entry?.[0] || ''
                                return formatDescription(MBTI_DESCRIPTIONS[code])
                              })()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{drivers}</TableCell>
                        <TableCell className="text-right tabular-nums">{wins}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {(() => {
                            const row = rows.find(r => (MBTI_TITLES[(r.typology || '').toUpperCase()] || (r.typology || '')) === label)
                            const v = row?.podiums
                            return v == null ? '-' : Number(v)
                          })()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {(() => {
                            const row = rows.find(r => (MBTI_TITLES[(r.typology || '').toUpperCase()] || (r.typology || '')) === label)
                            const v = row?.avg_speed
                            return v == null ? '-' : Number(v).toFixed(1)
                          })()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{efficiency.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            })()
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Why They Chose Their Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingWhy ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-[90%]" />
              <Skeleton className="h-6 w-[75%]" />
            </div>
          ) : isErrorWhy ? (
            <p className="text-sm text-destructive">{(errorWhy as Error)?.message || 'Failed to load'}</p>
          ) : !whyData || whyData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            (() => {
              const rows = whyData
              const maxCount = Math.max(...rows.map(r => Number(r.count || 0)))
              return (
                <div className="space-y-3">
                  {rows.map(({ bucket, count }) => {
                    const label = bucket || 'Unknown'
                    const widthPercent = maxCount > 0 ? (Number(count) / maxCount) * 100 : 0
                    return (
                      <div key={label} className="grid grid-cols-[220px_1fr_auto] items-center gap-3">
                        <div className="truncate text-sm text-foreground" title={label}>{label}</div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="h-3 rounded-full"
                            style={{ width: `${widthPercent}%`, backgroundColor: '#e42218' }}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={maxCount}
                            aria-valuenow={Number(count)}
                          />
                        </div>
                        <div className="text-sm tabular-nums text-muted-foreground">{count}</div>
                      </div>
                    )
                  })}
                </div>
              )
            })()
          )}
        </CardContent>
      </Card>
    </div>
  )
}
