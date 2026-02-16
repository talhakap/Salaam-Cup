import type { InsertStanding, StandingsAdjustment, StandingsType, Match } from "@shared/schema";

export interface StandingsStrategy {
  calculatePoints(wins: number, losses: number, ties: number): number;
  sortStandings(a: InsertStanding, b: InsertStanding): number;
  sortDivisionStandings?(standings: InsertStanding[], matches: Match[]): void;
}

function hockeyStandard(): StandingsStrategy {
  return {
    calculatePoints: (wins, _losses, ties) => wins * 2 + ties * 1,
    sortStandings: (a, b) => (b.points! - a.points!) || (b.goalDifference! - a.goalDifference!),
    sortDivisionStandings(divStandings: InsertStanding[], matches: Match[]) {
      divStandings.sort((a, b) => {
        const ptsDiff = b.points! - a.points!;
        if (ptsDiff !== 0) return ptsDiff;

        const tiedTeamIds = divStandings
          .filter(s => s.points === a.points)
          .map(s => s.teamId);

        if (tiedTeamIds.length === 2) {
          const h2h = getHeadToHead(a.teamId, b.teamId, matches);
          if (h2h !== 0) return h2h;
        }

        const gdDiff = b.goalDifference! - a.goalDifference!;
        if (gdDiff !== 0) return gdDiff;

        const gfDiff = b.goalsFor! - a.goalsFor!;
        if (gfDiff !== 0) return gfDiff;

        const pimDiff = (a.penaltyMinutes ?? 0) - (b.penaltyMinutes ?? 0);
        if (pimDiff !== 0) return pimDiff;

        return 0;
      });
    },
  };
}

function getHeadToHead(teamAId: number, teamBId: number, matches: Match[]): number {
  let aWins = 0;
  let bWins = 0;
  for (const m of matches) {
    if (m.status !== "final" || m.draft) continue;
    if (m.pulled || m.pulledHomeTeam || m.pulledAwayTeam) continue;
    const hId = Number(m.homeTeamId);
    const aId = Number(m.awayTeamId);
    const hs = m.homeScore ?? 0;
    const as_ = m.awayScore ?? 0;

    if (hId === teamAId && aId === teamBId) {
      if (hs > as_) aWins++;
      else if (as_ > hs) bWins++;
    } else if (hId === teamBId && aId === teamAId) {
      if (hs > as_) bWins++;
      else if (as_ > hs) aWins++;
    }
  }
  if (aWins > bWins) return -1;
  if (bWins > aWins) return 1;
  return 0;
}

function soccerStandard(): StandingsStrategy {
  return {
    calculatePoints: (wins, _losses, ties) => wins * 3 + ties * 1,
    sortStandings: (a, b) => (b.points! - a.points!) || (b.goalDifference! - a.goalDifference!),
  };
}

function basketballStandard(): StandingsStrategy {
  return {
    calculatePoints: (wins, _losses, _ties) => wins * 2,
    sortStandings: (a, b) => (b.points! - a.points!) || (b.goalDifference! - a.goalDifference!),
    sortDivisionStandings(divStandings: InsertStanding[], matches: Match[]) {
      divStandings.sort((a, b) => {
        const ptsDiff = b.points! - a.points!;
        if (ptsDiff !== 0) return ptsDiff;

        const tiedTeamIds = divStandings
          .filter(s => s.points === a.points)
          .map(s => s.teamId);

        if (tiedTeamIds.length === 2) {
          const h2h = getHeadToHead(a.teamId, b.teamId, matches);
          if (h2h !== 0) return h2h;
        }

        const pdDiff = b.goalDifference! - a.goalDifference!;
        if (pdDiff !== 0) return pdDiff;

        const pfDiff = b.goalsFor! - a.goalsFor!;
        if (pfDiff !== 0) return pfDiff;

        return 0;
      });
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
