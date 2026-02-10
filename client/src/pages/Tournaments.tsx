import { MainLayout } from "@/components/MainLayout";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTournaments } from "@/hooks/use-tournaments";
import { Loader2 } from "lucide-react";
import heroImg from "/images/hero-tournaments.png";

const fallbackImages = [
  "/images/hero-landing.png",
  "/images/hero-tournaments.png",
  "/images/hero-about.png",
  "/images/hero-media.png",
  "/images/hero-register.png",
];

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
                <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                  <div 
                    className="relative aspect-[4/3] rounded-md overflow-hidden group cursor-pointer"
                    data-testid={`card-tournament-${tournament.id}`}
                  >
                    <img 
                      src={tournament.heroImage || fallbackImages[index % fallbackImages.length]} 
                      alt={tournament.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                      <h3 className="text-white font-bold font-display text-xl md:text-2xl uppercase">
                        {tournament.name}
                      </h3>
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded-sm flex-shrink-0 ${
                        tournament.status === 'active' 
                          ? 'bg-green-500 text-white' 
                          : tournament.status === 'upcoming'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-muted text-muted-foreground'
                      }`} data-testid={`badge-status-${tournament.id}`}>
                        {tournament.status}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      {tournament.description && (
                        <p className="text-white/80 text-sm mb-3 line-clamp-2">
                          {tournament.description}
                        </p>
                      )}
                      <p className="text-white/60 text-xs">
                        {tournament.startDate && tournament.endDate
                          ? `${tournament.startDate} — ${tournament.endDate}`
                          : "Dates TBD"}
                      </p>
                    </div>
                  </div>
                </Link>
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
                    <Button className="rounded-full font-bold uppercase text-xs tracking-wider px-6" data-testid="button-register-now">
                      Register Now
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="rounded-full font-bold uppercase text-xs tracking-wider px-6" data-testid="button-about">
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
