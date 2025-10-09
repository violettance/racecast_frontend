"use client"

import { useEffect, useState } from "react"
import { Flag, Trophy, Users, TrendingUp, Brain, Gauge, ChevronRight } from "lucide-react"
import { RacePrediction } from "@/components/race-prediction"
import { DriverPerformance } from "@/components/driver-performance"
import { ConstructorPerformance } from "@/components/constructor-performance"
import { EraRegulation } from "@/components/era-regulation"
import { DriverPersonality } from "@/components/driver-personality"
import { WinningTrends } from "@/components/winning-trends"

type TabType = "race" | "driver" | "constructor" | "era" | "personality" | "strategy"

export default function F1Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("race")
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null)

  // Use Logo.dev domain logo endpoint directly with public token
  useEffect(() => {
    // Prefer official domain; Retina asset for sharper display
    const domain = 'formula1.com'
    setBrandLogoUrl(`https://img.logo.dev/${domain}?token=pk_TcV1-R1UT7m7s6fMUSCpWA&size=300&format=png&retina=true`)
  }, [])

  const tabs = [
    {
      id: "race" as TabType,
      label: "Race Prediction",
      icon: Trophy,
      description: "Prediction model",
    },
    { id: "driver" as TabType, label: "Driver Performance", icon: Users, description: "Driver-based analysis" },
    { id: "constructor" as TabType, label: "Team Performance", icon: Flag, description: "Team-based analysis" },
    { id: "strategy" as TabType, label: "Winning Trends", icon: Gauge, description: "Driver & team performance trends" },
    { id: "era" as TabType, label: "Era & Regulation", icon: TrendingUp, description: "2018–2024 period analysis" },
    {
      id: "personality" as TabType,
      label: "Driver Personality",
      icon: Brain,
      description: "Personality profile",
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 border-r border-border bg-card p-6 flex flex-col overflow-hidden z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {brandLogoUrl ? (
              <img src={brandLogoUrl} alt="Formula 1" className="h-12 w-auto max-w-40 rounded-lg object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-muted">
                <Flag className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-base font-medium text-foreground">RaceCast Dashboard</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left group ${
                  activeTab === tab.id ? "bg-muted text-foreground" : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    activeTab === tab.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm leading-tight mb-0.5">{tab.label}</div>
                  <div
                    className={`text-xs leading-tight ${
                      activeTab === tab.id ? "text-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-foreground flex-shrink-0 mt-1" />}
              </button>
            )
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Model Version</p>
            <p>v2.4.1 • Updated 2025</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto ml-72">
        <div className="p-8">
          {activeTab === "race" && <RacePrediction />}
          {activeTab === "driver" && <DriverPerformance />}
          {activeTab === "constructor" && <ConstructorPerformance />}
          {activeTab === "era" && <EraRegulation />}
          {activeTab === "personality" && <DriverPersonality />}
          {activeTab === "strategy" && <WinningTrends />}
        </div>
      </main>
    </div>
  )
}
