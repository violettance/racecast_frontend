"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, MapPin, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useRaceStore } from "@/lib/race-store"

export function RacePrediction() {
  const { 
    previousRace, 
    nextRace, 
    fetchRaceData 
  } = useRaceStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['raceData'],
    queryFn: fetchRaceData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Race Prediction Model</h2>
          <p className="text-muted-foreground">Loading race data...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Fetching predictions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Race Prediction Model</h2>
          <p className="text-muted-foreground">Error loading data</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">Error: {error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Race Prediction Model</h2>
        <p className="text-muted-foreground">AI-powered predictions based on 2018-2024 F1 data analysis</p>
      </div>

      {/* Previous Race Results */}
      {previousRace && (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Previous Race: {previousRace.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {previousRace.date} • {previousRace.circuit}
                    </CardDescription>
                  </div>
                  {previousRace.accuracy && (
                    <div className="flex gap-2">
                      <Badge className="text-sm bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                        Top 3: {previousRace.accuracy.top3}%
                      </Badge>
                      <Badge className="text-sm bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                        Top 5: {previousRace.accuracy.top5}%
                      </Badge>
                    </div>
                  )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
                <div className="col-span-5">Driver</div>
              <div className="col-span-4">Team</div>
              <div className="col-span-2">Prediction</div>
                <div className="col-span-1">Actual Rank</div>
            </div>
              {previousRace.predictions?.map((item: JoinedItem) => (
              <div
                  key={`${item.driverCode}-${item.position}`}
                className="grid grid-cols-12 gap-4 items-center py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                  <div className="col-span-5 font-medium text-foreground">{item.driverName}</div>
                  <div className="col-span-4 text-sm text-muted-foreground">{item.teamName}</div>
                  <div className="col-span-2 text-sm">
                    <span className="text-foreground">P{item.position}</span>
                  </div>
                  <div className="col-span-1 text-sm">
                    {item.actualRank ? (
                      <span className="text-foreground">P{item.actualRank}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

          {/* Next Race Information */}
          {nextRace && (
            <Card className="border-border shadow-sm bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Next Race: {nextRace.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {nextRace.date} • {nextRace.country}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Circuit</p>
                      <p className="font-medium text-sm text-foreground">{nextRace.circuit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Race Time (UTC)</p>
                      <p className="font-medium text-sm text-foreground">{nextRace.time || "TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <Trophy className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Days to Qualifying</p>
                      <p className="font-medium text-sm text-foreground">
                        {nextRace.qualifying ? 
                          (() => {
                            const today = new Date()
                            const qualifyingDate = new Date(nextRace.qualifying)
                            const diffTime = qualifyingDate.getTime() - today.getTime()
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            return diffDays > 0 ? `${diffDays} days` : "Today"
                          })() 
                          : "TBA"
                        }
                      </p>
                    </div>
                  </div>
                </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-foreground mb-1">Prediction Pending</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This race prediction will be made after the qualifying session. Check back after qualifying to see our
                AI-powered top 5 predictions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

    </div>
  )
}
