import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TournamentNav } from "@/components/TournamentNav";
import { useTournament } from "@/hooks/use-tournaments";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy } from "lucide-react";
import { SEO } from "@/components/SEO";
import type { PlayoffSettings, PlayoffMatchWithTeams, Division } from "@shared/schema";
import { cn } from "@/lib/utils";

function BracketMatchup({ match, isLast }: { match: PlayoffMatchWithTeams; isLast?: boolean }) {
  if (match.isBye) {
    return (
      <div className="border border-border rounded-md p-2 opacity-50 bg-card" data-testid={`bracket-match-bye-${match.id}`}>
        <div className="text-sm font-medium">{match.homeTeam?.name || match.awayTeam?.name || "TBD"}</div>
        <div className="text-xs text-muted-foreground">BYE</div>
      </div>
    );
  }

  const isFinal = match.status === "final";

  return (
    <div
      className={cn(
        "border border-border rounded-md bg-card overflow-hidden",
        isLast && isFinal && "ring-2 ring-primary"
      )}
      data-testid={`bracket-match-${match.id}`}
    >
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 border-b border-border",
        isFinal && match.winnerTeamId === match.homeTeamId && "bg-primary/5 font-bold"
      )}>
        {match.homeSeed && (
          <span className="text-xs text-muted-foreground w-5 text-right">{match.homeSeed}</span>
        )}
        <span className="text-sm flex-1 min-w-0 truncate">{match.homeTeam?.name || "TBD"}</span>
        <span className="text-sm font-mono w-6 text-center">{match.homeScore ?? "-"}</span>
      </div>
      <div className={cn(
        "flex items-center gap-2 px-3 py-2",
        isFinal && match.winnerTeamId === match.awayTeamId && "bg-primary/5 font-bold"
      )}>
        {match.awaySeed && (
          <span className="text-xs text-muted-foreground w-5 text-right">{match.awaySeed}</span>
        )}
        <span className="text-sm flex-1 min-w-0 truncate">{match.awayTeam?.name || "TBD"}</span>
        <span className="text-sm font-mono w-6 text-center">{match.awayScore ?? "-"}</span>
      </div>
    </div>
  );
}

function getRoundName(round: number, totalRounds: number): string {
  if (round === totalRounds) return "Final";
  if (round === totalRounds - 1) return "Semifinals";
  if (round === totalRounds - 2) return "Quarterfinals";
  return `Round ${round}`;
}

function DivisionBracket({ tournamentId, division }: { tournamentId: number; division: Division }) {
  const { data: settings } = useQuery<PlayoffSettings | null>({
    queryKey: [`/api/tournaments/${tournamentId}/divisions/${division.id}/playoffs/settings`],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/divisions/${division.id}/playoffs/settings`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: matches, isLoading } = useQuery<PlayoffMatchWithTeams[]>({
    queryKey: [`/api/tournaments/${tournamentId}/divisions/${division.id}/playoffs/matches`],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/divisions/${division.id}/playoffs/matches`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: settings?.showBracket === true && settings?.generated === true,
  });

  if (!settings?.showBracket || !settings?.generated) return null;
  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />;
  if (!matches || matches.length === 0) return null;

  const matchesByRound = matches.reduce<Record<number, PlayoffMatchWithTeams[]>>((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {});

  const totalRounds = Math.max(...Object.keys(matchesByRound).map(Number));
  const rounds = Object.entries(matchesByRound).sort(([a], [b]) => Number(a) - Number(b));

  const finalMatch = matchesByRound[totalRounds]?.[0];
  const champion = finalMatch?.winnerTeam;

  return (
    <div className="space-y-4" data-testid={`division-bracket-${division.id}`}>
      <h3 className="text-lg font-bold font-display">{division.name}</h3>

      {champion && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-md" data-testid="champion-banner">
          <Trophy className="h-6 w-6 text-primary" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Champion</p>
            <p className="text-lg font-bold font-display">{champion.name}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {rounds.map(([round, roundMatches]) => {
          const roundNum = Number(round);
          return (
            <div key={round} className="min-w-[200px] flex-shrink-0 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {getRoundName(roundNum, totalRounds)}
              </p>
              <div className="space-y-2" style={{ paddingTop: `${(Math.pow(2, roundNum - 1) - 1) * 24}px` }}>
                {roundMatches.map((match, i) => (
                  <div key={match.id} style={{ marginBottom: `${(Math.pow(2, roundNum) - 1) * 16}px` }}>
                    <BracketMatchup match={match} isLast={roundNum === totalRounds} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TournamentPlayoffs() {
  const params = useParams<{ id: string }>();
  const { data: tournament, isLoading } = useTournament(params.id || "");

  const { data: allSettings } = useQuery<PlayoffSettings[]>({
    queryKey: [`/api/tournaments/${params.id}/playoffs/settings`],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${params.id}/playoffs/settings`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!params.id,
  });

  const hasVisibleBrackets = (allSettings || []).some(s => s.showBracket && s.generated);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <>
      <SEO
        title={`${tournament.name} Playoffs | Salaam Cup`}
        description={`Playoff brackets for ${tournament.name} - Salaam Cup Toronto`}
      />
      <TournamentNav tournamentId={params.id!} />
      <div className="container mx-auto px-4 py-8 space-y-8" data-testid="tournament-playoffs-page">
        <div className="flex items-center gap-3 flex-wrap">
          <Trophy className="h-6 w-6" />
          <h1 className="text-2xl font-bold font-display">Playoffs</h1>
        </div>

        {!hasVisibleBrackets && (
          <div className="text-center py-12 text-muted-foreground" data-testid="no-brackets-message">
            Playoff brackets are not yet available for this tournament.
          </div>
        )}

        {tournament.divisions && tournament.divisions.map((div: Division) => (
          <DivisionBracket key={div.id} tournamentId={tournament.id} division={div} />
        ))}
      </div>
    </>
  );
}
