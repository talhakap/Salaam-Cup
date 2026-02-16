import type { StandingsType } from "./schema";

export interface StandingsColumnDef {
  key: string;
  label: string;
  getValue: (s: { gamesPlayed: number; wins: number; losses: number; ties: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number; penaltyMinutes?: number }) => string | number;
}

const hockeyColumns: StandingsColumnDef[] = [
  { key: "gp", label: "GP", getValue: (s) => s.gamesPlayed },
  { key: "w", label: "W", getValue: (s) => s.wins },
  { key: "l", label: "L", getValue: (s) => s.losses },
  { key: "t", label: "T", getValue: (s) => s.ties },
  { key: "pts", label: "PTS", getValue: (s) => s.points },
  { key: "gf", label: "GF", getValue: (s) => s.goalsFor },
  { key: "ga", label: "GA", getValue: (s) => s.goalsAgainst },
  { key: "gd", label: "GD", getValue: (s) => { const d = s.goalDifference; return d > 0 ? `+${d}` : d; } },
  { key: "pim", label: "PIM", getValue: (s) => s.penaltyMinutes ?? 0 },
];

const soccerColumns: StandingsColumnDef[] = [
  { key: "gp", label: "GP", getValue: (s) => s.gamesPlayed },
  { key: "w", label: "W", getValue: (s) => s.wins },
  { key: "d", label: "D", getValue: (s) => s.ties },
  { key: "l", label: "L", getValue: (s) => s.losses },
  { key: "gf", label: "GF", getValue: (s) => s.goalsFor },
  { key: "ga", label: "GA", getValue: (s) => s.goalsAgainst },
  { key: "gd", label: "GD", getValue: (s) => { const d = s.goalDifference; return d > 0 ? `+${d}` : d; } },
  { key: "pts", label: "PTS", getValue: (s) => s.points },
];

const basketballColumns: StandingsColumnDef[] = [
  { key: "gp", label: "GP", getValue: (s) => s.gamesPlayed },
  { key: "w", label: "W", getValue: (s) => s.wins },
  { key: "l", label: "L", getValue: (s) => s.losses },
  { key: "pct", label: "WIN%", getValue: (s) => s.gamesPlayed > 0 ? (s.wins / s.gamesPlayed).toFixed(3) : ".000" },
  { key: "pf", label: "PF", getValue: (s) => s.goalsFor },
  { key: "pa", label: "PA", getValue: (s) => s.goalsAgainst },
  { key: "diff", label: "DIFF", getValue: (s) => { const d = s.goalDifference; return d > 0 ? `+${d}` : d; } },
];

const softballColumns: StandingsColumnDef[] = [
  { key: "gp", label: "GP", getValue: (s) => s.gamesPlayed },
  { key: "w", label: "W", getValue: (s) => s.wins },
  { key: "l", label: "L", getValue: (s) => s.losses },
  { key: "pct", label: "WIN%", getValue: (s) => s.gamesPlayed > 0 ? (s.wins / s.gamesPlayed).toFixed(3) : ".000" },
  { key: "rf", label: "RF", getValue: (s) => s.goalsFor },
  { key: "ra", label: "RA", getValue: (s) => s.goalsAgainst },
  { key: "diff", label: "DIFF", getValue: (s) => { const d = s.goalDifference; return d > 0 ? `+${d}` : d; } },
];

export function getStandingsColumns(type: StandingsType | string | null | undefined): StandingsColumnDef[] {
  switch (type) {
    case "soccer_standard":
      return soccerColumns;
    case "basketball_standard":
      return basketballColumns;
    case "softball_standard":
      return softballColumns;
    case "hockey_standard":
    default:
      return hockeyColumns;
  }
}
