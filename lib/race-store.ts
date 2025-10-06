import { create } from 'zustand'

export interface PredictionRow {
  year: number
  round: number
  driver_code: string
  predicted_position?: number
  predicted_rank?: number
  grid?: number
  position: number
}

export interface ResultRow {
  year: number
  round: number
  driver_code: string
  position: number
}

export interface EnhancedRow {
  driver_id: string
  driver_first_name: string
  driver_last_name: string
  driver_nationality: string
  constructor_name?: string
  team?: string
  constructor?: string
}

export interface JoinedItem {
  position: number
  driverCode: string
  driverName: string
  teamName: string
  actualRank: number | undefined
}

export interface RaceInfo {
  name: string
  date: string
  circuit: string
  country?: string
  laps?: number
  distance?: string
  time?: string
  firstPractice?: string
  qualifying?: string
}

export interface RaceStore {
  // Loading states
  loading: boolean
  error: string | null
  
  // Data
  predictions: PredictionRow[]
  results: ResultRow[]
  enhancedDataset: EnhancedRow[]
  races: any[]
  
  // Processed data
  previousRace: {
    name: string
    date: string
    circuit: string
    predictions: JoinedItem[]
    accuracy?: { top3: number, top5: number }
  } | null
  
  nextRace: RaceInfo | null
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPredictions: (predictions: PredictionRow[]) => void
  setResults: (results: ResultRow[]) => void
  setEnhancedDataset: (enhancedDataset: EnhancedRow[]) => void
  setRaces: (races: any[]) => void
  setPreviousRace: (previousRace: any) => void
  setNextRace: (nextRace: RaceInfo | null) => void
  
  // Fetch data action
  fetchRaceData: () => Promise<void>
}

