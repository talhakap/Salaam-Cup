import { MainLayout } from "@/components/MainLayout";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import heroImg from "/images/hero-tournaments.png";

const sportCategories = [
  {
    name: "Ball Hockey Mens",
    description: "Fast paced ball hockey action with skill, speed, and strategy. Bringing a new era to the streets.",
    image: "/images/hero-landing.png",
    upcoming: "TBD",
  },
  {
    name: "Ball Hockey Boys",
    description: "Fast paced ball hockey action with skill, speed, and hustle. Bringing a new era to the streets.",
    image: "/images/hero-landing.png",
    upcoming: "TBD",
  },
  {
    name: "Ball Hockey Girls",
    description: "Fast paced ball hockey action with skill, speed, and strategy. Bringing a new era to the streets.",
    image: "/images/hero-landing.png",
    upcoming: "TBD",
  },
  {
    name: "Softball Mens",
    description: "Step up to the plate - power hits, team chemistry, and adrenaline-packed innings.",
    image: "/images/hero-tournaments.png",
    upcoming: "TBD",
  },
  {
    name: "Softball Womens",
    description: "Step up to the plate - power hits, team chemistry, and adrenaline-packed innings.",
    image: "/images/hero-tournaments.png",
    upcoming: "TBD",
  },
  {
    name: "Basketball Mens",
    description: "High tempo games, instant competition, fast paced action and pure basketball.",
    image: "/images/hero-about.png",
    upcoming: "TBD",
  },
  {
    name: "Soccer Boys",
    description: "Fast breaks, high pressure and goals galore. The beautiful game at its finest.",
    image: "/images/hero-media.png",
    upcoming: "TBD",
  },
];

export default function Tournaments() {
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

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {sportCategories.map((cat) => (
              <div 
                key={cat.name} 
                className="relative aspect-[4/3] rounded-md overflow-hidden group cursor-pointer"
                data-testid={`card-sport-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                <div className="absolute top-4 left-4 right-4">
                  <h3 className="text-white font-bold font-display text-xl md:text-2xl uppercase">
                    {cat.name}
                  </h3>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white/80 text-sm mb-3 line-clamp-2">
                    {cat.description}
                  </p>
                  <p className="text-white/60 text-xs">
                    Upcoming Tournaments: <span className="text-white">{cat.upcoming}</span>
                  </p>
                </div>
              </div>
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
        </div>
      </section>
    </MainLayout>
  );
}
