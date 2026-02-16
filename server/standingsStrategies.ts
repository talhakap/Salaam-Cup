import type { InsertStanding, StandingsAdjustment, StandingsType } from "@shared/schema";

export interface StandingsStrategy {
  calculatePoints(wins: number, losses: number, ties: number): number;
  sortStandings(a: InsertStanding, b: InsertStanding): number;
}

function hockeyStandard(): StandingsStrategy {
  return {
    calculatePoints: (wins, _losses, ties) => wins * 2 + ties * 1,
    sortStandings: (a, b) => (b.points! - a.points!) || (b.goalDifference! - a.goalDifference!),
  };
}

function soccerStandard(): StandingsStrategy {
  return {
    calculatePoints: (wins, _losses, ties) => wins * 3 + ties * 1,
    sortStandings: (a, b) => (b.points! - a.points!) || (b.goalDifference! - a.goalDifference!),
  };
}

function basketballStandard(): StandingsStrategy {
  return {
    calculatePoints: (wins, _losses, _ties) => wins,
    sortStandings: (a, b) => {
      const aPct = a.gamesPlayed! > 0 ? a.wins! / a.gamesPlayed! : 0;
      const bPct = b.gamesPlayed! > 0 ? b.wins! / b.gamesPlayed! : 0;
      return (bPct - aPct) || (b.goalDifference! - a.goalDifference!);
    },
  };
}

function softballStandard(): StandingsStrategy {
  return {
    calculatePoints: (wins, _losses, _ties) => wins,
    sortStandings: (a, b) => {
      const aPct = a.gamesPlayed! > 0 ? a.wins! / a.gamesPlayed! : 0;
      const bPct = b.gamesPlayed! > 0 ? b.wins! / b.gamesPlayed! : 0;
      return (bPct - aPct) || (b.goalDifference! - a.goalDifference!);
    },
  };
}

export function getStrategy(type: StandingsType | string | null | undefined): StandingsStrategy {
  switch (type) {
    case "soccer_standard":
      return soccerStandard();
    case "basketball_standard":
      return basketballStandard();
    case "softball_standard":
      return softballStandard();
    case "hockey_standard":
    default:
      return hockeyStandard();
  }
}

export function applyAdjustments(
  standing: InsertStanding,
  adjustment: StandingsAdjustment | undefined,
  strategy: StandingsStrategy
): InsertStanding {
  if (!adjustment) return standing;
  const adjWins = standing.wins! + adjustment.winsAdjustment;
  const adjLosses = standing.losses! + adjustment.lossesAdjustment;
  const adjTies = standing.ties! + adjustment.tiesAdjustment;
  const adjGF = standing.goalsFor! + adjustment.goalsForAdjustment;
  const adjGA = standing.goalsAgainst! + adjustment.goalsAgainstAdjustment;
  const recalcPoints = strategy.calculatePoints(adjWins, adjLosses, adjTies) + adjustment.pointsAdjustment;
  return {
    ...standing,
    gamesPlayed: adjWins + adjLosses + adjTies,
    wins: adjWins,
    losses: adjLosses,
    ties: adjTies,
    goalsFor: adjGF,
    goalsAgainst: adjGA,
    goalDifference: adjGF - adjGA,
    points: recalcPoints,
  };
}

export interface ColumnConfig {
  key: string;
  label: string;
  getValue: (s: InsertStanding) => string | number;
}

export function getColumnConfig(_type: StandingsType | string | null | undefined): ColumnConfig[] {
  return [
    { key: "gp", label: "GP", getValue: (s) => s.gamesPlayed! },
    { key: "w", label: "W", getValue: (s) => s.wins! },
    { key: "l", label: "L", getValue: (s) => s.losses! },
    { key: "t", label: "T", getValue: (s) => s.ties! },
    { key: "gf", label: "GF", getValue: (s) => s.goalsFor! },
    { key: "ga", label: "GA", getValue: (s) => s.goalsAgainst! },
    { key: "gd", label: "GD", getValue: (s) => { const d = s.goalDifference!; return d > 0 ? `+${d}` : d; } },
    { key: "pts", label: "PTS", getValue: (s) => s.points! },
  ];
}
