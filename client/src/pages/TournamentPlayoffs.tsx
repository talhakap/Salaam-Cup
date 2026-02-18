import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { ReadyToCompete } from "@/components/ReadyToCompete";
import { FAQSection } from "@/components/FAQSection";
import { useTournament, useDivisions } from "@/hooks/use-tournaments";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TournamentNav } from "@/components/TournamentNav";
import { Trophy, Loader2, MapPin, Clock, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Division, PlayoffSettings, PlayoffMatchWithTeams } from "@shared/schema";

function BracketMatchup({ match, isLast }: { match: PlayoffMatchWithTeams; isLast?: boolean }) {
  const byeTeam = match.homeTeam || match.awayTeam;
  if (match.isBye) {
    return (
      <div className="border border-border rounded-md p-2 opacity-50 bg-card" data-testid={`bracket-match-bye-${match.id}`}>
        <div className="flex items-center gap-2">
          {byeTeam?.logoUrl ? (
            <img src={byeTeam.logoUrl} alt="" className="w-5 h-5 object-contain rounded-full shrink-0" />
          ) : (
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm font-medium">{byeTeam?.name || "TBD"}</span>
        </div>
        <div className="text-xs text-muted-foreground ml-7">BYE</div>
      </div>
    );
  }

  const isFinal = match.status === "final";

  return (
    <div
      className={cn(
        "border border-border rounded-md bg-card",
        isLast && isFinal && "ring-2 ring-primary"
      )}
      data-testid={`bracket-match-${match.id}`}
    >
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 border-b border-border",
        isFinal && match.winnerTeamId === match.homeTeamId && "bg-primary/5 font-bold"
      )}>
        {match.homeSeed != null && (
          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{match.homeSeed}</span>
        )}
        {match.homeTeam?.logoUrl ? (
          <img src={match.homeTeam.logoUrl} alt="" className="w-5 h-5 object-contain rounded-full shrink-0" />
        ) : (
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm flex-1 min-w-0 truncate">{match.homeTeam?.name || "TBD"}</span>
        <span className="text-sm font-mono w-6 text-center">{match.homeScore ?? "-"}</span>
      </div>
      <div className={cn(
        "flex items-center gap-2 px-3 py-2",
        isFinal && match.winnerTeamId === match.awayTeamId && "bg-primary/5 font-bold",
        (match.startTime || match.venue || match.fieldLocation) ? "" : "rounded-b-md"
      )}>
        {match.awaySeed != null && (
          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{match.awaySeed}</span>
        )}
        {match.awayTeam?.logoUrl ? (
          <img src={match.awayTeam.logoUrl} alt="" className="w-5 h-5 object-contain rounded-full shrink-0" />
        ) : (
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm flex-1 min-w-0 truncate">{match.awayTeam?.name || "TBD"}</span>
        <span className="text-sm font-mono w-6 text-center">{match.awayScore ?? "-"}</span>
      </div>
      {(match.startTime || match.venue || match.fieldLocation) && (
        <div className="px-3 py-1.5 border-t border-border bg-muted/30 rounded-b-md" data-testid={`bracket-match-info-${match.id}`}>
          <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
            {match.startTime && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {format(new Date(match.startTime), "MMM d, h:mm a")}
              </span>
            )}
            {(match.venue || match.fieldLocation) && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" />
                {[match.venue?.name, match.fieldLocation].filter(Boolean).join(" — ")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getRoundName(round: number, totalRounds: number): string {
  if (round === totalRounds) return "Final";
  if (round === totalRounds - 1) return "Semifinals";
  if (round === totalRounds - 2) return "Quarterfinals";
  return `Round ${round}`;
}

function DivisionBracket({ tournamentId, divisionId }: { tournamentId: number; divisionId: string }) {
  const { data: settings } = useQuery<PlayoffSettings | null>({
    queryKey: ['/api/tournaments', tournamentId, 'divisions', divisionId, 'playoffs', 'settings'],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/divisions/${divisionId}/playoffs/settings`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: matches, isLoading } = useQuery<PlayoffMatchWithTeams[]>({
    queryKey: ['/api/tournaments', tournamentId, 'divisions', divisionId, 'playoffs', 'matches'],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/divisions/${divisionId}/playoffs/matches`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: settings?.showBracket === true && settings?.generated === true,
  });

  if (!settings?.showBracket || !settings?.generated) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="no-bracket-division">
        Playoff bracket is not yet available for this division.
      </div>
    );
  }

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />;
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No playoff matches have been generated yet.
      </div>
    );
  }

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
    <div className="space-y-6" data-testid={`division-bracket-${divisionId}`}>
      {champion && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-md" data-testid="champion-banner">
          <Trophy className="h-6 w-6 text-primary shrink-0" />
          {champion.logoUrl ? (
            <img src={champion.logoUrl} alt="" className="w-8 h-8 object-contain rounded-full shrink-0" />
          ) : (
            <Users className="h-6 w-6 text-muted-foreground shrink-0" />
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Champion</p>
            <p className="text-lg font-bold font-display">{champion.name}</p>
          </div>
        </div>
      )}

      <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
        {rounds.map(([round, roundMatches]) => {
          const roundNum = Number(round);
          return (
            <div key={round} className="min-w-[200px] flex-shrink-0 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {getRoundName(roundNum, totalRounds)}
              </p>
              <div className="space-y-2" style={{ paddingTop: `${(Math.pow(2, roundNum - 1) - 1) * 24}px` }}>
                {roundMatches.map((match) => (
                  <div key={match.id} style={{ marginBottom: `${(Math.pow(2, roundNum) - 1) * 16}px` }}>
                    <BracketMatchup match={match} isLast={roundNum === totalRounds} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="md:hidden space-y-6">
        {rounds.map(([round, roundMatches]) => {
          const roundNum = Number(round);
          return (
            <div key={round} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-1">
                {getRoundName(roundNum, totalRounds)}
              </p>
              <div className="space-y-2">
                {roundMatches.map((match) => (
                  <BracketMatchup key={match.id} match={match} isLast={roundNum === totalRounds} />
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
  const [, params] = useRoute("/tournaments/:id/playoffs");
  const tournamentSlug = params?.id || "";

  const { data: tournament, isLoading } = useTournament(tournamentSlug);
  const numericId = tournament?.id || 0;
  const { data: divisions } = useDivisions(numericId);

  const divisionTabs = divisions?.map((d: Division) => ({ id: String(d.id), label: d.name })) || [];
  const [selectedDivision, setSelectedDivision] = useState<string>("");

  useEffect(() => {
    if (selectedDivision === "" && divisionTabs.length > 0) {
      setSelectedDivision(divisionTabs[0].id);
    }
  }, [divisionTabs, selectedDivision]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-[45vh] bg-muted animate-pulse" />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!tournament) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold font-display mb-4">Tournament Not Found</h1>
          <Link href="/tournaments">
            <Button data-testid="link-back-tournaments">Back to Tournaments</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO
        title={`${tournament.name} Playoffs | Salaam Cup`}
        description={`Playoff brackets for ${tournament.name} - Salaam Cup Toronto. View matchups, scores and champions.`}
        canonical={`/tournaments/${tournamentSlug}/playoffs`}
        keywords={`${tournament.name} playoffs, tournament bracket Toronto, Salaam Cup playoffs GTA`}
      />
      <HeroSection
        title={tournament.name.replace("Salaam Cup ", "").toUpperCase()}
        image={tournament.heroImage || undefined}
      />
      <SponsorBar />
      <TournamentNav tournamentId={tournamentSlug} />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-10" data-testid="text-playoff-heading">
            Road To The Championship.
          </h2>

          {divisionTabs.length > 0 && (
            <div className="flex justify-center mb-10">
              <div className="flex gap-2 flex-wrap justify-center">
                {divisionTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={selectedDivision === tab.id ? "default" : "outline"}
                    className="rounded-full text-xs font-bold uppercase tracking-wider"
                    onClick={() => setSelectedDivision(tab.id)}
                    data-testid={`filter-playoff-division-${tab.id}`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedDivision && numericId ? (
            <DivisionBracket tournamentId={numericId} divisionId={selectedDivision} />
          ) : (
            <p className="text-muted-foreground text-center py-12">Select a division to view the playoff bracket.</p>
          )}
        </div>
      </section>

      <ReadyToCompete />
      <FAQSection />
    </MainLayout>
  );
}
