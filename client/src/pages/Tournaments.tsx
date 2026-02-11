import { MainLayout } from "@/components/MainLayout";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTournaments } from "@/hooks/use-tournaments";
import { Loader2 } from "lucide-react";
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
  const statusLabel = tournament.status === "upcoming" ? "TBD" : tournament.status === "active" ? "Live" : "Completed";

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

            <div className="flex-1 flex items-center justify-center">
              {tournament.logoUrl ? (
                <img
                  src={tournament.logoUrl}
                  alt={`${tournament.name} logo`}
                  className="max-h-28 md:max-h-36 w-auto object-contain drop-shadow-lg"
                  data-testid={`img-tournament-logo-${tournament.id}`}
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-white/60 font-display text-3xl md:text-4xl font-bold uppercase">
                    {tournament.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="w-full text-center space-y-2">
              {tournament.description && (
                <p className="text-white/70 text-xs md:text-sm line-clamp-2 leading-relaxed">
                  {tournament.description}
                </p>
              )}
              <p className="text-white/50 text-xs">
                Upcoming Tournaments: <span className="font-semibold text-white/80">{statusLabel}</span>
              </p>
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

              <div className="flex flex-col items-center justify-center p-8 border border-border rounded-md" data-testid="card-ready-compete">
                <h3 className="text-2xl md:text-3xl font-bold font-display uppercase text-center mb-4">
                  Ready To Compete?
                </h3>
                <p className="text-muted-foreground text-center text-sm mb-6 max-w-sm">
                  Register your team and be part of the next Salaam Cup. Compete, connect, and experience the energy of a true multi-sport tournament.
                </p>
                <div className="flex gap-3 flex-wrap justify-center">
                  <Link href="/register">
                    <Button className="font-bold uppercase text-xs tracking-wider" data-testid="button-register-now">
                      Register Now
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="font-bold uppercase text-xs tracking-wider" data-testid="button-about">
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
