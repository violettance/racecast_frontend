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
  year: number
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
  selectedYear: number | null
  
  // Winning Trends state
  selectedDriver: string
  selectedConstructor: string
  
  // Driver Personality hover state
  hoveredArchetype: string | null
  
  // Processed data
  previousRace: {
    name: string
    date: string
    circuit: string
    predictions: JoinedItem[]
    accuracy?: { top3: number; top5: number }
  } | null
  
  currentRace: {
    name: string
    date: string
    circuit: string
    predictions: JoinedItem[]
  } | null
  
  nextRace: RaceInfo | null
  
  // Race state
  raceState: 'NO_PREDICTIONS' | 'CURRENT_RACE' | 'PREVIOUS_RACE'
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPredictions: (predictions: PredictionRow[]) => void
  setResults: (results: ResultRow[]) => void
  setEnhancedDataset: (enhancedDataset: EnhancedRow[]) => void
  setRaces: (races: any[]) => void
  setPreviousRace: (previousRace: any) => void
  setCurrentRace: (currentRace: any) => void
  setNextRace: (nextRace: RaceInfo | null) => void
  setSelectedYear: (year: number | null) => void
  setSelectedDriver: (driver: string) => void
  setSelectedConstructor: (constructor: string) => void
  setHoveredArchetype: (archetype: string | null) => void
  setRaceState: (raceState: 'NO_PREDICTIONS' | 'CURRENT_RACE' | 'PREVIOUS_RACE') => void
  
  // Fetch data action
  fetchRaceData: () => Promise<{ success: boolean }>
  
  // Smart cache strategy
  getCacheStrategy: () => { staleTime: number; refetchInterval: number | false; refetchOnWindowFocus: boolean }
}

