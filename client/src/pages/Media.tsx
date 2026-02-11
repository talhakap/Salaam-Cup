import { MainLayout } from "@/components/MainLayout";
import { SponsorBar } from "@/components/SponsorBar";
import { useMediaYears } from "@/hooks/use-media";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";
import type { MediaYearWithItems } from "@shared/schema";

function MediaCard({ item }: { item: MediaYearWithItems["items"][0] }) {
  return (
    <div data-testid={`media-card-${item.id}`}>
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
            data-testid={`media-card-link-${item.id}`}
          >
            <Button variant="outline" size="sm" className="rounded-full gap-1.5">
              Show All <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
        )}
      </div>
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
            <Accordion type="multiple" className="w-full">
              {mediaYears.map((yearData) => (
                <AccordionItem key={yearData.id} value={`year-${yearData.id}`} data-testid={`media-year-${yearData.year}`}>
                  <AccordionTrigger className="py-5" data-testid={`media-year-toggle-${yearData.year}`}>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-left">
                      {yearData.year} Tournaments
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    {yearData.items.length > 0 ? (
                      <div className="pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {yearData.items.map((item) => (
                            <MediaCard key={item.id} item={item} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="pb-4 text-center text-muted-foreground text-sm">
                        No tournaments added for this year yet.
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
