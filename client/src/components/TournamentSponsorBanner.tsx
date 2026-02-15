import { useState, useEffect } from "react";
import type { TournamentSponsor } from "@shared/schema";

export function TournamentSponsorBanner({ sponsors }: { sponsors: TournamentSponsor[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sponsors.length]);

  if (!sponsors.length) return null;

  const current = sponsors[currentIndex];

  return (
    <section
      className="w-full max-w-[1500px] sm:w-[700px] md:w-[700px] lg:w-[1000px] xl:w-[1250px] 2xl:w-[1500px] mx-auto bg-muted/40"
      data-testid="tournament-sponsor-banner"
    >
      <div className="flex flex-col items-center justify-center py-4 gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Golden Sponsors
        </span>
        <a
          href={current.websiteUrl || "#"}
          target={current.websiteUrl ? "_blank" : undefined}
          rel={current.websiteUrl ? "noopener noreferrer" : undefined}
          className="flex items-center justify-center transition-opacity duration-500"
          data-testid={`tournament-sponsor-${current.id}`}
        >
          <img
            src={current.logoUrl}
            alt={current.name}
            className="relative max-w-[1500px] h-[200px] sm:h-[200px] sm:w-[700px] md:h-[200px] md:w-[700px] lg:h-[225px] lg:w-[1000px] xl:h-[275px] xl:w-[1250px] 2xl:h-[350px] 2xl:w-[1500px] overflow-hidden mx-auto  "
          />
        </a>
        {sponsors.length > 1 && (
          <div className="flex gap-1.5 mt-1">
            {sponsors.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-foreground" : "bg-muted-foreground/30"}`}
                data-testid={`sponsor-dot-${i}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
