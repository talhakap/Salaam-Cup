import { MainLayout } from "@/components/MainLayout";
import { useTournaments } from "@/hooks/use-tournaments";
import { TournamentCard } from "@/components/TournamentCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Users, Shield } from "lucide-react";
import { Link } from "wouter";
import heroImg from "/images/hero-landing.png";

export default function Home() {
  const { data: tournaments, isLoading } = useTournaments();
  
  const featuredTournaments = tournaments?.filter(t => t.isFeatured || t.status === 'upcoming').slice(0, 3);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Descriptive alt for Unsplash backup */}
        {/* athletic sports team huddle stadium lights */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Sports Stadium" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 pt-20">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-bold font-display uppercase leading-none mb-6 text-shadow-lg">
              Forge Your <br/> <span className="text-primary">Legacy</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg font-light">
              The premier platform for community sports leagues. Register your team, manage your roster, and compete for glory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 h-14 uppercase tracking-wide font-bold">
                  Register Now
                </Button>
              </Link>
              <Link href="/tournaments">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-secondary text-lg px-8 h-14 uppercase tracking-wide font-bold">
                  View Tournaments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold font-display mb-2">50+</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">Teams</div>
            </div>
            <div>
              <div className="text-4xl font-bold font-display mb-2">1000+</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold font-display mb-2">12</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">Tournaments</div>
            </div>
            <div>
              <div className="text-4xl font-bold font-display mb-2">$5k</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">Prizes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-secondary uppercase mb-2">
                Featured Tournaments
              </h2>
              <p className="text-muted-foreground">Join the action in our upcoming events.</p>
            </div>
            <Link href="/tournaments">
              <Button variant="ghost" className="hidden md:flex gap-2 text-primary hover:text-primary/80">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredTournaments?.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          )}

          <div className="mt-8 md:hidden">
            <Link href="/tournaments">
              <Button className="w-full">View All Tournaments</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features / Value Prop */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-secondary uppercase mb-4">
              Why Choose Salaam Cup?
            </h2>
            <p className="text-muted-foreground">
              We provide a professional league experience for every player.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                From live stats to professional referees, we treat every game like a final.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Building brotherhood and sisterhood through healthy competition.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fair Play</h3>
              <p className="text-muted-foreground leading-relaxed">
                Strict adherence to rules and sportsmanship ensures a safe environment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
