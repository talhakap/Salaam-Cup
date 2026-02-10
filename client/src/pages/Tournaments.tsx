import { MainLayout } from "@/components/MainLayout";
import { useTournaments } from "@/hooks/use-tournaments";
import { TournamentCard } from "@/components/TournamentCard";
import heroImg from "/images/hero-tournaments.png";

export default function Tournaments() {
  const { data: tournaments, isLoading } = useTournaments();

  return (
    <MainLayout>
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        {/* soccer tournament field wide angle */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg}
            alt="Tournaments" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply" />
        </div>
        <div className="container relative z-10 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-display uppercase text-white mb-4">
            Tournaments
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Find your next challenge. Browse our upcoming and active leagues.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20">Loading tournaments...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments?.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          )}
          
          {tournaments?.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No tournaments found. Check back soon!
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
