"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getEraRegulationData } from "@/lib/era-analysis"
import { useQuery } from "@tanstack/react-query"

export function EraRegulation() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['era-regulation'],
    queryFn: getEraRegulationData,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Era & Regulation Analysis</h2>
          <p className="text-muted-foreground">Loading performance trends across different F1 regulation periods...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-3 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Era & Regulation Analysis</h2>
          <p className="text-muted-foreground">Error loading data</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Era & Regulation Analysis</h2>
        <p className="text-muted-foreground">Performance trends across different F1 regulation periods (2018-2024)</p>
      </div>

      {/* Era Comparison Metrics */}
      <div className="space-y-4">
        
        {data.era_comparisons && data.era_comparisons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.era_comparisons.map((comparison, index) => (
            <Card key={comparison.metric} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground text-center">
                  {comparison.description}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">2018-2021</div>
                      <div className="text-xl font-bold text-foreground">
                        {comparison.era_2018_2021.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">2022+</div>
                      <div className="text-xl font-bold text-foreground">
                        {comparison.era_2022_plus.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Change</div>
                    <div className={`text-lg font-bold ${
                      comparison.difference > 0 ? 'text-green-600' : 'text-destructive'
                    }`}>
                      {comparison.difference > 0 ? '+' : ''}{comparison.difference.toFixed(2)}
                      {comparison.percentage_change !== 0 && (
                        <span className="text-sm ml-2 opacity-75">
                          ({comparison.percentage_change > 0 ? '+' : ''}{comparison.percentage_change.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comparison.metric === 'avg_lap_time' && 
                        "Lap times got slightly slower after 2022 because ground-effect cars and 18-inch tires focused on closer racing instead of pure speed."}
                      {comparison.metric === 'avg_speed' && 
                        "Average speeds dropped a bit since 2022 as ground-effect aerodynamics reduced drag efficiency to improve raceability."}
                      {comparison.metric === 'position_gained' && 
                        "Overtaking became easier after 2022 because ground-effect cars could follow more closely with less dirty air."}
                      {comparison.metric === 'thermal_sensitivity' && 
                        "Cars became more temperature-sensitive after 2022 since the new tires and floor-driven downforce reacted more sharply to heat changes."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No era comparison data available</p>
          </div>
        )}
      </div>

      {/* Key Insights */}
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Key Insights</h3>
          <p className="text-muted-foreground">Major trends and changes across regulation periods</p>
        </div>
        
        {data.key_insights && data.key_insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.key_insights.map((insight, index) => (
            <Card key={index} className="border-border shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No key insights available</p>
          </div>
        )}
      </div>
    </div>
  )
}
