import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { ReadyToCompete } from "@/components/ReadyToCompete";
import { FAQSection } from "@/components/FAQSection";
import { useTournament, useDivisions } from "@/hooks/use-tournaments";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Division } from "@shared/schema";

export default function TournamentRules() {
  const [, params] = useRoute("/tournaments/:id/rules");
  const tournamentId = Number(params?.id);

  const { data: tournament, isLoading } = useTournament(tournamentId);
  const { data: divisions } = useDivisions(tournamentId);

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
  const selectedDiv = divisions?.find((d: Division) => String(d.id) === selectedDivision);
  const displayName = selectedDiv ? `${selectedDiv.category || ""} ${selectedDiv.name} Rules`.trim() : "Rules";

  return (
    <MainLayout>
      <HeroSection title="Divisions & Rules" image={tournament.heroImage || undefined} size="small" />
      <SponsorBar />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          {divisionTabs.length > 0 && (
            <div className="flex justify-center mb-10">
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant={selectedDivision === "all" ? "default" : "outline"}
                  className="rounded-full text-xs font-bold uppercase tracking-wider"
                  onClick={() => setSelectedDivision("all")}
                  data-testid="filter-rules-all"
                >
                  All
                </Button>
                {divisionTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={selectedDivision === tab.id ? "default" : "outline"}
                    className="rounded-full text-xs font-bold uppercase tracking-wider"
                    onClick={() => setSelectedDivision(tab.id)}
                    data-testid={`filter-rules-division-${tab.id}`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-2xl md:text-4xl font-bold font-display uppercase text-center mb-12" data-testid="text-rules-title">
            {displayName}
          </h2>

          {selectedDiv ? (
            <div className="space-y-10">
              {selectedDiv.description ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedDiv.description}</p>
                </div>
              ) : null}

              <div>
                <h3 className="text-xl font-bold font-display uppercase mb-4">General Rules</h3>
                <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
                  <li>All players must be registered and verified before participating in any match.</li>
                  <li>Teams must have a minimum roster size to be eligible for play.</li>
                  <li>Game format: {selectedDiv.gameFormat || "Standard format"}</li>
                  <li>All participants must adhere to the code of conduct and sportsmanship guidelines.</li>
                  <li>The tournament committee reserves the right to make final decisions on all disputes.</li>
                </ul>
              </div>

              {selectedDiv.registrationFee && (
                <div>
                  <h3 className="text-xl font-bold font-display uppercase mb-4">Registration</h3>
                  <p className="text-sm text-muted-foreground">
                    Registration fee: <span className="font-bold text-foreground">${selectedDiv.registrationFee}</span> per team
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Select a division above to view its rules and details.</p>
            </div>
          )}
        </div>
      </section>

      <ReadyToCompete />
      <FAQSection />
    </MainLayout>
  );
}