export const useRaceStore = create<RaceStore>((set, get) => ({
  // Initial state
  loading: true,
  error: null,
  predictions: [],
  results: [],
  enhancedDataset: [],
  races: [],
  previousRace: null,
  nextRace: null,
  
  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPredictions: (predictions) => set({ predictions }),
  setResults: (results) => set({ results }),
  setEnhancedDataset: (enhancedDataset) => set({ enhancedDataset }),
  setRaces: (races) => set({ races }),
  setPreviousRace: (previousRace) => set({ previousRace }),
  setNextRace: (nextRace) => set({ nextRace }),
  
  // Fetch data action
  fetchRaceData: async () => {
    // Import neonClient dynamically to avoid SSR issues
    const { neonClient } = await import('./neon-client')
    
    // Fetch all data in parallel
    const [preds, res, enh, raceResponse] = await Promise.all([
      neonClient.get<PredictionRow[]>("public.predictions", {
        order: "year.desc,round.desc,position.asc",
        limit: 100,
      }),
      neonClient.get<ResultRow[]>("public.results", {
        order: "year.desc,round.desc,position.asc",
        limit: 100,
      }),
      neonClient.get<EnhancedRow[]>("public.enhanced_dataset"),
      fetch('https://api.jolpi.ca/ergast/f1/2025/races').then(res => res.json())
    ])
    
    const races = raceResponse.MRData.RaceTable.Races
    
    // Update store with raw data
    set({ 
      predictions: preds, 
      results: res, 
      enhancedDataset: enh, 
      races 
    })
    
    // Process the data
    const latestYear = Math.max(...preds.map(p => p.year))
    const latestRound = Math.max(...preds.filter(p => p.year === latestYear).map(p => p.round))
    
    const predsForRound = preds.filter(p => p.year === latestYear && p.round === latestRound)
    const resForRound = res.filter(r => r.year === latestYear && r.round === latestRound)
    
    // Driver code mapping
    const driverCodeMap: Record<string, string> = {
      // Red Bull
      "max_verstappen": "VER", "verstappen": "VER", "max": "VER", "ver": "VER",
      "sergio_perez": "PER", "perez": "PER", "sergio": "PER", "per": "PER",
      // Ferrari
      "charles_leclerc": "LEC", "leclerc": "LEC", "charles": "LEC", "lec": "LEC",
      "carlos_sainz": "SAI", "sainz": "SAI", "carlos": "SAI", "sai": "SAI",
      // Mercedes
      "lewis_hamilton": "HAM", "hamilton": "HAM", "lewis": "HAM", "ham": "HAM",
      "george_russell": "RUS", "russell": "RUS", "george": "RUS", "rus": "RUS",
      // McLaren
      "lando_norris": "NOR", "norris": "NOR", "lando": "NOR", "nor": "NOR",
      "oscar_piastri": "PIA", "piastri": "PIA", "oscar": "PIA", "pia": "PIA",
      // Aston Martin
      "fernando_alonso": "ALO", "alonso": "ALO", "fernando": "ALO", "alo": "ALO",
      "lance_stroll": "STR", "stroll": "STR", "lance": "STR", "str": "STR",
      // Alpine
      "esteban_ocon": "OCO", "ocon": "OCO", "esteban": "OCO", "oco": "OCO",
      "pierre_gasly": "GAS", "gasly": "GAS", "pierre": "GAS", "gas": "GAS",
      // RB
      "yuki_tsunoda": "TSU", "tsunoda": "TSU", "yuki": "TSU", "tsu": "TSU",
      "daniel_ricciardo": "RIC", "ricciardo": "RIC", "daniel": "RIC", "ric": "RIC",
      // Sauber
      "valtteri_bottas": "BOT", "bottas": "BOT", "valtteri": "BOT", "bot": "BOT",
      "zhou_guanyu": "ZHO", "guanyu": "ZHO", "zhou": "ZHO", "zho": "ZHO",
      // Williams
      "alexander_albon": "ALB", "albon": "ALB", "alex": "ALB", "alb": "ALB",
      "logan_sargeant": "SAR", "sargeant": "SAR", "logan": "SAR", "sar": "SAR",
      // Haas
      "kevin_magnussen": "MAG", "magnussen": "MAG", "kevin": "MAG", "mag": "MAG",
      "nico_hulkenberg": "HUL", "hulkenberg": "HUL", "nico": "HUL", "hul": "HUL",
      // Yeni sürücüler
      "ollie_bearman": "BEA", "bearman": "BEA", "ollie": "BEA", "bea": "BEA",
      "kimi_antonelli": "ANT", "antonelli": "ANT", "kimi": "ANT", "ant": "ANT",
      // Eski grid
      "sebastian_vettel": "VET", "vettel": "VET", "vet": "VET",
      "kimi_raikkonen": "RAI", "raikkonen": "RAI", "rai": "RAI",
      "brendon_hartley": "HAR", "hartley": "HAR", "har": "HAR",
      "stoffel_vandoorne": "VAN", "vandoorne": "VAN", "van": "VAN",
      "romain_grosjean": "GRO", "grosjean": "GRO", "gro": "GRO",
      "nico_rosberg": "ROS", "rosberg": "ROS", "ros": "ROS",
      "felipe_massa": "MAS", "massa": "MAS", "mas": "MAS",
      "jenson_button": "BUT", "button": "BUT", "but": "BUT",
      "pascal_wehrlein": "WEH", "wehrlein": "WEH", "weh": "WEH",
      "marcus_ericsson": "ERI", "ericsson": "ERI", "eri": "ERI",
      "daniil_kvyat": "KVY", "kvyat": "KVY", "kvy": "KVY"
    }

    // Create name mapping from enhanced_dataset
    const nameMap = new Map<string, { driverName: string, teamName: string }>()
    enh.forEach(e => {
      // Map driver_id to driver_code using the mapping
      const driverCode = driverCodeMap[e.driver_id?.toLowerCase()] || e.driver_id?.toUpperCase()
      const driverName = e.driver_first_name && e.driver_last_name 
        ? `${e.driver_first_name} ${e.driver_last_name}`
        : e.driver_id || driverCode
      const teamName = e.constructor_name || e.team || e.constructor || ""
      
      if (driverCode) {
        nameMap.set(driverCode, { driverName, teamName })
      }
    })

    const joined: JoinedItem[] = predsForRound.map((p) => {
      const info = nameMap.get(p.driver_code) || { driverName: p.driver_code, teamName: "" }
      const actual = resForRound.find((r) => r.driver_code === p.driver_code)?.position
      const predicted = p.predicted_rank || p.grid || p.position || 0
      return {
        position: predicted,
        driverCode: p.driver_code,
        driverName: info.driverName,
        teamName: info.teamName,
        actualRank: actual,
      }
    })

    // Filter only top 5 with actual rank and sort by actual rank
    const top5WithActual = joined
      .filter(item => item.actualRank && item.actualRank <= 5)
      .sort((a, b) => (a.actualRank || 999) - (b.actualRank || 999))

    // Calculate accuracy: how many of our predictions were in the actual top finishers
    const top3Predictions = top5WithActual.slice(0, 3)
    const top5Predictions = top5WithActual.slice(0, 5)
    
    // Calculate accuracy: how many of our predictions were in the actual top finishers
    const calculateAccuracy = (predictions: typeof top5WithActual) => {
      if (predictions.length === 0) return 0
      
      let correctPredictions = 0
      predictions.forEach(pred => {
        const actualPos = pred.actualRank
        // Check if this prediction was in the actual top 3/5
        if (actualPos && actualPos <= 3) {
          correctPredictions++
        }
      })
      
      return Math.round((correctPredictions / predictions.length) * 100)
    }
    
    const top3Accuracy = calculateAccuracy(top3Predictions)
    const top5Accuracy = calculateAccuracy(top5Predictions)

    // Get race information for the latest round (18th race)
    const raceInfo = races[17] // 18th race (0-indexed)
    const raceName = raceInfo?.raceName || `Round ${latestRound} • ${latestYear}`
    const raceDate = raceInfo?.date || ""
    const circuitName = raceInfo?.Circuit?.circuitName || ""

    // Set next race (19th race)
    const nextRaceInfo = races[18] // 19th race (0-indexed)
    
    set({
      previousRace: {
        name: raceName,
        date: raceDate,
        circuit: circuitName,
        predictions: top5WithActual,
        accuracy: {
          top3: top3Accuracy,
          top5: top5Accuracy,
        },
      },
      nextRace: {
        name: nextRaceInfo?.raceName || "Next Race",
        date: nextRaceInfo?.date || "",
        circuit: nextRaceInfo?.Circuit?.circuitName || "",
        country: nextRaceInfo?.Circuit?.Location?.country || "",
        time: nextRaceInfo?.time || "",
        firstPractice: nextRaceInfo?.FirstPractice?.date || "",
        qualifying: nextRaceInfo?.Qualifying?.date || "",
      }
    })
    
        return
  }
}))
