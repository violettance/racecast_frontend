"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, CloudRain, Sun } from "lucide-react"

export function WeatherTrack() {
  const weatherImpact = [
    {
      condition: "Dry & Sunny",
      icon: Sun,
      impact: "Optimal",
      lapTimeDelta: "0s",
      tireWear: "Normal",
      overtaking: "Moderate",
      color: "text-yellow-500",
    },
    {
      condition: "Cloudy",
      icon: Cloud,
      impact: "Minimal",
      lapTimeDelta: "+0.2s",
      tireWear: "Reduced",
      overtaking: "Moderate",
      color: "text-gray-400",
    },
    {
      condition: "Light Rain",
      icon: CloudRain,
      impact: "Moderate",
      lapTimeDelta: "+3-5s",
      tireWear: "Low",
      overtaking: "High",
      color: "text-blue-400",
    },
    {
      condition: "Heavy Rain",
      icon: CloudRain,
      impact: "Severe",
      lapTimeDelta: "+8-12s",
      tireWear: "Very Low",
      overtaking: "Very High",
      color: "text-blue-600",
    },
  ]

  const trackCharacteristics = [
    {
      name: "Monaco",
      type: "Street Circuit",
      overtaking: "Very Low",
      tireStress: "Low",
      weatherSensitivity: "High",
      avgSpeed: "160 km/h",
    },
    {
      name: "Monza",
      type: "High Speed",
      overtaking: "High",
      tireStress: "Low",
      weatherSensitivity: "Low",
      avgSpeed: "264 km/h",
    },
    {
      name: "Silverstone",
      type: "Fast & Flowing",
      overtaking: "Moderate",
      tireStress: "High",
      weatherSensitivity: "Very High",
      avgSpeed: "233 km/h",
    },
    {
      name: "Singapore",
      type: "Street Circuit",
      overtaking: "Moderate",
      tireStress: "Very High",
      weatherSensitivity: "Moderate",
      avgSpeed: "172 km/h",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Weather & Track Analysis</h2>
        <p className="text-muted-foreground">Environmental factors and track characteristics impact</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tracks Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">24</p>
            <p className="text-xs text-muted-foreground mt-1">2024 calendar</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wet Races</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">18%</p>
            <p className="text-xs text-muted-foreground mt-1">Historical average</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">26°C</p>
            <p className="text-xs text-muted-foreground mt-1">Track temperature</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weather Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">High</p>
            <p className="text-xs text-muted-foreground mt-1">On race outcomes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Weather Condition Impact</CardTitle>
          <CardDescription>How different weather conditions affect race performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weatherImpact.map((weather) => {
              const Icon = weather.icon
              return (
                <div
                  key={weather.condition}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Icon className={`w-8 h-8 ${weather.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">{weather.condition}</h3>
                      <Badge variant={weather.impact === "Optimal" ? "default" : "secondary"}>{weather.impact}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Lap Time</p>
                        <p className="font-medium text-foreground">{weather.lapTimeDelta}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Tire Wear</p>
                        <p className="font-medium text-foreground">{weather.tireWear}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Overtaking</p>
                        <p className="font-medium text-foreground">{weather.overtaking}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Track Characteristics</CardTitle>
          <CardDescription>Key circuit features and their impact on racing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
              <div className="col-span-2">Track</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Overtaking</div>
              <div className="col-span-2">Tire Stress</div>
              <div className="col-span-2">Weather Sens.</div>
              <div className="col-span-2">Avg Speed</div>
            </div>
            {trackCharacteristics.map((track) => (
              <div
                key={track.name}
                className="grid grid-cols-12 gap-4 items-center py-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="col-span-2 font-medium text-foreground">{track.name}</div>
                <div className="col-span-2 text-sm text-muted-foreground">{track.type}</div>
                <div className="col-span-2">
                  <Badge variant="outline" className="text-xs">
                    {track.overtaking}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Badge variant="outline" className="text-xs">
                    {track.tireStress}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Badge variant="outline" className="text-xs">
                    {track.weatherSensitivity}
                  </Badge>
                </div>
                <div className="col-span-2 font-medium text-foreground">{track.avgSpeed}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