export const useRaceStore = create<RaceStore>((set, get) => ({
  // Initial state
  loading: true,
  error: null,
  predictions: [],
  results: [],
  enhancedDataset: [],
  races: [],
  selectedYear: null,
  selectedDriver: "max_verstappen",
  selectedConstructor: "red_bull",
  hoveredArchetype: null,
  previousRace: null,
  currentRace: null,
  nextRace: null,
  raceState: 'NO_PREDICTIONS',
  
  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPredictions: (predictions) => set({ predictions }),
  setResults: (results) => set({ results }),
  setEnhancedDataset: (enhancedDataset) => set({ enhancedDataset }),
  setRaces: (races) => set({ races }),
  setPreviousRace: (previousRace) => set({ previousRace }),
  setCurrentRace: (currentRace) => set({ currentRace }),
  setNextRace: (nextRace) => set({ nextRace }),
  setSelectedYear: (year) => set({ selectedYear: year }),
  setSelectedDriver: (driver) => set({ selectedDriver: driver }),
  setSelectedConstructor: (constructor) => set({ selectedConstructor: constructor }),
  setHoveredArchetype: (archetype) => set({ hoveredArchetype: archetype }),
  setRaceState: (raceState) => set({ raceState }),
  
  // Smart cache strategy based on race calendar
  getCacheStrategy: () => {
    const { races } = get()
    const today = new Date()
    
    if (races.length === 0) {
      // No race data yet, use longer cache to avoid repeated calls
      return {
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: false,
        refetchOnWindowFocus: false
      }
    }
    
    // Find next race
    const nextRace = races.find(race => new Date(race.date) > today)
    
    if (!nextRace) {
      // Season ended, long cache
      return {
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        refetchInterval: false,
        refetchOnWindowFocus: false
      }
    }
    
    const daysToNextRace = Math.ceil((new Date(nextRace.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysToNextRace <= 2) {
      // Race weekend, frequent updates
      return {
        staleTime: 3 * 60 * 1000, // 3 minutes
        refetchInterval: 15 * 60 * 1000, // 15 minutes
        refetchOnWindowFocus: true
      }
    } else {
      // Normal days, longer cache
      return {
        staleTime: 30 * 60 * 1000, // 30 minutes
        refetchInterval: false,
        refetchOnWindowFocus: false
      }
    }
  },
  
  // Fetch data action
  fetchRaceData: async () => {
    try {
      // Fetch data from API endpoints instead of direct database access
      const [predsResponse, resResponse, racesResponse, enhResponse] = await Promise.all([
        fetch('/api/race-prediction?type=predictions').then(res => res.json()),
        fetch('/api/race-prediction?type=results').then(res => res.json()),
        fetch('/api/race-prediction?type=races').then(res => res.json()),
        fetch('/api/race-prediction?type=enhanced_dataset').then(res => res.json())
      ])
      
      const preds = predsResponse.data as PredictionRow[]
      const res = resResponse.data as ResultRow[]
      const races = racesResponse.data
      const enh = enhResponse.data as EnhancedRow[]
    
    // Update store with raw data
    set({ 
      predictions: preds, 
      results: res, 
      enhancedDataset: enh, 
      races 
    })
    
    // Process the data
    const latestYear = Math.max(...preds.map(p => p.year))
    const allRounds = preds.filter(p => p.year === latestYear).map(p => p.round)
    const currentRound = allRounds.length > 0 ? Math.max(...allRounds) : 0
    
    const currentPreds = preds.filter(p => p.year === latestYear && p.round === currentRound)
    const currentResults = res.filter(r => r.year === latestYear && r.round === currentRound)
    
    const hasCurrentPredictions = currentPreds.length > 0
    const hasCurrentResults = currentResults.length > 0
    
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

    // Determine race state
    let raceState: 'NO_PREDICTIONS' | 'CURRENT_RACE' | 'PREVIOUS_RACE' = 'NO_PREDICTIONS'
    let previousRace = null
    let currentRace = null
    
    if (!hasCurrentPredictions && !hasCurrentResults) {
      raceState = 'NO_PREDICTIONS'
    } else if (hasCurrentPredictions && !hasCurrentResults) {
      raceState = 'CURRENT_RACE'
      
      // Create current race data
      const joined: JoinedItem[] = currentPreds.map((p) => {
        const info = nameMap.get(p.driver_code) || { driverName: p.driver_code, teamName: "" }
        const predicted = p.predicted_rank || p.grid || p.position || 0
        return {
          position: predicted,
          driverCode: p.driver_code,
          driverName: info.driverName,
          teamName: info.teamName,
          actualRank: undefined,
        }
      })
      
      const raceInfo = races[currentRound - 1] // 0-indexed
      currentRace = {
        name: raceInfo?.raceName || `Round ${currentRound}`,
        date: raceInfo?.date || "",
        circuit: raceInfo?.Circuit?.circuitName || "",
        predictions: joined.slice(0, 5), // Top 5 predictions
      }
    } else if (hasCurrentPredictions && hasCurrentResults) {
      raceState = 'PREVIOUS_RACE'
      
      // Create previous race data with accuracy
      const joined: JoinedItem[] = currentPreds.map((p) => {
        const info = nameMap.get(p.driver_code) || { driverName: p.driver_code, teamName: "" }
        const actual = currentResults.find((r) => r.driver_code === p.driver_code)?.position
        const predicted = p.predicted_rank || p.grid || p.position || 0
        return {
          position: predicted,
          driverCode: p.driver_code,
          driverName: info.driverName,
          teamName: info.teamName,
          actualRank: actual,
        }
      })

      // Sort by our predictions (position), not by actual rank
      const sortedByPredictions = joined
        .filter(item => item.actualRank) // Only include drivers with actual results
        .sort((a, b) => a.position - b.position) // Sort by our prediction order

      // Calculate accuracy - how many of our top predictions were correct
      const calculateTop3Accuracy = (predictions: typeof sortedByPredictions) => {
        if (predictions.length === 0) return 0
        
        let correctPredictions = 0
        const top3Predictions = predictions.slice(0, 3) // Our top 3 predictions
        
        top3Predictions.forEach(pred => {
          const actualPos = pred.actualRank
          if (actualPos && actualPos <= 3) {
            correctPredictions++
          }
        })
        
        return Math.round((correctPredictions / top3Predictions.length) * 100)
      }
      
      const calculateTop5Accuracy = (predictions: typeof sortedByPredictions) => {
        if (predictions.length === 0) return 0
        
        let correctPredictions = 0
        const top5Predictions = predictions.slice(0, 5) // Our top 5 predictions
        
        top5Predictions.forEach(pred => {
          const actualPos = pred.actualRank
          if (actualPos && actualPos <= 5) {
            correctPredictions++
          }
        })
        
        return Math.round((correctPredictions / top5Predictions.length) * 100)
      }
      
      const top3Accuracy = calculateTop3Accuracy(sortedByPredictions)
      const top5Accuracy = calculateTop5Accuracy(sortedByPredictions)
      
      // For display: show actual top 5 finishers with their predictions
      const top5ForDisplay = joined
        .filter(item => item.actualRank && item.actualRank <= 5) // Only actual top 5 finishers
        .sort((a, b) => (a.actualRank || 999) - (b.actualRank || 999)) // Sort by actual rank
      
      const raceInfo = races[currentRound - 1] // 0-indexed
      previousRace = {
        name: raceInfo?.raceName || `Round ${currentRound}`,
        date: raceInfo?.date || "",
        circuit: raceInfo?.Circuit?.circuitName || "",
        predictions: top5ForDisplay,
        accuracy: {
          top3: top3Accuracy,
          top5: top5Accuracy,
        },
      }
    }

    // Set next race (only if not last race of season)
    const nextRaceInfo = races[currentRound] // Next race (0-indexed)
    const isLastRace = currentRound === races.length
    
    set({
      raceState,
      previousRace,
      currentRace,
      nextRace: !isLastRace ? {
        name: nextRaceInfo?.raceName || "Next Race",
        date: nextRaceInfo?.date || "",
        circuit: nextRaceInfo?.Circuit?.circuitName || "",
        country: nextRaceInfo?.Circuit?.Location?.country || "",
        time: nextRaceInfo?.time || "",
        firstPractice: nextRaceInfo?.FirstPractice?.date || "",
        qualifying: nextRaceInfo?.Qualifying?.date || "",
      } : null
    })
    
    return { success: true }
    } catch (error) {
      console.error('Error fetching race data:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
      return { success: false }
    }
  }
}))
