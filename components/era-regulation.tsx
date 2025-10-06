"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function EraRegulation() {
  const eras = [
    {
      year: "2018-2021",
      title: "Hybrid Era Dominance",
      regulations: "V6 Turbo Hybrid, DRS, High Downforce",
      dominantTeam: "Mercedes",
      avgWins: 15.2,
      characteristics: ["Mercedes dominance", "High downforce cars", "DRS overtaking"],
    },
    {
      year: "2022-2023",
      title: "Ground Effect Return",
      regulations: "New Aerodynamic Rules, 18-inch Wheels, Budget Cap",
      dominantTeam: "Red Bull Racing",
      avgWins: 17.5,
      characteristics: ["Ground effect aerodynamics", "Closer racing", "Red Bull dominance"],
    },
    {
      year: "2024-2025",
      title: "Competitive Balance",
      regulations: "Refined Ground Effect, Sprint Races, Sustainable Fuels",
      dominantTeam: "Red Bull Racing / McLaren",
      avgWins: 12.3,
      characteristics: ["Multiple race winners", "Closer championship", "McLaren resurgence"],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Era & Regulation Analysis</h2>
        <p className="text-muted-foreground">Performance trends across different F1 regulation periods (2018-2025)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Years Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">7</p>
            <p className="text-xs text-muted-foreground mt-1">2018 to 2025</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Regulation Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground mt-1">Major updates</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Races</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">156</p>
            <p className="text-xs text-muted-foreground mt-1">Across all eras</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {eras.map((era, index) => (
          <Card key={era.year} className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{era.year}</Badge>
                    <CardTitle className="text-xl">{era.title}</CardTitle>
                  </div>
                  <CardDescription>{era.regulations}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Dominant Team</p>
                  <p className="text-lg font-bold text-foreground">{era.dominantTeam}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Avg Wins per Season</p>
                  <p className="text-lg font-bold text-foreground">{era.avgWins}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Key Characteristics</p>
                  <div className="flex flex-wrap gap-2">
                    {era.characteristics.map((char) => (
                      <Badge key={char} variant="secondary" className="text-xs">
                        {char}
                      </Badge>
                    ))}
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
