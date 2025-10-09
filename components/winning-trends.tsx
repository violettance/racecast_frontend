"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { neonClient } from "@/lib/neon-client"
import { useRaceStore } from "@/lib/race-store"

export function WinningTrends() {
  const selectedDriver = useRaceStore((s) => s.selectedDriver)
  const selectedConstructor = useRaceStore((s) => s.selectedConstructor)
  const setSelectedDriver = useRaceStore((s) => s.setSelectedDriver)
  const setSelectedConstructor = useRaceStore((s) => s.setSelectedConstructor)

  // Sample data for 2018-2024 winning trends
  const sampleDriverData = [
    { year: 2018, wins: 8, podiums: 15 },
    { year: 2019, wins: 3, podiums: 9 },
    { year: 2020, wins: 2, podiums: 7 },
    { year: 2021, wins: 10, podiums: 18 },
    { year: 2022, wins: 15, podiums: 17 },
    { year: 2023, wins: 19, podiums: 21 },
    { year: 2024, wins: 14, podiums: 19 },
  ]

  const sampleConstructorData = [
    { year: 2018, wins: 12, podiums: 25 },
    { year: 2019, wins: 8, podiums: 18 },
    { year: 2020, wins: 5, podiums: 12 },
    { year: 2021, wins: 15, podiums: 28 },
    { year: 2022, wins: 18, podiums: 30 },
    { year: 2023, wins: 22, podiums: 35 },
    { year: 2024, wins: 16, podiums: 28 },
  ]

  // Sample drivers and constructors from the dataset documentation
  const sampleDrivers = [
    { id: "max_verstappen", name: "Max Verstappen", abbreviation: "VER" },
    { id: "lewis_hamilton", name: "Lewis Hamilton", abbreviation: "HAM" },
    { id: "charles_leclerc", name: "Charles Leclerc", abbreviation: "LEC" },
    { id: "carlos_sainz", name: "Carlos Sainz", abbreviation: "SAI" },
    { id: "lando_norris", name: "Lando Norris", abbreviation: "NOR" },
    { id: "george_russell", name: "George Russell", abbreviation: "RUS" },
    { id: "fernando_alonso", name: "Fernando Alonso", abbreviation: "ALO" },
    { id: "sergio_perez", name: "Sergio Perez", abbreviation: "PER" },
  ]

  const sampleConstructors = [
    { id: "red_bull", name: "Red Bull Racing" },
    { id: "mercedes", name: "Mercedes" },
    { id: "ferrari", name: "Ferrari" },
    { id: "mclaren", name: "McLaren" },
    { id: "aston_martin", name: "Aston Martin" },
    { id: "alpine", name: "Alpine" },
    { id: "alfa_romeo", name: "Alfa Romeo" },
    { id: "haas", name: "Haas" },
  ]

  // Fetch drivers with caching
  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ["winning-trends-drivers"],
    queryFn: async () => {
      const driversQuery = `
        SELECT DISTINCT driver_id, driver_first_name, driver_last_name, driver_abbreviation
        FROM enhanced_dataset 
        WHERE driver_abbreviation IS NOT NULL
        AND driver_id IN (
          SELECT driver_id 
          FROM enhanced_dataset 
          WHERE position = 1 OR position <= 3
          GROUP BY driver_id
          HAVING COUNT(CASE WHEN position = 1 THEN 1 END) > 0 OR COUNT(CASE WHEN position <= 3 THEN 1 END) > 0
        )
        ORDER BY driver_last_name
      `
      const driversData = await neonClient.query(driversQuery)
      return (driversData as any[]).map((driver: any) => ({
        id: driver.driver_id,
        name: `${driver.driver_first_name} ${driver.driver_last_name}`,
        abbreviation: driver.driver_abbreviation
      }))
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  // Fetch constructors with caching
  const { data: constructors = [], isLoading: constructorsLoading } = useQuery({
    queryKey: ["winning-trends-constructors"],
    queryFn: async () => {
      const constructorsQuery = `
        SELECT DISTINCT constructor_id, constructor_name
        FROM enhanced_dataset 
        WHERE constructor_name IS NOT NULL
        AND constructor_id IN (
          SELECT constructor_id 
          FROM enhanced_dataset 
          WHERE position = 1 OR position <= 3
          GROUP BY constructor_id
          HAVING COUNT(CASE WHEN position = 1 THEN 1 END) > 0 OR COUNT(CASE WHEN position <= 3 THEN 1 END) > 0
        )
        AND constructor_id NOT IN ('alphatauri', 'toro_rosso', 'sauber', 'alfa_romeo', 'renault', 'force_india', 'racing_point')
        ORDER BY constructor_name
      `
      const constructorsData = await neonClient.query(constructorsQuery)
      return (constructorsData as any[]).map((constructor: any) => ({
        id: constructor.constructor_id,
        name: constructor.constructor_name
      }))
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  // Fetch driver trends with caching
  const { data: driverChartData = [], isLoading: driverTrendsLoading } = useQuery({
    queryKey: ["winning-trends-driver", selectedDriver],
    queryFn: async () => {
      if (!selectedDriver) return []
      
      const query = `
        SELECT 
          year,
          COUNT(CASE WHEN position = 1 THEN 1 END) as wins,
          COUNT(CASE WHEN position <= 3 THEN 1 END) as podiums
        FROM enhanced_dataset 
        WHERE driver_id = '${selectedDriver}' AND year BETWEEN 2018 AND 2024
        GROUP BY year
        HAVING COUNT(CASE WHEN position = 1 THEN 1 END) > 0 OR COUNT(CASE WHEN position <= 3 THEN 1 END) > 0
        ORDER BY year
      `
      
      const result = await neonClient.query(query)
      return result && Array.isArray(result) ? result as any[] : []
    },
    enabled: !!selectedDriver,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  // Fetch constructor trends with caching
  const { data: constructorChartData = [], isLoading: constructorTrendsLoading } = useQuery({
    queryKey: ["winning-trends-constructor", selectedConstructor],
    queryFn: async () => {
      if (!selectedConstructor) return []
      
      // Handle team name changes - RB F1 Team is the continuation of AlphaTauri/Toro Rosso
      let query = `
        SELECT 
          year,
          COUNT(CASE WHEN position = 1 THEN 1 END) as wins,
          COUNT(CASE WHEN position <= 3 THEN 1 END) as podiums
        FROM enhanced_dataset 
        WHERE year BETWEEN 2018 AND 2024
      `
      
      if (selectedConstructor === 'rb') {
        // RB F1 Team = AlphaTauri + Toro Rosso combined
        query += ` AND (constructor_id = 'rb' OR constructor_id = 'alphatauri' OR constructor_id = 'toro_rosso')`
      } else if (selectedConstructor === 'stake_f1_team') {
        // Stake F1 Team = Sauber + Alfa Romeo combined
        query += ` AND (constructor_id = 'stake_f1_team' OR constructor_id = 'sauber' OR constructor_id = 'alfa_romeo')`
      } else if (selectedConstructor === 'alpine') {
        // Alpine = Renault combined
        query += ` AND (constructor_id = 'alpine' OR constructor_id = 'renault')`
      } else if (selectedConstructor === 'aston_martin') {
        // Aston Martin = Force India + Racing Point combined
        query += ` AND (constructor_id = 'aston_martin' OR constructor_id = 'force_india' OR constructor_id = 'racing_point')`
      } else {
        query += ` AND constructor_id = '${selectedConstructor}'`
      }
      
      query += `
        GROUP BY year
        HAVING COUNT(CASE WHEN position = 1 THEN 1 END) > 0 OR COUNT(CASE WHEN position <= 3 THEN 1 END) > 0
        ORDER BY year
      `
      
      const result = await neonClient.query(query)
      return result && Array.isArray(result) ? result as any[] : []
    },
    enabled: !!selectedConstructor,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  const handleDriverChange = (driverId: string) => {
    setSelectedDriver(driverId)
  }

  const handleConstructorChange = (constructorId: string) => {
    setSelectedConstructor(constructorId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Winning Trends</h2>
        <p className="text-muted-foreground">Driver and constructor performance trends from 2018-2024</p>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Driver Chart */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Driver Performance Trends</CardTitle>
                <CardDescription>
                  {selectedDriver 
                    ? `Winning trends for ${drivers.find(d => d.id === selectedDriver)?.name}`
                    : "Select a driver to view their performance trends"
                  }
                </CardDescription>
              </div>
              <div className="w-64">
                <label className="text-sm font-medium text-foreground mb-2 block">Driver</label>
                <Select value={selectedDriver} onValueChange={handleDriverChange} disabled={driversLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={driversLoading ? "Loading drivers..." : "Choose a driver..."} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
          {driverTrendsLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : driverChartData.length === 0 ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-muted-foreground">No data available for this driver</div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={driverChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="wins" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    name="Wins"
                    dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="podiums" 
                    stroke="#16a34a" 
                    strokeWidth={3}
                    name="Podiums"
                    dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          </CardContent>
        </Card>

        {/* Team Chart */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Team Performance Trends</CardTitle>
                <CardDescription>
                  {selectedConstructor 
                    ? `Winning trends for ${constructors.find(c => c.id === selectedConstructor)?.name}`
                    : "Select a team to view their performance trends"
                  }
                </CardDescription>
              </div>
              <div className="w-64">
                <label className="text-sm font-medium text-foreground mb-2 block">Team</label>
                <Select value={selectedConstructor} onValueChange={handleConstructorChange} disabled={constructorsLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={constructorsLoading ? "Loading teams..." : "Choose a team..."} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {constructors.map((constructor) => (
                      <SelectItem key={constructor.id} value={constructor.id}>
                        {constructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
          {constructorTrendsLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : constructorChartData.length === 0 ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-muted-foreground">No data available for this team</div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={constructorChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="wins" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    name="Wins"
                    dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="podiums" 
                    stroke="#16a34a" 
                    strokeWidth={3}
                    name="Podiums"
                    dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              * Latest team names are used for teams with name changes
            </p>
          </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
