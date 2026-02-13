import { MainLayout } from "@/components/MainLayout";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import heroImg from "/images/tournament-hero-home.png";

const fallbackImages = [
  "/images/hero-landing.png",
  "/images/hero-tournaments.png",
  "/images/hero-about.png",
  "/images/hero-media.png",
  "/images/hero-register.png",
];

function TournamentCard({ tournament, index }: { tournament: any; index: number }) {
  const bgImage = tournament.heroImage || fallbackImages[index % fallbackImages.length];
  const { data: divisions } = useDivisions(Number(tournament.id));

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <div
        className="relative rounded-md overflow-hidden group cursor-pointer bg-black"
        data-testid={`card-tournament-${tournament.id}`}
      >
        <div className="relative aspect-[4/3]">
          <img
            src={bgImage}
            alt={tournament.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />

          <div className="absolute inset-0 flex flex-col items-center justify-between p-5">
            <h3
              className="text-white font-bold font-display text-lg md:text-xl uppercase tracking-wide text-center w-full"
              data-testid={`text-tournament-name-${tournament.id}`}
            >
              {tournament.name}
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              {tournament.logoUrl ? (
                <img
                  src={tournament.logoUrl}
                  alt={`${tournament.name} logo`}
                  className="max-h-24 md:max-h-28 w-auto object-contain drop-shadow-lg"
                  data-testid={`img-tournament-logo-${tournament.id}`}
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-white/60 font-display text-2xl md:text-3xl font-bold uppercase">
                    {tournament.name.charAt(0)}
                  </span>
                </div>
              )}

              {divisions && divisions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5" data-testid={`divisions-list-${tournament.id}`}>
                  {divisions.map((div: any) => (
                    <span
                      key={div.id}
                      className="text-[10px] md:text-xs text-white/80 bg-white/15 px-2 py-0.5 rounded-full font-medium"
                      data-testid={`division-tag-${div.id}`}
                    >
                      {div.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full text-center space-y-1.5">
              {tournament.status === "upcoming" && tournament.startDate && (
                <div className="flex items-center justify-center gap-1.5 text-white/80" data-testid={`date-${tournament.id}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs md:text-sm font-medium">
                    {format(new Date(tournament.startDate), 'MMM d')}
                    {tournament.endDate && ` - ${format(new Date(tournament.endDate), 'MMM d, yyyy')}`}
                  </span>
                </div>
              )}
              {tournament.status !== "upcoming" && (
                <p className="text-white/50 text-xs">
                  {tournament.status === "active" ? "Live Now" : "Completed"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Tournaments() {
  const { data: tournaments, isLoading } = useTournaments();

  return (
    <MainLayout>
      <SEO 
        title="Tournaments"
        description="Browse all Salaam Cup tournaments across Toronto and the GTA. Ball hockey, basketball, soccer, and softball competitions for the Muslim community."
        canonical="/tournaments"
        keywords="sports tournaments Toronto, Muslim league GTA, ball hockey tournament, basketball competition Toronto, soccer tournament Mississauga"
      />
      <HeroSection title="Tournaments" image={heroImg} />
      <SponsorBar />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display uppercase italic mb-4" data-testid="text-journey-title">
              Your Journey To The Cup Begins Here
            </h2>
            <p className="text-muted-foreground">
              Every tournament. One goal...<br />to lift the cup.
            </p>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold font-display uppercase text-center mb-10" data-testid="text-pick-tournament">
            Pick Your Tournament
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !tournaments || tournaments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No tournaments available yet</p>
              <p className="text-sm mt-1">Check back soon for upcoming tournaments.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {tournaments.map((tournament, index) => (
                <TournamentCard key={tournament.id} tournament={tournament} index={index} />
              ))}

              <div className="flex flex-col items-center justify-center bg-stone-200 p-8 border border-border rounded-md " data-testid="card-ready-compete">
                <h3 className="text-2xl md:text-3xl font-bold font-display uppercase text-center mb-4">
                  Ready To Compete?
                </h3>
                <p className="text-muted-foreground text-center text-sm mb-6 max-w-sm">
                  Register your team and be part of the next Salaam Cup. Compete, connect, and experience the energy of a true multi-sport tournament.
                </p>
                <div className="flex gap-3 flex-wrap justify-center">
                  <Link href="/register">
                    <Button className="font-bold uppercase text-xs tracking-wider hover:bg-white hover:text-stone-800" data-testid="button-register-now">
                      Register Now
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="font-bold uppercase hover:bg-stone-700 hover:text-white text-xs tracking-wider" data-testid="button-about">
                      About
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
