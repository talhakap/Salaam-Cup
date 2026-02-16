import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { ReadyToCompete } from "@/components/ReadyToCompete";
import { FAQSection } from "@/components/FAQSection";
import { TournamentNewsBanner } from "@/components/TournamentNewsBanner";
import { TournamentSponsorBanner } from "@/components/TournamentSponsorBanner";
import { useTournament, useDivisions } from "@/hooks/use-tournaments";
import { useTournamentSponsors } from "@/hooks/use-tournament-sponsors";
import { useTeams } from "@/hooks/use-teams";
import { useMatches } from "@/hooks/use-matches";
import { useVenues } from "@/hooks/use-venues";
import { useStandings } from "@/hooks/use-standings";
import { useNews } from "@/hooks/use-news";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TournamentNav } from "@/components/TournamentNav";
import { Users, ArrowRight, Trophy, Clock, MapPin, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { Division, Team, StandingWithTeam, MatchWithTeams, Venue, PlayoffSettings, PlayoffMatchWithTeams } from "@shared/schema";
import { getStandingsColumns } from "@shared/standingsConfig";

export default function TournamentDetail() {
  const [, params] = useRoute("/tournaments/:id");
  const tournamentSlug = params?.id || "";

  const { data: tournament, isLoading } = useTournament(tournamentSlug);
  const numericId = tournament?.id || 0;
  const { data: divisions } = useDivisions(numericId);
  const { data: allTeams } = useTeams(numericId);
  const { data: allMatches, isLoading: matchesLoading } = useMatches(numericId);
  const { data: venues } = useVenues();
  const { data: allStandings, isLoading: standingsLoading } = useStandings(numericId);
  const { data: allNews } = useNews();
  const { data: tournamentSponsorsList } = useTournamentSponsors(numericId);

  const tournamentNews = useMemo(() => {
    if (!allNews || !numericId) return [];
    return allNews.filter((n) => Number(n.tournamentId) === Number(numericId));
  }, [allNews, numericId]);

  const divisionTabsReady = divisions?.map((d: Division) => ({ id: String(d.id), label: d.name })) || [];
  const [selectedDivision, setSelectedDivision] = useState<string>("");

  useEffect(() => {
    if (selectedDivision === "" && divisionTabsReady.length > 0) {
      setSelectedDivision(divisionTabsReady[0].id);
    }
  }, [divisionTabsReady, selectedDivision]);

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

  const filteredMatches = (allMatches || [])
    .filter((m: MatchWithTeams) => m.divisionId === Number(selectedDivision))
    .sort((a: MatchWithTeams, b: MatchWithTeams) => {
      const statusOrder: Record<string, number> = { live: 0, scheduled: 1, final: 2, cancelled: 3 };
      const sa = statusOrder[a.status] ?? 1;
      const sb = statusOrder[b.status] ?? 1;
      if (sa !== sb) return sa - sb;
      const timeA = a.startTime ? new Date(a.startTime).getTime() : Infinity;
      const timeB = b.startTime ? new Date(b.startTime).getTime() : Infinity;
      return timeA - timeB;
    })
    .slice(0, 4);

  const filteredStandings = (allStandings || [])
    .filter((s: StandingWithTeam) => s.divisionId === Number(selectedDivision))
    .sort((a: StandingWithTeam, b: StandingWithTeam) => (a.position || 0) - (b.position || 0))
    .slice(0, 7);

  const filteredTeams = (allTeams || [])
    .filter((t: Team) => t.status === "approved")
    .filter((t: Team) => t.divisionId === Number(selectedDivision));

  const sortedTeams = [...filteredTeams].sort((a: Team, b: Team) => {
    if (a.paymentStatus !== b.paymentStatus) {
      return a.paymentStatus === "paid" ? -1 : 1;
    }
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  });

  const teamsGroupedByDivision = (() => {
    const div = divisions?.find((d: Division) => String(d.id) === selectedDivision);
    return [{ division: div, teams: sortedTeams }];
  })();

  return (
    <MainLayout>
      <SEO 
        title={tournament?.name}
        description={`${tournament?.name || "Tournament"} - Salaam Cup tournament in Toronto & GTA. View teams, schedules, standings, and results.`}
        canonical={`/tournaments/${params?.id}`}
        ogType="article"
        keywords={`${tournament?.name || ""}, Salaam Cup tournament, sports competition Toronto`}
      />
      <HeroSection
        title={tournament.name.replace("Salaam Cup ", "").toUpperCase()}
        image={tournament.heroImage || undefined}
      />
      <SponsorBar />
      <TournamentNav tournamentId={tournamentSlug} />

      {tournament.showNewsBanner && tournamentNews.length > 0 && (
        <TournamentNewsBanner newsItems={tournamentNews} />
      )}

      {tournament.showSponsorBanner && tournamentSponsorsList && tournamentSponsorsList.length > 0 && (
        <TournamentSponsorBanner sponsors={tournamentSponsorsList} />
      )}

      {tournament.showInfoBanner && (
        <TournamentInfoBanner tournament={tournament} divisions={divisions} venues={venues} />
      )}

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-10" data-testid="text-compete-win">
            Compete And Win.
          </h2>

          {divisionTabsReady.length > 0 && (
            <div className="flex justify-center mb-10">
              <div className="flex gap-2 flex-wrap justify-center">
                {divisionTabsReady.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={selectedDivision === tab.id ? "default" : "outline"}
                    className="rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-500 hover:text-background"
                    onClick={() => setSelectedDivision(tab.id)}
                    data-testid={`filter-division-${tab.id}`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <DetailBracket tournamentId={numericId} divisionId={selectedDivision} tournamentSlug={tournamentSlug} />

          {matchesLoading ? (
            <div className="mb-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="mb-8">
              {filteredMatches.map((m: MatchWithTeams) => (
                <MatchRow key={m.id} match={m} divisions={divisions} venues={venues} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No matches scheduled yet.</p>
          )}

          <div className="text-center mt-4 mb-16">
            <Link href={`/tournaments/${tournamentSlug}/schedule`}>
              <Button variant="outline" className="rounded-full font-bold uppercase text-xs hover:bg-stone-500 hover:text-background tracking-wider px-8 gap-2" data-testid="button-full-schedule">
                See Full Schedule <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {standingsLoading && (
            <div className="mb-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}

          {!standingsLoading && filteredStandings.length > 0 && (() => {
            const columns = getStandingsColumns(tournament?.standingsType);
            return (
            <>
              <div className="overflow-x-auto -mx-4 px-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-foreground">
                    <TableHead className="w-12 font-bold text-foreground">Pos</TableHead>
                    <TableHead className="font-bold text-foreground">Team</TableHead>
                    {columns.map((col) => (
                      <TableHead key={col.key} className={`text-center font-bold text-foreground`}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStandings.map((s: StandingWithTeam, index: number) => (
                    <TableRow key={s.id} className="border-b" data-testid={`row-standing-${s.id}`}>
                      <TableCell className="font-bold">{s.position || index + 1}</TableCell>
                      <TableCell>
                        <Link href={`/teams/${s.teamId}`} className="font-medium hover:underline flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {s.team?.name || `Team #${s.teamId}`}
                        </Link>
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col.key} className={`text-center ${col.key === 'pts' || col.key === 'pct' ? 'font-bold' : ''}`}>
                          {col.getValue(s)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              <div className="text-center mt-6 mb-16">
                <Link href={`/tournaments/${tournamentSlug}/standings`}>
                  <Button variant="outline" className="rounded-full font-bold uppercase text-xs hover:bg-stone-500 hover:text-background tracking-wider px-8 gap-2" data-testid="button-full-standings">
                    See Full Standings <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
            );
          })()}

          {sortedTeams.length > 0 && (
            <div className="mb-16">
              <h3 className="text-xl font-bold font-display uppercase text-center mb-6" data-testid="text-registered-teams">
                Registered Teams
              </h3>
              {teamsGroupedByDivision.map(({ division, teams: divTeams }) => (
                <div key={division?.id || "unknown"} className="mb-8" data-testid={`team-group-division-${division?.id || "unknown"}`}>
                  <div className="space-y-0">
                    {divTeams.map((team: Team, idx: number) => (
                      <Link key={team.id} href={`/teams/${team.id}`}>
                        <div
                          className={`hover:bg-stone-900 hover:text-background flex items-center gap-3 md:gap-4 py-3 px-3 md:px-4 cursor-pointer hover-elevate ${idx < divTeams.length - 1 ? "border-b" : ""}`}
                          data-testid={`row-team-${team.id}`}
                        >
                          <span className="text-xs text-muted-foreground font-bold w-6 shrink-0">{idx + 1}</span>
                          <div className="w-10 h-10 shrink-0 rounded-full bg-muted flex items-center justify-center">
                            {team.logoUrl ? (
                              <img src={team.logoUrl} alt={team.name} className="w-8 h-8 object-contain rounded-full" />
                            ) : (
                              <Users className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm font-display uppercase truncate" data-testid={`text-team-name-${team.id}`}>{team.name}</p>
                            <p className="text-xs text-muted-foreground">{team.captainName}</p>
                          </div>
                          <Badge
                            variant={team.paymentStatus === "paid" ? "default" : "outline"}
                            className={`shrink-0 text-xs ${team.paymentStatus === "paid" ? "bg-green-600 text-white" : ""}`}
                            data-testid={`badge-payment-${team.id}`}
                          >
                            {team.paymentStatus === "paid" ? "Deposit Paid" : "Unpaid"}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ReadyToCompete />
      <FAQSection />
    </MainLayout>
  );
}

function formatTournamentDates(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  const startMonth = format(start, "MMMM").toUpperCase();
  const endMonth = format(end, "MMMM").toUpperCase();
  const startYear = format(start, "yyyy");
  const endYear = format(end, "yyyy");

  if (startDate === endDate) {
    return format(start, "MMMM d, yyyy").toUpperCase();
  }

  if (startYear !== endYear) {
    return `${startMonth} ${format(start, "d")}, ${startYear} - ${endMonth} ${format(end, "d")}, ${endYear}`;
  }

  if (startMonth !== endMonth) {
    return `${startMonth} ${format(start, "d")} - ${endMonth} ${format(end, "d")}, ${endYear}`;
  }

  const days = eachDayOfInterval({ start, end });
  const dayNumbers = days.map(d => format(d, "d"));

  if (days.length === 2) {
    return `${startMonth} ${dayNumbers[0]} & ${dayNumbers[1]}, ${endYear}`;
  }

  const allButLast = dayNumbers.slice(0, -1).join(", ");
  return `${startMonth} ${allButLast} & ${dayNumbers[dayNumbers.length - 1]}, ${endYear}`;
}

function TournamentInfoBanner({ 
  tournament, 
  divisions, 
  venues 
}: { 
  tournament: any; 
  divisions?: Division[]; 
  venues?: Venue[] 
}) {
  const venue = tournament.venueId && venues 
    ? venues.find((v: Venue) => Number(v.id) === Number(tournament.venueId)) 
    : null;

  return (
    <section className="py-12 bg-muted/30" data-testid="tournament-info-banner">
      <div className="container mx-auto px-4 text-center space-y-5">
        <h2 className="text-2xl md:text-4xl font-bold font-display uppercase tracking-wide" data-testid="banner-title">
          {tournament.year} SALAAM CUP {tournament.name.toUpperCase().replace("SALAAM CUP ", "").replace("MENS ", "").replace("WOMENS ", "")} TOURNAMENT
        </h2>

        {tournament.startDate && tournament.endDate && (
          <p className="text-xl md:text-2xl font-bold font-display" data-testid="banner-dates">
            {formatTournamentDates(tournament.startDate, tournament.endDate)}
          </p>
        )}

        {venue && (
          <div data-testid="banner-venue">
            {venue.mapLink ? (
              <a 
                href={venue.mapLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-lg md:text-xl font-bold text-primary underline underline-offset-2 font-display"
              >
                {venue.name}
              </a>
            ) : (
              <p className="text-lg md:text-xl font-bold text-primary font-display">{venue.name}</p>
            )}
            {venue.address && (
              <p className="text-sm md:text-base text-muted-foreground mt-1">{venue.address}</p>
            )}
          </div>
        )}

        {divisions && divisions.length > 0 && (
          <div data-testid="banner-divisions">
            <p className="text-base md:text-lg font-bold font-display uppercase tracking-wide mb-1">Divisions:</p>
            {divisions.map((div: Division) => (
              <p 
                key={div.id} 
                className="text-sm md:text-base font-bold font-display uppercase"
                data-testid={`banner-division-${div.id}`}
              >
                {div.name}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function getBracketRoundName(round: number, totalRounds: number): string {
  if (round === totalRounds) return "Final";
  if (round === totalRounds - 1) return "Semifinals";
  if (round === totalRounds - 2) return "Quarterfinals";
  return `Round ${round}`;
}

function DetailBracket({ tournamentId, divisionId, tournamentSlug }: { tournamentId: number; divisionId: string; tournamentSlug: string }) {
  const { data: settings } = useQuery<PlayoffSettings | null>({
    queryKey: ['/api/tournaments', tournamentId, 'divisions', divisionId, 'playoffs', 'settings'],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/divisions/${divisionId}/playoffs/settings`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!tournamentId && !!divisionId,
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

  if (!settings?.showBracket || !settings?.generated) return null;
  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />;
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
    <div className="mb-12" data-testid="detail-bracket-section">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-bold font-display uppercase">Playoff Bracket</h3>
        <Link href={`/tournaments/${tournamentSlug}/playoffs`}>
          <Button variant="outline" size="sm" className="rounded-full font-bold uppercase text-xs tracking-wider gap-1">
            Full Bracket <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {champion && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-md mb-4" data-testid="detail-champion-banner">
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
                {getBracketRoundName(roundNum, totalRounds)}
              </p>
              <div className="space-y-2" style={{ paddingTop: `${(Math.pow(2, roundNum - 1) - 1) * 24}px` }}>
                {roundMatches.map((match) => {
                  const isFinal = match.status === "final";
                  return (
                    <div key={match.id} style={{ marginBottom: `${(Math.pow(2, roundNum) - 1) * 16}px` }}>
                      {match.isBye ? (
                        <div className="border border-border rounded-md p-2 opacity-50 bg-card">
                          <div className="text-sm font-medium">{match.homeTeam?.name || match.awayTeam?.name || "TBD"}</div>
                          <div className="text-xs text-muted-foreground">BYE</div>
                        </div>
                      ) : (
                        <div className={cn("border border-border rounded-md bg-card", roundNum === totalRounds && isFinal && "ring-2 ring-primary")}>
                          <div className={cn("flex items-center gap-2 px-3 py-2 border-b border-border", isFinal && match.winnerTeamId === match.homeTeamId && "bg-primary/5 font-bold")}>
                            {match.homeSeed && <span className="text-xs text-muted-foreground w-5 text-right">{match.homeSeed}</span>}
                            <span className="text-sm flex-1 min-w-0 truncate">{match.homeTeam?.name || "TBD"}</span>
                            <span className="text-sm font-mono w-6 text-center">{match.homeScore ?? "-"}</span>
                          </div>
                          <div className={cn("flex items-center gap-2 px-3 py-2", isFinal && match.winnerTeamId === match.awayTeamId && "bg-primary/5 font-bold", !(match.startTime || match.venue || match.fieldLocation) && "rounded-b-md")}>
                            {match.awaySeed && <span className="text-xs text-muted-foreground w-5 text-right">{match.awaySeed}</span>}
                            <span className="text-sm flex-1 min-w-0 truncate">{match.awayTeam?.name || "TBD"}</span>
                            <span className="text-sm font-mono w-6 text-center">{match.awayScore ?? "-"}</span>
                          </div>
                          {(match.startTime || match.venue || match.fieldLocation) && (
                            <div className="px-3 py-1.5 border-t border-border bg-muted/30 rounded-b-md">
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchRow({ match, divisions, venues }: { match: MatchWithTeams; divisions?: Division[]; venues?: Venue[] }) {
  const matchDate = match.startTime ? new Date(match.startTime) : null;
  const isLive = match.status === "live";
  const isFinal = match.status === "final";
  const isScheduled = match.status === "scheduled";
  const division = divisions?.find(d => d.id === match.divisionId);
  const venueName = match.venueId && venues ? venues.find(v => Number(v.id) === Number(match.venueId))?.name : null;

  return (
    <div className="flex items-center py-4 border-b gap-2 md:gap-4" data-testid={`match-row-${match.id}`}>
      <div className="w-24 md:w-32 shrink-0 text-xs text-muted-foreground">
        {matchDate && (
          <>
            <div>{matchDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
            <div className="text-lg md:text-xl font-bold font-display text-foreground">
              {matchDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </>
        )}
        {(venueName || match.fieldLocation) && (
          <div>
            {venueName}{venueName && match.fieldLocation ? " - " : ""}{match.fieldLocation || ""}
          </div>
        )}
      </div>

      <div className="flex-1 text-right min-w-0">
        <Link href={match.homeTeam ? `/teams/${match.homeTeamId}` : "#"}>
          <span className="font-bold text-sm md:text-base hover:underline">{match.homeTeam?.name || "TBD"}</span>
        </Link>
      </div>

      <div className="flex flex-col items-center shrink-0 px-2 md:px-4">
        {division && <div className="text-xs text-muted-foreground mb-1">{division.name}</div>}
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl font-bold font-display">{isScheduled ? "-" : match.homeScore}</span>
          <span className="text-2xl md:text-3xl font-bold font-display">{isScheduled ? "-" : match.awayScore}</span>
        </div>
        <div className="mt-1">
          {isLive && <span className="text-xs font-bold text-red-500 uppercase">Live</span>}
          {isFinal && <span className="text-xs text-muted-foreground uppercase">Final</span>}
          {isScheduled && <span className="text-xs text-muted-foreground uppercase">Scheduled</span>}
        </div>
        {match.round && <div className="text-[10px] text-muted-foreground mt-0.5">{match.round}</div>}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={match.awayTeam ? `/teams/${match.awayTeamId}` : "#"}>
          <span className="font-bold text-sm md:text-base hover:underline">{match.awayTeam?.name || "TBD"}</span>
        </Link>
      </div>
    </div>
  );
}
