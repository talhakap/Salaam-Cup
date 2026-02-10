const sponsors = [
  { name: "D Spot Dessert Cafe", id: "dspot" },
  { name: "Sahara Supplements", id: "sahara" },
  { name: "Gladiator Burger", id: "gladiator" },
  { name: "NISA Foundation", id: "nisa" },
];

interface SponsorBarProps {
  variant?: "light" | "dark";
}

export function SponsorBar({ variant = "light" }: SponsorBarProps) {
  const bgClass = variant === "dark" ? "bg-foreground text-background" : "bg-background";

  return (
    <section className={`py-6 ${bgClass}`} data-testid="sponsor-bar">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">Sponsors</p>
        <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
          {sponsors.map((sponsor) => (
            <div 
              key={sponsor.id} 
              className="text-sm md:text-base font-bold font-display uppercase tracking-wide opacity-60 hover:opacity-100 transition-opacity"
              data-testid={`sponsor-${sponsor.id}`}
            >
              {sponsor.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
