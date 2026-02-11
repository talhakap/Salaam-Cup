import { MainLayout } from "@/components/MainLayout";
import { SponsorBar } from "@/components/SponsorBar";
import { ReadyToCompete } from "@/components/ReadyToCompete";
import { useAboutContent } from "@/hooks/use-about-content";
import { useTournaments } from "@/hooks/use-tournaments";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useRef, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DOMPurify from "dompurify";
import type { Tournament, Sport } from "@shared/schema";
import heroImg from "/images/hero-about.png";

const sportLogoMap: Record<string, string> = {
  hockey: "/images/logo-hockey.png",
  basketball: "/images/logo-basketball.png",
  softball: "/images/logo-softball.png",
  soccer: "/images/logo-soccer.png",
};

const sportBgMap: Record<string, string> = {
  hockey: "/images/bg-hockey.png",
  basketball: "/images/bg-basketball.png",
  softball: "/images/bg-softball.png",
  soccer: "/images/bg-soccer.png",
};

const valueCards = [
  { title: "Content Media Team", image: "/images/hero-media.png" },
  { title: "Engaging Community", image: "/images/hero-about.png" },
  { title: "Real Competition", image: "/images/hero-tournaments.png" },
  { title: "Professional Staff", image: "/images/hero-register.png" },
];

const momentsImages = [
  "/images/hero-landing.png",
  "/images/hero-about.png",
  "/images/hero-tournaments.png",
  "/images/hero-media.png",
  "/images/hero-register.png",
  "/images/hero-landing.png",
];

const admireItems = [
  { name: "Muhammad Naim", title: "Muslim Community Awards", image: "/images/hero-about.png" },
  { name: "Muhammad Naim", title: "Hallamand Sports Club", image: "/images/hero-media.png" },
];

const celebrationImages = [
  "/images/hero-landing.png",
  "/images/hero-tournaments.png",
  "/images/hero-media.png",
  "/images/hero-register.png",
];

