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
    <section className="bg-muted/40" data-testid="tournament-sponsor-banner">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-4 gap-4">
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
              className="h-10 md:h-14 max-w-[200px] md:max-w-[280px] object-contain"
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
      </div>
    </section>
  );
}
