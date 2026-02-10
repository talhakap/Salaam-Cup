import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { useTournament, useDivisions } from "@/hooks/use-tournaments";
import { useTeams } from "@/hooks/use-teams";
import { useMatches } from "@/hooks/use-matches";
import { useStandings } from "@/hooks/use-standings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

  const approvedTeams = allTeams?.filter((t: Team) => t.status === "approved");
  const finalMatches = allMatches?.filter((m: MatchWithTeams) => m.status === "final");
  const liveMatches = allMatches?.filter((m: MatchWithTeams) => m.status === "live");
  const scheduledMatches = allMatches?.filter((m: MatchWithTeams) => m.status === "scheduled");

  const divisionTabs = divisions?.map((d: Division) => ({ id: String(d.id), label: d.name })) || [];

  return (
    <MainLayout>
      <HeroSection 
        title={tournament.name.replace("Salaam Cup ", "").toUpperCase()} 
        image={tournament.heroImage || undefined} 
      />
      <SponsorBar />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-10" data-testid="text-compete-win">
            Compete And Win.
          </h2>

          {divisionTabs.length > 0 && (
            <div className="flex justify-center mb-10">
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant={selectedDivision === "all" ? "default" : "outline"}
                  className="rounded-full text-xs font-bold uppercase tracking-wider"
                  onClick={() => setSelectedDivision("all")}
                  data-testid="filter-all"
                >
                  All
                </Button>
                {divisionTabs.map((tab) => (
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

          {liveMatches && liveMatches.length > 0 && (
            <div className="mb-6">
              {liveMatches
                .filter((m: MatchWithTeams) => selectedDivision === "all" || m.divisionId === Number(selectedDivision))
                .map((m: MatchWithTeams) => (
                  <MatchRow key={m.id} match={m} />
                ))}
            </div>
          )}

          {allMatches && allMatches.length > 0 && (
            <div className="mb-10">
              {[...(finalMatches || []), ...(scheduledMatches || [])]
                .filter((m: MatchWithTeams) => selectedDivision === "all" || m.divisionId === Number(selectedDivision))
                .map((m: MatchWithTeams) => (
                  <MatchRow key={m.id} match={m} />
                ))}
            </div>
          )}

          {(!allMatches || allMatches.length === 0) && (
            <p className="text-muted-foreground text-center py-12">No matches scheduled yet.</p>
          )}

          <div className="text-center mt-6 mb-16">
            <Button variant="outline" className="rounded-full font-bold uppercase text-xs tracking-wider px-8" data-testid="button-full-schedule">
              See Full Schedule
            </Button>
          </div>

          {allStandings && allStandings.length > 0 && (
            <>
              {divisions?.map((div: Division) => {
                if (selectedDivision !== "all" && String(div.id) !== selectedDivision) return null;
                const divStandings = allStandings?.filter((s: StandingWithTeam) => s.divisionId === div.id);
                if (!divStandings || divStandings.length === 0) return null;
                return (
                  <div key={div.id} className="mb-8">
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
                        {divStandings
                          .sort((a: StandingWithTeam, b: StandingWithTeam) => (a.position || 0) - (b.position || 0))
                          .map((s: StandingWithTeam) => (
                            <TableRow key={s.id} className="border-b" data-testid={`row-standing-${s.id}`}>
                              <TableCell className="font-bold">{s.position}</TableCell>
                              <TableCell>
                                <Link href={`/teams/${s.teamId}`} className="font-medium hover:underline">
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
                  </div>
                );
              })}

              <div className="text-center mt-6 mb-16">
                <Button variant="outline" className="rounded-full font-bold uppercase text-xs tracking-wider px-8" data-testid="button-full-standings">
                  See Full Standings
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Register</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase mb-4" data-testid="text-ready-compete">
            Ready To Compete?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm">
            Register your team and be part of the next Salaam Cup. Compete, connect, and experience the energy of a true multi-sport tournament.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register">
              <Button variant="outline" className="rounded-full border-white text-white bg-transparent px-8 font-bold uppercase text-xs tracking-wider" data-testid="button-register-cta">
                Register Now
              </Button>
            </Link>
            <Link href="/tournaments">
              <Button variant="outline" className="rounded-full border-white text-white bg-transparent px-8 font-bold uppercase text-xs tracking-wider" data-testid="button-tournaments-cta">
                Tournaments
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="q1">
              <AccordionTrigger className="text-left font-bold uppercase text-sm tracking-wide py-5 hover:no-underline">
                What is Salaam Cup?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                Salaam Cup is a premier community sports organization dedicated to hosting high-quality tournaments that unite athletes through competition, faith, and excellence.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger className="text-left font-bold uppercase text-sm tracking-wide py-5 hover:no-underline">
                What makes Salaam Cup different?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                Professional-grade organization, community values, and inclusive approach to sports competition.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger className="text-left font-bold uppercase text-sm tracking-wide py-5 hover:no-underline">
                This league looks too good, can a rookie join?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                We welcome players of all skill levels with both competitive and recreational divisions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4">
              <AccordionTrigger className="text-left font-bold uppercase text-sm tracking-wide py-5 hover:no-underline">
                Can I join alone or do I have to have a team?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                You can register as a free agent and we will help connect you with teams looking for players.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q5">
              <AccordionTrigger className="text-left font-bold uppercase text-sm tracking-wide py-5 hover:no-underline">
                How can I volunteer or sponsor the tournament?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                Please reach out through our Contact page or email info@salaamcup.com.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </MainLayout>
  );
}

function MatchRow({ match }: { match: MatchWithTeams }) {
  const matchDate = match.startTime ? new Date(match.startTime) : null;
  const isLive = match.status === "live";
  const isFinal = match.status === "final";
  const isScheduled = match.status === "scheduled";

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
      </div>

      <div className="flex-1 text-right min-w-0">
        <Link href={match.homeTeam ? `/teams/${match.homeTeamId}` : "#"}>
          <span className="font-bold text-sm md:text-base hover:underline">{match.homeTeam?.name || "TBD"}</span>
        </Link>
      </div>

      <div className="flex flex-col items-center shrink-0 px-2 md:px-4">
        <div className="text-xs text-muted-foreground mb-1">{match.round || ""}</div>
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
