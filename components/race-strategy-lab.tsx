"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function RaceStrategyLab() {
  const strategies = [
    {
      name: "One-Stop Strategy",
      description: "Single pit stop with tire management",
      compounds: ["Medium → Hard", "Soft → Hard"],
      avgTime: "22-25s",
      success: 65,
      conditions: "Low tire degradation tracks",
    },
    {
      name: "Two-Stop Strategy",
      description: "Two pit stops for fresher tires",
      compounds: ["Soft → Medium → Soft", "Medium → Hard → Medium"],
      avgTime: "44-50s",
      success: 78,
      conditions: "High degradation or safety car",
    },
    {
      name: "Undercut Strategy",
      description: "Early pit to gain track position",
      compounds: ["Soft → Medium (Early)"],
      avgTime: "20-23s",
      success: 72,
      conditions: "Traffic or close racing",
    },
    {
      name: "Overcut Strategy",
      description: "Stay out longer on current tires",
      compounds: ["Medium → Hard (Late)"],
      avgTime: "22-25s",
      success: 58,
      conditions: "Clean air advantage",
    },
  ]

  const tireCompounds = [
    { name: "Soft (C5)", color: "bg-red-500", durability: 45, performance: 95 },
    { name: "Medium (C4)", color: "bg-yellow-500", durability: 70, performance: 80 },
    { name: "Hard (C3)", color: "bg-gray-300", durability: 90, performance: 65 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Race Strategy Lab</h2>
        <p className="text-muted-foreground">Pit stop strategies and tire compound analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Pit Stop Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">2.3s</p>
            <p className="text-xs text-muted-foreground mt-1">2024 season average</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Common</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">Two-Stop</p>
            <p className="text-xs text-muted-foreground mt-1">45% of races</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Strategy Success</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">68%</p>
            <p className="text-xs text-muted-foreground mt-1">Optimal execution rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Tire Compound Analysis</CardTitle>
          <CardDescription>Performance and durability characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tireCompounds.map((tire) => (
              <div key={tire.name} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${tire.color}`} />
                  <p className="font-medium text-foreground">{tire.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Performance</span>
                      <span className="font-medium text-foreground">{tire.performance}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${tire.performance}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Durability</span>
                      <span className="font-medium text-foreground">{tire.durability}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: `${tire.durability}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strategy) => (
          <Card key={strategy.name} className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                  <CardDescription className="mt-1">{strategy.description}</CardDescription>
                </div>
                <Badge variant={strategy.success >= 70 ? "default" : "secondary"}>{strategy.success}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tire Compounds</p>
                <div className="space-y-1">
                  {strategy.compounds.map((compound) => (
                    <Badge key={compound} variant="outline" className="text-xs mr-2">
                      {compound}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Pit Time</p>
                  <p className="font-medium text-foreground">{strategy.avgTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Best Conditions</p>
                  <p className="font-medium text-foreground text-sm">{strategy.conditions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
