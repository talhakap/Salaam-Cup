import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { News } from "@shared/schema";

interface TournamentNewsBannerProps {
  newsItems: News[];
}

export function TournamentNewsBanner({ newsItems }: TournamentNewsBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    if (newsItems.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
      setIsTransitioning(false);
    }, 300);
  }, [newsItems.length]);

  const goToPrev = useCallback(() => {
    if (newsItems.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
      setIsTransitioning(false);
    }, 300);
  }, [newsItems.length]);

  useEffect(() => {
    if (newsItems.length <= 1) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [newsItems.length, goToNext]);

  if (!newsItems || newsItems.length === 0) return null;

  const currentItem = newsItems[currentIndex];

  return (
    <section className="relative w-full h-[300px] md:h-[400px] overflow-hidden" data-testid="tournament-news-banner">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
        style={{ backgroundImage: `url(${currentItem.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      <div className="relative h-full flex items-end">
        <div className="container mx-auto px-4 pb-8 md:pb-12 w-full">
          <h3
            className={`text-white text-lg md:text-2xl lg:text-3xl font-bold font-display uppercase max-w-3xl leading-tight transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            data-testid={`news-headline-${currentItem.id}`}
          >
            {currentItem.headline}
          </h3>
        </div>
      </div>

      {newsItems.length > 1 && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full"
            onClick={goToPrev}
            data-testid="button-news-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full"
            onClick={goToNext}
            data-testid="button-news-next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {newsItems.map((_, idx) => (
              <button
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentIndex ? "bg-white" : "bg-white/40"}`}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(idx);
                    setIsTransitioning(false);
                  }, 300);
                }}
                data-testid={`button-news-dot-${idx}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
