import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { SEO } from "@/components/SEO";
import { SponsorBar } from "@/components/SponsorBar";
import { useTeam } from "@/hooks/use-teams";
import { usePlayers } from "@/hooks/use-players";
import { useMatches } from "@/hooks/use-matches";
import { useVenues } from "@/hooks/use-venues";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin } from "lucide-react";
import { useState } from "react";
import type { Player, MatchWithTeams, Venue } from "@shared/schema";

export default function TeamDetail() {
  const [, params] = useRoute("/teams/:id");
  const teamId = Number(params?.id);

  const { data: team, isLoading } = useTeam(teamId);
  const { data: players } = usePlayers(teamId);
  const { data: allMatches } = useMatches(team?.tournamentId || 0);
  const { data: venues } = useVenues();

  const [activeTab, setActiveTab] = useState<"roster" | "schedule">("roster");

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

  if (!team) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold font-display mb-4">Team Not Found</h1>
          <Link href="/tournaments">
            <Button data-testid="link-back-tournaments">Back to Tournaments</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const rosterPlayers = players?.filter((p: Player) => p.registrationType === "roster") || [];
  const teamMatches = allMatches?.filter((m: MatchWithTeams) => m.homeTeamId === teamId || m.awayTeamId === teamId) || [];

  return (
    <MainLayout>
      <SEO 
        title={team?.name}
        description={`${team?.name || "Team"} - Salaam Cup tournament team in the Greater Toronto Area. View roster, players, and tournament details.`}
        canonical={`/teams/${params?.id}`}
        keywords={`${team?.name || ""}, Salaam Cup team, sports team Toronto`}
      />
      <section className="bg-background py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between gap-8 flex-wrap">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold font-display uppercase tracking-tight" data-testid="text-team-name">
                {team.name}
              </h1>
              <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide">
                {team.description || "Ball Hockey"} &middot; {team.teamColor || "Men"} &middot; Division
              </p>

              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Badge variant="outline" className="rounded-full text-xs font-bold gap-1 px-3" data-testid="badge-standings">
                  #1 Standings
                </Badge>
                <Badge variant="outline" className="rounded-full text-xs font-bold gap-1 px-3" data-testid="badge-captain">
                  {team.captainName} (C)
                </Badge>
              </div>
            </div>

            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-md bg-muted flex items-center justify-center">
                  <Users className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-6">
            <Button
              variant={activeTab === "roster" ? "default" : "outline"}
              className="hover:bg-stone-500 hover:text-background rounded-full text-xs font-bold uppercase tracking-wider"
              onClick={() => setActiveTab("roster")}
              data-testid="tab-roster"
            >
              Roster
            </Button>
            <Button
              variant={activeTab === "schedule" ? "default" : "outline"}
              className="hover:bg-stone-500 hover:text-background rounded-full text-xs font-bold uppercase tracking-wider"
              onClick={() => setActiveTab("schedule")}
              data-testid="tab-schedule"
            >
              Schedule
            </Button>
          </div>
        </div>
      </section>

      {activeTab === "roster" && (
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4">
            {rosterPlayers.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-0">
                {rosterPlayers.map((player: Player) => (
                  <PlayerRow key={player.id} player={player} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No roster submitted yet.</p>
            )}
          </div>
        </section>
      )}

      {activeTab === "schedule" && (
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            {teamMatches.length > 0 ? (
              <div>
                {teamMatches.map((m: MatchWithTeams) => {
                  const matchDate = m.startTime ? new Date(m.startTime) : null;
                  const isScheduled = m.status === "scheduled";
                  const isLive = m.status === "live";
                  const isFinal = m.status === "final";
                  const venue = m.venueId ? venues?.find((v: Venue) => v.id === m.venueId) : null;

                  return (
                    <div key={m.id} className="py-4 border-b" data-testid={`team-match-${m.id}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-28 shrink-0">
                          {matchDate && (
                            <>
                              <div className="text-xs text-muted-foreground">
                                {matchDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                              </div>
                              <div className="text-xl font-bold font-display">
                                {matchDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex-1 text-right font-bold text-sm">
                          <Link href={`/teams/${m.homeTeamId}`} className="hover:underline">
                            {m.homeTeam?.name || "TBD"}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 px-4">
                          <span className="text-2xl font-bold font-display">{isScheduled ? "-" : m.homeScore}</span>
                          <span className="text-2xl font-bold font-display">{isScheduled ? "-" : m.awayScore}</span>
                        </div>
                        <div className="flex-1 font-bold text-sm">
                          <Link href={`/teams/${m.awayTeamId}`} className="hover:underline">
                            {m.awayTeam?.name || "TBD"}
                          </Link>
                        </div>
                        <div className="w-20 text-right">
                          {isLive && <span className="text-xs font-bold text-red-500 uppercase">Live</span>}
                          {isFinal && <span className="text-xs text-muted-foreground uppercase">Final</span>}
                          {isScheduled && <span className="text-xs text-muted-foreground uppercase">Scheduled</span>}
                        </div>
                      </div>
                      {(venue || m.fieldLocation) && (
                        <div className="flex items-center gap-1.5 mt-1.5 ml-28 pl-0" data-testid={`team-match-venue-${m.id}`}>
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            {[venue?.name, m.fieldLocation].filter(Boolean).join(" — ")}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No matches scheduled for this team yet.</p>
            )}
          </div>
        </section>
      )}

      <SponsorBar variant="dark" />
    </MainLayout>
  );
}

function PlayerRow({ player }: { player: Player }) {
  const isRegistered = player.status === "confirmed" || player.status === "verified";

  return (
    <div className="flex items-center py-4 border-b gap-4" data-testid={`player-row-${player.id}`}>
      <span className="text-lg font-bold font-display text-muted-foreground w-10 shrink-0">
        #{player.jerseyNumber ?? 0}
      </span>
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        {player.photoUrl ? (
          <img src={player.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <Users className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <span className="font-bold text-sm uppercase flex-1 min-w-0 truncate">
        {player.firstName} {player.lastName}
      </span>
      <span className="text-xs text-muted-foreground shrink-0">{player.dob}</span>
      <span className={`text-xs font-bold uppercase shrink-0 ${isRegistered ? "text-green-600" : "text-muted-foreground"}`} data-testid={`player-status-${player.id}`}>
        {isRegistered ? "Registered" : player.status}
      </span>
    </div>
  );
}
