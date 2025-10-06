"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function DriverPerformance() {
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
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Driver Performance</h2>
        <p className="text-muted-foreground">Comprehensive driver statistics and performance trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">20</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Points/Race</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">12.4</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">19</p>
            <p className="text-xs text-muted-foreground mt-1">Max Verstappen</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Podiums</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">21</p>
            <p className="text-xs text-muted-foreground mt-1">Max Verstappen</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>2024 Season Standings</CardTitle>
          <CardDescription>Current driver championship standings with performance trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
              <div className="col-span-1">Pos</div>
              <div className="col-span-3">Driver</div>
              <div className="col-span-3">Team</div>
              <div className="col-span-1 text-center">Wins</div>
              <div className="col-span-1 text-center">Podiums</div>
              <div className="col-span-2 text-right">Points</div>
              <div className="col-span-1 text-right">Trend</div>
            </div>
            {drivers.map((driver, index) => (
              <div
                key={driver.name}
                className="grid grid-cols-12 gap-4 items-center py-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="col-span-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : index === 1
                          ? "bg-accent text-accent-foreground"
                          : index === 2
                            ? "bg-chart-3 text-primary-foreground"
                            : "bg-muted text-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
                <div className="col-span-3 font-medium text-foreground">{driver.name}</div>
                <div className="col-span-3 text-sm text-muted-foreground">{driver.team}</div>
                <div className="col-span-1 text-center font-medium text-foreground">{driver.wins}</div>
                <div className="col-span-1 text-center font-medium text-foreground">{driver.podiums}</div>
                <div className="col-span-2 text-right font-bold text-foreground">{driver.points}</div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {driver.trend === "up" && <TrendingUp className="w-4 h-4 text-accent" />}
                  {driver.trend === "down" && <TrendingDown className="w-4 h-4 text-destructive" />}
                  {driver.trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
                  <span
                    className={`text-xs font-medium ${
                      driver.trend === "up"
                        ? "text-accent"
                        : driver.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {driver.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
