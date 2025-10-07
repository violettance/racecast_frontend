# Data Sources and Caching Policy

This app blends our analytics database (Neon/Postgres) with the official Ergast API.

## Policy by Season
- 2025 (live/ongoing season): use Ergast API for official standings and per-position results.
- 2018–2024 (completed seasons): use the database (`enhanced_dataset`) for analytics and standings.

## ConstructorPerformance
- Title grid cards:
  - Total Teams: DB (2018–2024), Ergast-derived only for 2025 if needed.
  - Unique Teams with Podiums: derived from the standings list shown below (kept consistent).
  - Total Races: DB DISTINCT rounds (2018–2024), Ergast P1 set count (2025).
  - Leading Team: Ergast official points (2025), DB computed points (2018–2024).
- Standings list:
  - 2025: Ergast constructorStandings + Ergast position-filtered results (P1/P2/P3) to compute wins and total podiums.
  - 2018–2024: DB CTE computes points/wins/podiums from `enhanced_dataset`.
- Team color badges: mapped via CSS utility classes in `app/globals.css`.

## DriverPerformance
- Header cards:
  - Total Drivers:
    - 2018–2024: DB (COUNT DISTINCT driver_id)
    - 2025: Ergast drivers list (fallback: unique drivers from results)
  - Surprise Performer (avg grid − finish):
    - 2018–2024: DB CTE over `enhanced_dataset`
    - 2025: Ergast results (all rounds), averaged per driver
  - Most Wins:
    - 2018–2024: DB CTE
    - 2025: Ergast driverStandings (wins)
  - Most Podiums:
    - 2018–2024: DB CTE (position BETWEEN 1 AND 3)
    - 2025: Ergast results, total P1+P2+P3 per driver
- Standings table:
  - 2018–2024: DB CTE computed standings.
  - 2025: Ergast driverStandings (points, nationality) with team color badges.

## Caching
- Completed seasons (DB):
  - `staleTime`: 10 minutes, `refetchOnWindowFocus`: false.
- Live season (2025, Ergast):
  - `staleTime`: 5 minutes, `refetchOnWindowFocus`: true.

## Deployment Notes
- Set `NEXT_PUBLIC_DATABASE_URL` in Vercel Project → Settings → Environment Variables.
- Ergast API requires no API key.
- For stricter security later, move DB reads to server routes to avoid exposing connection URL client-side.
