import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { ReadyToCompete } from "@/components/ReadyToCompete";
import { FAQSection } from "@/components/FAQSection";
import { useTournament, useDivisions } from "@/hooks/use-tournaments";
import { useTeams } from "@/hooks/use-teams";
import { useMatches } from "@/hooks/use-matches";
import { useVenues } from "@/hooks/use-venues";
import { useStandings } from "@/hooks/use-standings";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TournamentNav } from "@/components/TournamentNav";
import { Users, ArrowRight } from "lucide-react";
import { useState } from "react";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import type { Division, Team, StandingWithTeam, MatchWithTeams, Venue } from "@shared/schema";

export default function TournamentDetail() {
  const [, params] = useRoute("/tournaments/:id");
  const tournamentId = Number(params?.id);

  const { data: tournament, isLoading } = useTournament(tournamentId);
  const { data: divisions } = useDivisions(tournamentId);
  const { data: allTeams } = useTeams(tournamentId);
  const { data: allMatches, isLoading: matchesLoading } = useMatches(tournamentId);
  const { data: venues } = useVenues();
  const { data: allStandings, isLoading: standingsLoading } = useStandings(tournamentId);

  const divisionTabsReady = divisions?.map((d: Division) => ({ id: String(d.id), label: d.name })) || [];
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  if (selectedDivision === "" && divisionTabsReady.length > 0) {
    setSelectedDivision(divisionTabsReady[0].id);
  }

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
      <HeroSection
        title={tournament.name.replace("Salaam Cup ", "").toUpperCase()}
        image={tournament.heroImage || undefined}
      />
      <SponsorBar />
      <TournamentNav tournamentId={tournamentId} />

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
                    className="rounded-full text-xs font-bold uppercase tracking-wider"
                    onClick={() => setSelectedDivision(tab.id)}
                    data-testid={`filter-division-${tab.id}`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

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
            <Link href={`/tournaments/${tournamentId}/schedule`}>
              <Button variant="outline" className="rounded-full font-bold uppercase text-xs tracking-wider px-8 gap-2" data-testid="button-full-schedule">
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

          {!standingsLoading && filteredStandings.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-foreground">
                    <TableHead className="w-12 font-bold text-foreground">Pos</TableHead>
                    <TableHead className="font-bold text-foreground">Team</TableHead>
                    <TableHead className="text-center font-bold text-foreground">GP</TableHead>
                    <TableHead className="text-center font-bold text-foreground">W</TableHead>
                    <TableHead className="text-center font-bold text-foreground">L</TableHead>
                    <TableHead className="text-center font-bold text-foreground">T</TableHead>
                    <TableHead className="text-center font-bold text-foreground">GF</TableHead>
                    <TableHead className="text-center font-bold text-foreground">GA</TableHead>
                    <TableHead className="text-center font-bold text-foreground">GD</TableHead>
                    <TableHead className="text-center font-bold text-foreground">PTS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStandings.map((s: StandingWithTeam) => (
                    <TableRow key={s.id} className="border-b" data-testid={`row-standing-${s.id}`}>
                      <TableCell className="font-bold">{s.position}</TableCell>
                      <TableCell>
                        <Link href={`/teams/${s.teamId}`} className="font-medium hover:underline flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {s.team?.name || `Team #${s.teamId}`}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{s.gamesPlayed}</TableCell>
                      <TableCell className="text-center">{s.wins}</TableCell>
                      <TableCell className="text-center">{s.losses}</TableCell>
                      <TableCell className="text-center">{s.ties}</TableCell>
                      <TableCell className="text-center">{s.goalsFor}</TableCell>
                      <TableCell className="text-center">{s.goalsAgainst}</TableCell>
                      <TableCell className="text-center">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</TableCell>
                      <TableCell className="text-center font-bold">{s.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="text-center mt-6 mb-16">
                <Link href={`/tournaments/${tournamentId}/standings`}>
                  <Button variant="outline" className="rounded-full font-bold uppercase text-xs tracking-wider px-8 gap-2" data-testid="button-full-standings">
                    See Full Standings <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}

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
                          className={`flex items-center gap-3 md:gap-4 py-3 px-3 md:px-4 cursor-pointer hover-elevate ${idx < divTeams.length - 1 ? "border-b" : ""}`}
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
      </div>

      <div className="flex-1 min-w-0">
        <Link href={match.awayTeam ? `/teams/${match.awayTeamId}` : "#"}>
          <span className="font-bold text-sm md:text-base hover:underline">{match.awayTeam?.name || "TBD"}</span>
        </Link>
      </div>
    </div>
  );
}
