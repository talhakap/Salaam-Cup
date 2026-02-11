import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { useTournament, useDivisions } from "@/hooks/use-tournaments";
import { useMatches } from "@/hooks/use-matches";
import { useVenues } from "@/hooks/use-venues";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TournamentNav } from "@/components/TournamentNav";
import { Users } from "lucide-react";
import { useState, useMemo } from "react";
import type { Division, MatchWithTeams, Venue } from "@shared/schema";

export default function TournamentSchedule() {
  const [, params] = useRoute("/tournaments/:id/schedule");
  const tournamentId = Number(params?.id);

  const { data: tournament, isLoading } = useTournament(tournamentId);
  const { data: divisions } = useDivisions(tournamentId);
  const { data: allMatches } = useMatches(tournamentId);
  const { data: venues } = useVenues();

  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const uniqueDates = useMemo(() => {
    if (!allMatches) return [];
    const dates = new Set<string>();
    allMatches.forEach((m: MatchWithTeams) => {
      if (m.startTime) {
        dates.add(new Date(m.startTime).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }));
      }
    });
    return Array.from(dates).sort();
  }, [allMatches]);

  const filteredMatches = useMemo(() => {
    if (!allMatches) return [];
    return allMatches.filter((m: MatchWithTeams) => {
      if (filterDivision !== "all" && m.divisionId !== Number(filterDivision)) return false;
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (filterDate !== "all") {
        if (!m.startTime) return false;
        const mDate = new Date(m.startTime).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        if (mDate !== filterDate) return false;
      }
      return true;
    });
  }, [allMatches, filterDivision, filterDate, filterStatus]);

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
      <HeroSection title="Schedule" image={tournament.heroImage || undefined} size="small" />
      <SponsorBar />
      <TournamentNav tournamentId={tournamentId} />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-10" data-testid="text-find-game">
            Find Your Game
          </h2>

          <div className="flex gap-4 mb-10 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1 block">Division</label>
              <Select value={filterDivision} onValueChange={setFilterDivision}>
                <SelectTrigger data-testid="select-division-filter">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {divisions?.map((d: Division) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger data-testid="select-date-filter">
                  <SelectValue placeholder="Select Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  {uniqueDates.map((date) => (
                    <SelectItem key={date} value={date}>{date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredMatches.length > 0 ? (
            <div>
              {filteredMatches.map((m: MatchWithTeams) => (
                <ScheduleMatchRow key={m.id} match={m} divisions={divisions} venues={venues} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">No matches found with the selected filters.</p>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

function ScheduleMatchRow({ match, divisions, venues }: { match: MatchWithTeams; divisions?: Division[]; venues?: Venue[] }) {
  const matchDate = match.startTime ? new Date(match.startTime) : null;
  const isLive = match.status === "live";
  const isFinal = match.status === "final";
  const isScheduled = match.status === "scheduled";
  const division = divisions?.find(d => d.id === match.divisionId);

  return (
    <div className="flex items-center py-5 border-b gap-2 md:gap-4" data-testid={`schedule-match-${match.id}`}>
      <div className="w-28 md:w-36 shrink-0">
        {matchDate && (
          <>
            <div className="text-xs text-muted-foreground">
              {matchDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div className="text-xl md:text-2xl font-bold font-display text-foreground">
              {matchDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </>
        )}
        {(match.venueId || match.fieldLocation) && (
          <div className="text-xs text-muted-foreground">
            {match.venueId && venues ? venues.find(v => v.id === match.venueId)?.name : ""}
            {match.venueId && match.fieldLocation ? " - " : ""}
            {match.fieldLocation || ""}
          </div>
        )}
      </div>

      <div className="flex-1 text-right min-w-0">
        <Link href={match.homeTeam ? `/teams/${match.homeTeamId}` : "#"}>
          <div className="flex items-center justify-end gap-2">
            <span className="font-bold text-sm md:text-base hover:underline">{match.homeTeam?.name || "TBD"}</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              {match.homeTeam?.logoUrl ? (
                <img src={match.homeTeam.logoUrl} alt="" className="w-6 h-6 object-contain rounded-full" />
              ) : (
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </Link>
      </div>

      <div className="flex flex-col items-center shrink-0 px-3 md:px-6 min-w-[80px]">
        {division && <div className="text-[10px] text-muted-foreground mb-1">{division.name}</div>}
        <div className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl font-bold font-display">{isScheduled ? "-" : match.homeScore}</span>
          <span className="text-2xl md:text-3xl font-bold font-display">{isScheduled ? "-" : match.awayScore}</span>
        </div>
        <div className="mt-1">
          {isLive && <span className="text-xs font-bold text-red-500 uppercase">Live</span>}
          {isFinal && <span className="text-xs text-muted-foreground uppercase">Final</span>}
          {isScheduled && <span className="text-xs text-muted-foreground uppercase">Scheduled</span>}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <Link href={match.awayTeam ? `/teams/${match.awayTeamId}` : "#"}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              {match.awayTeam?.logoUrl ? (
                <img src={match.awayTeam.logoUrl} alt="" className="w-6 h-6 object-contain rounded-full" />
              ) : (
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">{match.awayTeam?.description || ""}</span>
              <span className="font-bold text-sm md:text-base hover:underline">{match.awayTeam?.name || "TBD"}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
