import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { useTournament, useDivisions } from "@/hooks/use-tournaments";
import { useTeams } from "@/hooks/use-teams";
import { useMatches } from "@/hooks/use-matches";
import { useStandings } from "@/hooks/use-standings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { Division, Team, StandingWithTeam, MatchWithTeams } from "@shared/schema";

export default function TournamentDetail() {
  const [, params] = useRoute("/tournaments/:id");
  const tournamentId = Number(params?.id);

  const { data: tournament, isLoading } = useTournament(tournamentId);
  const { data: divisions } = useDivisions(tournamentId);
  const { data: allTeams } = useTeams(tournamentId);
  const { data: allMatches } = useMatches(tournamentId);
  const { data: allStandings } = useStandings(tournamentId);

  const [selectedDivision, setSelectedDivision] = useState<string>("all");

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
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

  const statusColors: Record<string, string> = {
    upcoming: "bg-blue-500 text-white",
    active: "bg-green-500 text-white",
    completed: "bg-muted text-muted-foreground",
  };

  const filteredTeams = selectedDivision === "all" 
    ? allTeams 
    : allTeams?.filter((t: Team) => t.divisionId === Number(selectedDivision));

  const filteredMatches = selectedDivision === "all"
    ? allMatches
    : allMatches?.filter((m: MatchWithTeams) => m.divisionId === Number(selectedDivision));

  const filteredStandings = selectedDivision === "all"
    ? allStandings
    : allStandings?.filter((s: StandingWithTeam) => s.divisionId === Number(selectedDivision));

  const approvedTeams = filteredTeams?.filter((t: Team) => t.status === "approved");
  const finalMatches = filteredMatches?.filter((m: MatchWithTeams) => m.status === "final");
  const liveMatches = filteredMatches?.filter((m: MatchWithTeams) => m.status === "live");
  const scheduledMatches = filteredMatches?.filter((m: MatchWithTeams) => m.status === "scheduled");

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[280px] flex items-center justify-center overflow-hidden bg-secondary">
        {tournament.heroImage && (
          <img src={tournament.heroImage} alt={tournament.name} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 to-secondary/90" />
        <div className="container relative z-10 px-4 text-center">
          <Badge className={statusColors[tournament.status] || ""} data-testid="badge-tournament-status">
            {tournament.status.toUpperCase()}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-white mt-3 text-shadow-lg" data-testid="text-tournament-name">
            {tournament.name}
          </h1>
          <div className="flex items-center justify-center gap-4 mt-4 text-white/80 flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {tournament.startDate} - {tournament.endDate}</span>
            <span className="flex items-center gap-1"><Trophy className="h-4 w-4" /> {tournament.year}</span>
          </div>
          {tournament.description && (
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">{tournament.description}</p>
          )}
        </div>
      </section>

      {/* Division Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Filter by Division:</span>
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-[200px]" data-testid="select-division-filter">
              <SelectValue placeholder="All Divisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions?.map((d: Division) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.name} ({d.category})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 pb-12">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="w-full justify-start flex-wrap gap-1 h-auto p-1 bg-muted" data-testid="tabs-tournament">
            <TabsTrigger value="schedule" data-testid="tab-schedule">Schedule</TabsTrigger>
            <TabsTrigger value="standings" data-testid="tab-standings">Standings</TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-teams">Teams</TabsTrigger>
            <TabsTrigger value="divisions" data-testid="tab-divisions">Divisions</TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats">Stats</TabsTrigger>
          </TabsList>

          {/* SCHEDULE TAB */}
          <TabsContent value="schedule" className="mt-6">
            <h2 className="text-2xl font-bold font-display mb-6">Schedule & Results</h2>

            {/* Live matches */}
            {liveMatches && liveMatches.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  Live Now
                </h3>
                <div className="space-y-3">
                  {liveMatches.map((m: MatchWithTeams) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled */}
            {scheduledMatches && scheduledMatches.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Upcoming</h3>
                <div className="space-y-3">
                  {scheduledMatches.map((m: MatchWithTeams) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {finalMatches && finalMatches.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Results</h3>
                <div className="space-y-3">
                  {finalMatches.map((m: MatchWithTeams) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            )}

            {(!allMatches || allMatches.length === 0) && (
              <p className="text-muted-foreground text-center py-12">No matches scheduled yet.</p>
            )}
          </TabsContent>

          {/* STANDINGS TAB */}
          <TabsContent value="standings" className="mt-6">
            <h2 className="text-2xl font-bold font-display mb-6">Standings</h2>
            {divisions?.map((div: Division) => {
              const divStandings = allStandings?.filter((s: StandingWithTeam) => s.divisionId === div.id);
              if (selectedDivision !== "all" && String(div.id) !== selectedDivision) return null;
              if (!divStandings || divStandings.length === 0) return null;
              return (
                <div key={div.id} className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">{div.name}</h3>
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary text-secondary-foreground">
                            <TableHead className="text-secondary-foreground w-12">Pos</TableHead>
                            <TableHead className="text-secondary-foreground">Team</TableHead>
                            <TableHead className="text-secondary-foreground text-center">GP</TableHead>
                            <TableHead className="text-secondary-foreground text-center">W</TableHead>
                            <TableHead className="text-secondary-foreground text-center">L</TableHead>
                            <TableHead className="text-secondary-foreground text-center">T</TableHead>
                            <TableHead className="text-secondary-foreground text-center">GF</TableHead>
                            <TableHead className="text-secondary-foreground text-center">GA</TableHead>
                            <TableHead className="text-secondary-foreground text-center">GD</TableHead>
                            <TableHead className="text-secondary-foreground text-center font-bold">PTS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {divStandings.sort((a: StandingWithTeam, b: StandingWithTeam) => (a.position || 0) - (b.position || 0)).map((s: StandingWithTeam) => (
                            <TableRow key={s.id} data-testid={`row-standing-${s.id}`}>
                              <TableCell className="font-bold">{s.position}</TableCell>
                              <TableCell>
                                <Link href={`/teams/${s.teamId}`} className="font-medium hover:text-primary transition-colors">
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
                              <TableCell className="text-center font-bold text-lg">{s.points}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
            {(!allStandings || allStandings.length === 0) && (
              <p className="text-muted-foreground text-center py-12">Standings will appear after matches are completed.</p>
            )}
          </TabsContent>

          {/* TEAMS TAB */}
          <TabsContent value="teams" className="mt-6">
            <h2 className="text-2xl font-bold font-display mb-6">Teams</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedTeams?.map((team: Team) => {
                const division = divisions?.find((d: Division) => d.id === team.divisionId);
                return (
                  <Link key={team.id} href={`/teams/${team.id}`}>
                    <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-team-${team.id}`}>
                      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt={team.name} className="w-12 h-12 object-contain rounded-md" />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
                            <Users className="h-6 w-6 text-secondary-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                          {division && (
                            <Badge variant="outline" className="mt-1">{division.name}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">Captain: {team.captainName}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {(!approvedTeams || approvedTeams.length === 0) && (
              <p className="text-muted-foreground text-center py-12">No teams registered yet.</p>
            )}
          </TabsContent>

          {/* DIVISIONS TAB */}
          <TabsContent value="divisions" className="mt-6">
            <h2 className="text-2xl font-bold font-display mb-6">Divisions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {divisions?.map((div: Division) => {
                const divTeams = allTeams?.filter((t: Team) => t.divisionId === div.id && t.status === "approved");
                return (
                  <Card key={div.id} data-testid={`card-division-${div.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle className="text-xl">{div.name}</CardTitle>
                        <Badge variant="secondary">{div.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {div.description && <p className="text-sm text-muted-foreground mb-3">{div.description}</p>}
                      {div.gameFormat && <p className="text-sm"><span className="font-medium">Format:</span> {div.gameFormat}</p>}
                      <p className="text-sm mt-1"><span className="font-medium">Teams:</span> {divTeams?.length || 0}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* STATS TAB */}
          <TabsContent value="stats" className="mt-6">
            <h2 className="text-2xl font-bold font-display mb-6">Tournament Stats</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Teams" value={approvedTeams?.length || 0} icon={<Users className="h-5 w-5" />} />
              <StatCard label="Total Matches" value={allMatches?.length || 0} icon={<Calendar className="h-5 w-5" />} />
              <StatCard label="Completed" value={finalMatches?.length || 0} icon={<Trophy className="h-5 w-5" />} />
              <StatCard label="Divisions" value={divisions?.length || 0} icon={<ArrowRight className="h-5 w-5" />} />
            </div>

            {/* Top Scoring Teams */}
            {allStandings && allStandings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Top Scoring Teams</h3>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center">Goals For</TableHead>
                          <TableHead className="text-center">Goals Against</TableHead>
                          <TableHead className="text-center">Goal Difference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...allStandings]
                          .sort((a: StandingWithTeam, b: StandingWithTeam) => b.goalsFor - a.goalsFor)
                          .slice(0, 5)
                          .map((s: StandingWithTeam) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium">{s.team?.name || "Unknown"}</TableCell>
                              <TableCell className="text-center font-bold">{s.goalsFor}</TableCell>
                              <TableCell className="text-center">{s.goalsAgainst}</TableCell>
                              <TableCell className="text-center">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Undefeated Teams */}
            {allStandings && allStandings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Undefeated Teams</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allStandings
                    .filter((s: StandingWithTeam) => s.losses === 0 && s.gamesPlayed > 0)
                    .map((s: StandingWithTeam) => (
                      <Card key={s.id}>
                        <CardContent className="p-4 flex items-center justify-between gap-2">
                          <span className="font-medium">{s.team?.name}</span>
                          <Badge>{s.wins}W - {s.ties}T</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  {allStandings.filter((s: StandingWithTeam) => s.losses === 0 && s.gamesPlayed > 0).length === 0 && (
                    <p className="text-muted-foreground text-sm col-span-full">No undefeated teams.</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function MatchCard({ match }: { match: MatchWithTeams }) {
  const matchDate = match.startTime ? new Date(match.startTime) : null;
  const statusBadge: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    live: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    final: "bg-muted text-muted-foreground",
    cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <Card data-testid={`card-match-${match.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Date/Time */}
          <div className="text-sm text-muted-foreground w-28 shrink-0">
            {matchDate && (
              <>
                <div className="font-medium">{matchDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{matchDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
              </>
            )}
          </div>

          {/* Home Team */}
          <div className="flex-1 text-right min-w-0">
            <Link href={match.homeTeam ? `/teams/${match.homeTeamId}` : "#"}>
              <span className="font-semibold hover:text-primary transition-colors truncate block">{match.homeTeam?.name || "TBD"}</span>
            </Link>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 px-3 shrink-0">
            <span className="text-2xl font-bold font-display">{match.status === "scheduled" ? "-" : match.homeScore}</span>
            <span className="text-muted-foreground text-sm">vs</span>
            <span className="text-2xl font-bold font-display">{match.status === "scheduled" ? "-" : match.awayScore}</span>
          </div>

          {/* Away Team */}
          <div className="flex-1 min-w-0">
            <Link href={match.awayTeam ? `/teams/${match.awayTeamId}` : "#"}>
              <span className="font-semibold hover:text-primary transition-colors truncate block">{match.awayTeam?.name || "TBD"}</span>
            </Link>
          </div>

          {/* Status & Round */}
          <div className="text-right shrink-0 text-sm">
            <Badge className={statusBadge[match.status] || ""}>{match.status.toUpperCase()}</Badge>
            {match.round && <div className="text-xs text-muted-foreground mt-1">{match.round}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-md bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-2xl font-bold font-display">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
