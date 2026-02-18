import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { ReadyToCompete } from "@/components/ReadyToCompete";
import { FAQSection } from "@/components/FAQSection";
import { useTournament, useDivisions } from "@/hooks/use-tournaments";
import { useStandings } from "@/hooks/use-standings";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TournamentNav } from "@/components/TournamentNav";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import type { Division, StandingWithTeam } from "@shared/schema";
import { getStandingsColumns } from "@shared/standingsConfig";

export default function TournamentStandings() {
  const [, params] = useRoute("/tournaments/:id/standings");
  const tournamentSlug = params?.id || "";

  const { data: tournament, isLoading } = useTournament(tournamentSlug);
  const numericId = tournament?.id || 0;
  const { data: divisions } = useDivisions(numericId);
  const { data: allStandings } = useStandings(numericId);

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

  const filteredStandings = (allStandings || [])
    .filter((s: StandingWithTeam) => s.divisionId === Number(selectedDivision))
    .sort((a: StandingWithTeam, b: StandingWithTeam) => (a.position || 0) - (b.position || 0));

  const columns = getStandingsColumns(tournament?.standingsType);

  return (
    <MainLayout>
      <SEO 
        title={tournament ? `${tournament.name} Standings` : "Tournament Standings"}
        description={`Current standings for ${tournament?.name || "Salaam Cup tournament"} in Toronto & GTA. Team rankings, wins, losses, and points.`}
        canonical={`/tournaments/${params?.id}/standings`}
        keywords={`${tournament?.name || ""} standings, team rankings Toronto, tournament results GTA`}
      />
      <HeroSection
        title={tournament.name.replace("Salaam Cup ", "").toUpperCase()}
        image={tournament.heroImage || undefined}
      />
      <SponsorBar />
      <TournamentNav tournamentId={tournamentSlug} />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
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
                    data-testid={`filter-standing-division-${tab.id}`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground italic" data-testid="text-standings-label">Standings</h3>
          </div>

          {filteredStandings.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-foreground">
                  <TableHead className="w-12 font-bold text-foreground">Pos</TableHead>
                  <TableHead className="font-bold text-foreground">Team</TableHead>
                  {columns.map((col) => (
                    <TableHead key={col.key} className={`text-center font-bold text-foreground ${col.key === 'pts' || col.key === 'pct' ? '' : ''}`}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStandings.map((s: StandingWithTeam, index: number) => (
                  <TableRow key={`${s.divisionId}-${s.teamId}`} className="border-b" data-testid={`row-standing-${s.teamId}`}>
                    <TableCell className="font-bold">{s.position || index + 1}</TableCell>
                    <TableCell>
                      <Link href={`/teams/${s.teamId}`} className="font-medium hover:underline flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                          {s.team?.logoUrl ? (
                            <img src={s.team.logoUrl} alt="" className="w-5 h-5 object-contain rounded-full" />
                          ) : (
                            <Users className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
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
          ) : (
            <p className="text-muted-foreground text-center py-12">No standings available yet.</p>
          )}
        </div>
      </section>

      <ReadyToCompete />
      <FAQSection />
    </MainLayout>
  );
}
