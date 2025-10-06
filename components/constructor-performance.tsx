"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ConstructorPerformance() {
  const constructors = [
    { name: "Red Bull Racing", points: 727, wins: 19, podiums: 26, color: "bg-[#3671C6]" },
    { name: "McLaren", points: 648, wins: 5, podiums: 25, color: "bg-[#FF8000]" },
    { name: "Ferrari", points: 615, wins: 4, podiums: 23, color: "bg-[#E8002D]" },
    { name: "Mercedes", points: 449, wins: 3, podiums: 15, color: "bg-[#27F4D2]" },
    { name: "Aston Martin", points: 92, wins: 0, podiums: 0, color: "bg-[#229971]" },
    { name: "Alpine", points: 65, wins: 0, podiums: 0, color: "bg-[#FF87BC]" },
    { name: "Haas", points: 54, wins: 0, podiums: 0, color: "bg-[#B6BABD]" },
    { name: "RB", points: 46, wins: 0, podiums: 0, color: "bg-[#6692FF]" },
    { name: "Williams", points: 17, wins: 0, podiums: 0, color: "bg-[#64C4FF]" },
    { name: "Kick Sauber", points: 4, wins: 0, podiums: 0, color: "bg-[#52E252]" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Constructor Performance</h2>
        <p className="text-muted-foreground">Team championship standings and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">10</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leading Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">Red Bull Racing</p>
            <p className="text-xs text-muted-foreground mt-1">727 points</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">19</p>
            <p className="text-xs text-muted-foreground mt-1">Red Bull Racing</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Podiums</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">89</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>2024 Constructor Championship</CardTitle>
          <CardDescription>Team standings with detailed performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {constructors.map((team, index) => (
              <div key={team.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
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
                    style={{ width: `${(team.points / 727) * 100}%` }}
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
