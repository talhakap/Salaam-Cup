import { useSponsors } from "@/hooks/use-sponsors";

export function SponsorBar() {
  const { data: sponsorsList } = useSponsors();

  if (!sponsorsList?.length) return null;

  const doubled = [...sponsorsList, ...sponsorsList];

  return (
    <section className="bg-foreground py-6 overflow-hidden" data-testid="sponsor-bar">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-background/60 mb-4 font-medium">
        Sponsors
      </p>
      <div className="relative">
        <div className="flex animate-marquee items-center gap-16">
          {doubled.map((sponsor, i) => (
            <div
              key={`${sponsor.id}-${i}`}
              className="flex-shrink-0"
              data-testid={`sponsor-${sponsor.id}`}
            >
              {sponsor.websiteUrl ? (
                <a href={sponsor.websiteUrl} target="_blank" rel="noreferrer" data-testid={`link-sponsor-${sponsor.id}`}>
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    className="h-12 md:h-16 w-auto max-w-[2000px] object-contain"
                    data-testid={`img-sponsor-${sponsor.id}`}
                  />
                </a>
              ) : (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="h-12 md:h-16 w-auto max-w-[2000px] object-contain"
                  data-testid={`img-sponsor-${sponsor.id}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
