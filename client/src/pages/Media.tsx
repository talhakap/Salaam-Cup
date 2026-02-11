import { MainLayout } from "@/components/MainLayout";
import { SponsorBar } from "@/components/SponsorBar";
import { useMediaYears } from "@/hooks/use-media";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MediaYearWithItems } from "@shared/schema";

function MediaCard({ item }: { item: MediaYearWithItems["items"][0] }) {
  return (
    <div className="group" data-testid={`media-card-${item.id}`}>
      <div className="aspect-[4/3] overflow-hidden rounded-md mb-3">
        <img
          src={item.imageUrl}
          alt={item.tournamentName}
          className="w-full h-full object-cover"
          data-testid={`media-card-image-${item.id}`}
        />
      </div>
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider" data-testid={`media-card-category-${item.id}`}>
            {item.category}
          </p>
          <h4 className="font-display text-lg font-bold leading-tight" data-testid={`media-card-name-${item.id}`}>
            {item.tournamentName}
          </h4>
        </div>
        {item.linkUrl && (
          <a
            href={item.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-foreground rounded-full text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
            data-testid={`media-card-link-${item.id}`}
          >
            Show All <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function YearAccordion({ yearData }: { yearData: MediaYearWithItems }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border" data-testid={`media-year-${yearData.year}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left"
        data-testid={`media-year-toggle-${yearData.year}`}
      >
        <h3 className="font-display text-2xl md:text-3xl font-bold">
          {yearData.year} Tournaments
        </h3>
        <ChevronDown
          className={cn(
            "w-6 h-6 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && yearData.items.length > 0 && (
        <div className="pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {yearData.items.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
      {isOpen && yearData.items.length === 0 && (
        <div className="pb-8 text-center text-muted-foreground text-sm">
          No tournaments added for this year yet.
        </div>
      )}
    </div>
  );
}

export default function Media() {
  const { data: mediaYears, isLoading } = useMediaYears();

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <section className="py-16 md:py-24 text-center" data-testid="media-hero">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight mb-6" data-testid="text-media-title">
              OUR GALLERY
            </h1>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight" data-testid="text-media-subtitle">
              PLAY WITH US
            </h2>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16" data-testid="media-years-section">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Tournaments</p>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : mediaYears && mediaYears.length > 0 ? (
            <div>
              {mediaYears.map((yearData, idx) => (
                <YearAccordion key={yearData.id} yearData={yearData} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No media content available yet.</p>
            </div>
          )}
        </section>

        <SponsorBar />
      </div>
    </MainLayout>
  );
}
