"use client"

import { useState } from "react"
import { Flag, Trophy, Users, TrendingUp, Brain, Gauge, CloudRain, ChevronRight } from "lucide-react"
import { RacePrediction } from "@/components/race-prediction"
import { DriverPerformance } from "@/components/driver-performance"
import { ConstructorPerformance } from "@/components/constructor-performance"
import { EraRegulation } from "@/components/era-regulation"
import { DriverPersonality } from "@/components/driver-personality"
import { RaceStrategyLab } from "@/components/race-strategy-lab"
import { WeatherTrack } from "@/components/weather-track"

type TabType = "race" | "driver" | "constructor" | "era" | "personality" | "strategy" | "weather"

export default function F1Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("race")

  const tabs = [
    {
      id: "race" as TabType,
      label: "Race Prediction Model",
      icon: Trophy,
      description: "Prediction & result comparison",
    },
    { id: "driver" as TabType, label: "Driver Performance", icon: Users, description: "Driver-based analysis" },
    { id: "constructor" as TabType, label: "Constructor Performance", icon: Flag, description: "Team-based analysis" },
    { id: "era" as TabType, label: "Era & Regulation", icon: TrendingUp, description: "2018–2025 period analysis" },
    {
      id: "personality" as TabType,
      label: "Driver Personality",
      icon: Brain,
      description: "Personality & behavior profile",
    },
    { id: "strategy" as TabType, label: "Race Strategy Lab", icon: Gauge, description: "Pit & tire strategies" },
    { id: "weather" as TabType, label: "Weather & Track", icon: CloudRain, description: "Weather conditions impact" },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border bg-card p-6 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Flag className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">F1 Predictor</h1>
              <p className="text-xs text-muted-foreground">2018-2025 Analysis</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left group ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    activeTab === tab.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm leading-tight mb-0.5">{tab.label}</div>
                  <div
                    className={`text-xs leading-tight ${
                      activeTab === tab.id ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
                {activeTab === tab.id && (
                  <ChevronRight className="w-4 h-4 text-primary-foreground flex-shrink-0 mt-1" />
                )}
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
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === "race" && <RacePrediction />}
          {activeTab === "driver" && <DriverPerformance />}
          {activeTab === "constructor" && <ConstructorPerformance />}
          {activeTab === "era" && <EraRegulation />}
          {activeTab === "personality" && <DriverPersonality />}
          {activeTab === "strategy" && <RaceStrategyLab />}
          {activeTab === "weather" && <WeatherTrack />}
        </div>
      </main>
    </div>
  )
}
