"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DriverPersonality() {
  const drivers = [
    {
      name: "Max Verstappen",
      team: "Red Bull Racing",
      personality: "Aggressive & Calculated",
      traits: ["Aggressive overtaking", "Consistent", "Pressure resistant"],
      riskLevel: 85,
      consistency: 95,
      racecraft: 92,
    },
    {
      name: "Lando Norris",
      team: "McLaren",
      personality: "Smooth & Strategic",
      traits: ["Smooth driving", "Team player", "Qualifying specialist"],
      riskLevel: 65,
      consistency: 88,
      racecraft: 85,
    },
    {
      name: "Charles Leclerc",
      team: "Ferrari",
      personality: "Passionate & Fast",
      traits: ["Qualifying pace", "Emotional", "Wheel-to-wheel fighter"],
      riskLevel: 78,
      consistency: 82,
      racecraft: 88,
    },
    {
      name: "Lewis Hamilton",
      team: "Mercedes",
      personality: "Experienced & Tactical",
      traits: ["Race management", "Tire whisperer", "Clutch performer"],
      riskLevel: 70,
      consistency: 90,
      racecraft: 95,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Driver Personality Profiles</h2>
        <p className="text-muted-foreground">Behavioral analysis and driving style characteristics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drivers.map((driver) => (
          <Card key={driver.name} className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{driver.name}</CardTitle>
              <CardDescription>{driver.team}</CardDescription>
              <Badge variant="outline" className="w-fit mt-2">
                {driver.personality}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Key Traits</p>
                <div className="flex flex-wrap gap-2">
                  {driver.traits.map((trait) => (
                    <Badge key={trait} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span className="font-medium text-foreground">{driver.riskLevel}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${driver.riskLevel}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Consistency</span>
                    <span className="font-medium text-foreground">{driver.consistency}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${driver.consistency}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Racecraft</span>
                    <span className="font-medium text-foreground">{driver.racecraft}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-chart-3 h-2 rounded-full" style={{ width: `${driver.racecraft}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
