"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, MapPin, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useRaceStore } from "@/lib/race-store"

export function RacePrediction() {
  const { 
    previousRace, 
    currentRace,
    nextRace, 
    raceState,
    fetchRaceData,
    getCacheStrategy
  } = useRaceStore()

  const cacheConfig = getCacheStrategy()
  const { data, isLoading, error } = useQuery({
    queryKey: ['raceData'],
    queryFn: fetchRaceData,
    ...cacheConfig,
  })


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Race Prediction Model</h2>
          <p className="text-muted-foreground">Loading race data...</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
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
        <p className="text-muted-foreground">Predictions based on 2018-2024 F1 data analysis</p>
      </div>

      {/* Race State Logic */}
      {raceState === 'NO_PREDICTIONS' && (
        <Card className="border-border shadow-sm bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-destructive" />
              {nextRace ? `Next Race: ${nextRace.name}` : "Upcoming Race"}
            </CardTitle>
            {nextRace && (
              <CardDescription className="mt-1">
                {nextRace.date} • {nextRace.country}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {nextRace ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <MapPin className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Circuit</p>
                      <p className="font-medium text-sm text-foreground">{nextRace.circuit || "TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <Clock className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Race Time (UTC)</p>
                      <p className="font-medium text-sm text-foreground">{nextRace.time || "TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <Trophy className="w-5 h-5 text-destructive" />
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
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming race information available</p>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-foreground mb-1">Prediction Pending</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This race prediction will be made after the qualifying session. Check back after qualifying to see our
                  top 5 predictions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {raceState === 'CURRENT_RACE' && currentRace && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-destructive" />
              Current Race: {currentRace.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {currentRace.date} • {currentRace.circuit}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
                <div className="col-span-5">Driver</div>
                <div className="col-span-4">Team</div>
                <div className="col-span-3">Prediction</div>
              </div>
              {currentRace.predictions?.map((item: any) => (
                <div
                  key={`${item.driverCode}-${item.position}`}
                  className="grid grid-cols-12 gap-4 items-center py-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-5 font-medium text-foreground">{item.driverName}</div>
                  <div className="col-span-4 text-sm text-muted-foreground">{item.teamName}</div>
                  <div className="col-span-3 text-sm">
                    <span className="text-foreground">P{item.position}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-4">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-foreground mb-1">Race Results Pending</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Race results will be available after the race is completed. Check back after the race to see our prediction accuracy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {raceState === 'PREVIOUS_RACE' && previousRace && (
        <>
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-destructive" />
                    Previous Race: {previousRace.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {previousRace.date} • {previousRace.circuit}
                  </CardDescription>
                </div>
                {previousRace.accuracy && (
                  <div className="flex gap-2">
                    <Badge className="text-sm bg-green-600 text-white border-green-600 hover:bg-green-700">
                      Top 3: {previousRace.accuracy.top3}%
                    </Badge>
                    <Badge className="text-sm bg-green-600 text-white border-green-600 hover:bg-green-700">
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
                {previousRace.predictions?.map((item: any) => (
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

          {/* Next Race Information */}
          {nextRace && (
            <Card className="border-border shadow-sm bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-destructive" />
                  Next Race: {nextRace.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {nextRace.date} • {nextRace.country}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <MapPin className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Circuit</p>
                      <p className="font-medium text-sm text-foreground">{nextRace.circuit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <Clock className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Race Time (UTC)</p>
                      <p className="font-medium text-sm text-foreground">{nextRace.time || "TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <Trophy className="w-5 h-5 text-destructive" />
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

                <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-foreground mb-1">Prediction Pending</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This race prediction will be made after the qualifying session. Check back after qualifying to see our
                      top 5 predictions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