function UpcomingEventsCarousel({ tournaments, sports }: { tournaments: Tournament[]; sports: Sport[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragOffset = useRef(0);
  const sportMap = new Map(sports.map(s => [s.id, s]));

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, tournaments.length - 1));
    setActiveIndex(clamped);
  }, [tournaments.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragOffset.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    dragOffset.current = e.clientX - dragStartX.current;
  };
  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset.current < -50) goTo(activeIndex + 1);
    else if (dragOffset.current > 50) goTo(activeIndex - 1);
  };

  useEffect(() => {
    if (tournaments.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % tournaments.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tournaments.length]);

  if (tournaments.length === 0) return null;

  return (
    <div className="relative">
      <div
        className="overflow-hidden touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {tournaments.map((t) => {
            const sport = t.sportId ? sportMap.get(t.sportId) : null;
            const nameLC = t.name.toLowerCase();
            const detectedIcon = sport?.icon
              || (nameLC.includes("hockey") ? "hockey"
                : nameLC.includes("basketball") ? "basketball"
                : nameLC.includes("softball") ? "softball"
                : nameLC.includes("soccer") || nameLC.includes("football") ? "soccer"
                : "hockey");
            const logo = sportLogoMap[detectedIcon] || sportLogoMap.hockey;
            const bg = sportBgMap[detectedIcon] || sportBgMap.hockey;
            const dateStr = t.startDate
              ? (() => { try { return format(parseISO(t.startDate), "MMM d, yyyy"); } catch { return t.startDate; } })()
              : "TBD";

            return (
              <div key={t.id} className="w-full flex-shrink-0 px-4 md:px-12" data-testid={`about-card-upcoming-${t.id}`}>
                <Link href={`/tournaments/${t.id}`} className="block relative rounded-xl overflow-hidden max-w-md mx-auto aspect-square cursor-pointer">
                  <div className="absolute inset-0">
                    <img src={bg} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50" />
                  </div>
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
                    <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]">
                      <img src={logo} alt={t.name} className="w-full h-full object-contain drop-shadow-lg" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold font-display uppercase text-white tracking-wide mt-2" data-testid={`text-about-upcoming-name-${t.id}`}>
                      {t.name}
                    </h3>
                    <div className="text-xs md:text-sm text-gray-300 font-semibold mt-1">{dateStr}</div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {tournaments.length > 1 && (
        <>
          <button
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-muted-foreground/60 hover:text-foreground transition-colors"
            data-testid="button-about-upcoming-prev"
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-muted-foreground/60 hover:text-foreground transition-colors"
            data-testid="button-about-upcoming-next"
            disabled={activeIndex === tournaments.length - 1}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="flex justify-center gap-2 mt-6">
            {tournaments.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-3 h-3 rounded-full transition-colors ${i === activeIndex ? "bg-foreground" : "bg-muted-foreground/30"}`}
                data-testid={`button-about-upcoming-dot-${i}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function About() {
  const { data: aboutContentData } = useAboutContent();
  const { data: tournaments } = useTournaments();
  const { data: sports } = useQuery<Sport[]>({ queryKey: ["/api/sports"] });

  const upcomingTournaments = (tournaments || []).filter(t => t.status === "active" || t.status === "upcoming");

  return (
    <MainLayout>
      {/* Hero - WHO WE ARE */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden" data-testid="hero-about">
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="Who We Are" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white uppercase leading-none tracking-tight" data-testid="text-hero-about-title">
            Who We Are
          </h1>
        </div>
      </section>

      {/* Sponsor Bar */}
      <SponsorBar />

      {/* Letter / PDF Section */}
      <section className="py-16 md:py-24 bg-background" data-testid="section-about-letter">
        <div className="container mx-auto px-4 max-w-4xl">
          {aboutContentData?.contentType === "pdf" && aboutContentData.pdfUrl ? (
            <div className="w-full" data-testid="about-pdf-embed">
              <iframe
                src={aboutContentData.pdfUrl}
                className="w-full min-h-[600px] md:min-h-[800px] border border-border rounded-md"
                title="About Us Letter"
              />
            </div>
          ) : aboutContentData?.contentType === "richtext" && aboutContentData.richTextContent ? (
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aboutContentData.richTextContent) }}
              data-testid="about-richtext-content"
            />
          ) : (
            <div className="text-center text-muted-foreground py-12" data-testid="about-letter-placeholder">
              <p className="text-sm">Content coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* RELIVE THE BEST MOMENTS WITH US */}
      <section className="py-16 md:py-24 bg-muted" data-testid="section-moments">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-display uppercase leading-tight" data-testid="text-moments-title">
              Relive The Best Moments<br />With Us.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
            {momentsImages.map((img, i) => (
              <div key={i} className="aspect-[4/3] rounded-md overflow-hidden" data-testid={`img-moment-${i}`}>
                <img src={img} alt={`Moment ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Beginnings / How We Grew */}
      <section className="py-16 md:py-24 bg-background" data-testid="section-history">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div data-testid="section-beginnings">
              <h3 className="text-2xl md:text-3xl font-bold font-display uppercase mb-4">Our Beginnings</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                What started as a small community gathering has grown into one of the most anticipated sporting events in the Muslim community. 
                Our founders saw the need for organized, professional-level tournaments that bring people together through the love of sport. 
                The first Salaam Cup was held with just a handful of teams and a dream to create something bigger. That dream has become a reality.
              </p>
            </div>
            <div data-testid="section-how-we-grew">
              <h3 className="text-2xl md:text-3xl font-bold font-display uppercase mb-4">How We Grew</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Year after year, the Salaam Cup has expanded to include multiple sports, more divisions, and athletes from across the region. 
                Through word of mouth, social media presence, and the passion of our community, we have grown from a single tournament 
                to a multi-sport organization. Our growth is a testament to the dedication of our volunteers, sponsors, and every athlete 
                who steps onto the field.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ANYONE CAN PLAY, FEW COMPETE */}
      <section className="py-16 md:py-24 bg-background" data-testid="section-values">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-display uppercase mb-4" data-testid="text-values-about-title">
              Anyone Can Play. Few Compete.
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Join athletes who don't just show up to play. They show up to dominate and build legacy.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {valueCards.map((card) => (
              <div key={card.title} className="relative aspect-[4/3] rounded-md overflow-hidden group" data-testid={`card-about-value-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold font-display text-sm md:text-base uppercase underline decoration-1 underline-offset-4">
                    {card.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WE ADMIRE THEM */}
      <section className="py-16 md:py-24 bg-muted" data-testid="section-admire">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-display uppercase" data-testid="text-admire-title">
              We Admire Them
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {admireItems.map((item, i) => (
              <div key={i} className="text-center" data-testid={`card-admire-${i}`}>
                <div className="aspect-video rounded-md overflow-hidden mb-4">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-bold font-display uppercase">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE CELEBRATED */}
      <section className="py-16 md:py-24 bg-background" data-testid="section-celebrated">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-display uppercase" data-testid="text-celebrated-title">
              How We Celebrated
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
            {celebrationImages.map((img, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden" data-testid={`img-celebration-${i}`}>
                <img src={img} alt={`Celebration ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="py-16 md:py-24 bg-foreground text-background" data-testid="section-about-upcoming">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-12" data-testid="text-about-upcoming-events">
            Upcoming Events
          </h2>
          {upcomingTournaments.length > 0 && sports ? (
            <UpcomingEventsCarousel tournaments={upcomingTournaments} sports={sports} />
          ) : (
            <p className="text-center text-gray-400 py-8">No upcoming events at this time.</p>
          )}
        </div>
      </section>

      {/* READY TO COMPETE */}
      <ReadyToCompete />
    </MainLayout>
  );
}
