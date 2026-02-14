import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { TournamentNav } from "@/components/TournamentNav";
import { useTournament, useDivisions } from "@/hooks/use-tournaments";
import { useAwards } from "@/hooks/use-awards";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trophy, Users } from "lucide-react";
import { useState } from "react";
import type { Division, Award } from "@shared/schema";

export default function TournamentAwards() {
  const [, params] = useRoute("/tournaments/:id/awards");
  const tournamentSlug = params?.id || "";

  const { data: tournament, isLoading } = useTournament(tournamentSlug);
  const numericId = tournament?.id || 0;
  const { data: divisions } = useDivisions(numericId);
  const { data: allAwards } = useAwards(numericId);

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

  const divisionTabs = divisions?.map((d: Division) => ({ id: String(d.id), label: d.name })) || [];

  const filteredAwards = (allAwards || []).filter(
    (a: Award) => selectedDivision === "all" || a.divisionId === Number(selectedDivision)
  );

  const awardsByCategory = filteredAwards.reduce((acc: Record<string, Award[]>, award: Award) => {
    if (!acc[award.category]) acc[award.category] = [];
    acc[award.category].push(award);
    return acc;
  }, {} as Record<string, Award[]>);

  const categoryOrder = ["Champions", "Runner Up", "Champions MVP", "Runner Up MVP", "Most Valuable Player", "Best Goalkeeper", "Top Scorer"];
  const sortedCategories = Object.keys(awardsByCategory).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const selectedDiv = divisions?.find((d: Division) => String(d.id) === selectedDivision);

  return (
    <MainLayout>
      <SEO 
        title={tournament ? `${tournament.name} Awards` : "Tournament Awards"}
        description={`Awards and recognition for ${tournament?.name || "Salaam Cup tournament"} in the GTA. Champions, MVPs, and special awards.`}
        canonical={`/tournaments/${params?.id}/awards`}
        keywords={`${tournament?.name || ""} awards, tournament champions Toronto, MVP GTA`}
      />
      <HeroSection title="Awards" image={tournament.heroImage || undefined} size="small" />
      <SponsorBar />
      <TournamentNav tournamentId={tournamentSlug} />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-4" data-testid="text-awards-heading">
            We Create Champions
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-10">Last Awards Winners</p>

          {divisionTabs.length > 0 && (
            <div className="flex justify-center mb-10">
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant={selectedDivision === "all" ? "default" : "outline"}
                  className="rounded-full text-xs font-bold uppercase tracking-wider"
                  onClick={() => setSelectedDivision("all")}
                  data-testid="filter-awards-all"
                >
                  All
                </Button>
                {divisionTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={selectedDivision === tab.id ? "default" : "outline"}
                    className="rounded-full text-xs font-bold uppercase tracking-wider"
                    onClick={() => setSelectedDivision(tab.id)}
                    data-testid={`filter-awards-division-${tab.id}`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {sortedCategories.length > 0 ? (
            <div className="space-y-12">
              {sortedCategories.map((category) => {
                const categoryAwards = awardsByCategory[category];
                const divName = selectedDiv ? `${selectedDiv.name} ` : "";
                return (
                  <div key={category}>
                    <h3 className="text-xl md:text-2xl font-bold font-display uppercase mb-6" data-testid={`text-award-category-${category.replace(/\s+/g, '-').toLowerCase()}`}>
                      {divName}{category}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
                      {categoryAwards
                        .sort((a, b) => (b.year || 0) - (a.year || 0))
                        .map((award: Award) => (
                        <div key={award.id} className="text-center" data-testid={`card-award-${award.id}`}>
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                            <img
                              src={award.teamLogoUrl || "/images/salaam-cup-logo-black.png"}
                              alt={award.teamName || award.playerName || ""}
                              className="w-14 h-14 object-contain rounded-full"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{award.year}</p>
                          {category === "Champions" || category === "Runner Up" ? (
                            <p className="text-sm font-bold font-display uppercase leading-tight">
                              {award.teamName || "TBD"}
                            </p>
                          ) : (
                            <>
                              <p className="text-sm font-bold font-display uppercase leading-tight">
                                {award.playerName || "TBD"}
                              </p>
                              {award.teamName && (
                                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                                  {award.teamName}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12" data-testid="text-no-awards">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No awards have been added yet.</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
