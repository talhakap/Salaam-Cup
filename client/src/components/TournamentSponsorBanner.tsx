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
      className="relative max-w-[1500px] sm:w-[700px] md:w-[700px] lg:w-[1000px] xl:w-[1250px] 2xl:w-[1500px] overflow-hidden mx-auto bg-muted/40 rounded-md"
      data-testid="tournament-sponsor-banner"
    >
      <div className="flex items-center justify-center py-3 gap-4">
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium shrink-0">
          Sponsored by
        </span>
        <a
          href={current.websiteUrl || "#"}
          target={current.websiteUrl ? "_blank" : undefined}
          rel={current.websiteUrl ? "noopener noreferrer" : undefined}
          className="flex items-center gap-3 transition-opacity duration-500"
          data-testid={`tournament-sponsor-${current.id}`}
        >
          <img
            src={current.logoUrl}
            alt={current.name}
            className="h-8 md:h-12 max-w-[180px] md:max-w-[260px] object-contain"
          />
        </a>
        {sponsors.length > 1 && (
          <div className="flex gap-1 ml-2">
            {sponsors.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? "bg-foreground" : "bg-muted-foreground/30"}`}
                data-testid={`sponsor-dot-${i}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
