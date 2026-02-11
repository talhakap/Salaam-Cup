import { MainLayout } from "@/components/MainLayout";
import { SponsorBar } from "@/components/SponsorBar";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { useNews } from "@/hooks/use-news";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import heroImg from "/images/hero-landing.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useRef, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Tournament, Division, News, Sport } from "@shared/schema";

const valueCards = [
  {
    tagline: "Compete. Connect. Belong.",
    title: "Amazing Community",
    description: "Community of over 20,000 Athletes living the Brodie lifestyle. Compete with old friends or make new ones!",
    cta: "Register Now",
    href: "/register",
    image: "/images/hero-about.png",
  },
  {
    tagline: "Play by the rules. Win with intensity.",
    title: "Real Competition",
    description: "Structured divisions, refs, scorekeeping, playoffs. Everything feels official and intense.",
    cta: "Tournaments",
    href: "/tournaments",
    image: "/images/hero-tournaments.png",
  },
  {
    tagline: "Relive the best moments.",
    title: "Content Media Team",
    description: "Highlights, photography, social media features, turn tournament moments into shareable content.",
    cta: "Our Gallery",
    href: "/media",
    image: "/images/hero-media.png",
  },
  {
    tagline: "Instant updates. Zero confusion.",
    title: "Professional Stuff",
    description: "On-time scheduling, clear communications, venue management, instant updates, everything handled.",
    cta: "See Our Staff",
    href: "/about",
    image: "/images/hero-register.png",
  },
];


const faqItems = [
  {
    q: "What is Salaam Cup?",
    a: "Salaam Cup is a premier community sports organization dedicated to hosting high-quality tournaments that unite athletes through competition, faith, and excellence. We aim to foster an environment where sportsmanship, teamwork, and community pride come together on and off the field.",
  },
  {
    q: "What makes Salaam Cup different?",
    a: "Salaam Cup stands out for its professional-grade tournament organization, commitment to community values, and inclusive approach to sports. We combine competitive excellence with a welcoming environment for athletes of all skill levels.",
  },
  {
    q: "This league looks too good, can a rookie join?",
    a: "We welcome players of all skill levels. We have divisions designed for competitive play as well as recreational divisions where newer players can develop their skills in a supportive environment.",
  },
  {
    q: "Can I join alone or do I have to have a team?",
    a: "You can register as a free agent and we will help connect you with teams that are looking for players. Alternatively, you can form your own team and register together.",
  },
  {
    q: "How can I volunteer or sponsor the tournament?",
    a: "We are always looking for volunteers and sponsors. Please reach out to us through the Contact page or email info@salaamcup.com to learn about opportunities.",
  },
];

const divisionImages = [
  "/images/hero-landing.png",
  "/images/hero-about.png",
  "/images/hero-tournaments.png",
  "/images/hero-media.png",
  "/images/hero-register.png",
];

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

const sportDescriptions: Record<string, string> = {
  hockey: "Fast-paced ball hockey action with skill, speed, and bragging rights on the line.",
  basketball: "High-flying basketball competition where every dribble, pass, and shot counts.",
  softball: "Step up to the plate for thrilling softball action with heart and pure determination.",
  soccer: "Beautiful game meets fierce rivalry on the pitch with speed, skill, and teamwork.",
};

function EventCardMobile({ logo, sportName, name, desc, dateStr, tournamentId }: {
  logo: string; sportName: string; name: string; desc: string; dateStr: string; tournamentId: number;
}) {
  return (
    <div className="md:hidden absolute inset-0 z-10 flex flex-col items-center justify-end text-center px-4 pb-4">
      <div className="flex-1 flex items-center justify-center w-full">
        <img
          src={logo}
          alt={`${sportName} logo`}
          className="w-[65%] object-contain drop-shadow-lg"
        />
      </div>
      <h3 className="text-base font-bold font-display uppercase text-white tracking-wide mb-0.5" data-testid={`text-upcoming-name-mobile-${tournamentId}`}>
        {name}
      </h3>
      <p className="text-[11px] text-gray-300 max-w-[90%] mb-1 leading-snug line-clamp-2">
        {desc}
      </p>
      <div className="text-[11px] text-gray-200 font-semibold">
        Upcoming Tournaments:
      </div>
      <div className="text-[11px] text-white font-bold">
        {dateStr}
      </div>
    </div>
  );
}

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
          style={{
            transform: `translateX(calc(-${activeIndex * 100}% + ${activeIndex * 0}px))`,
          }}
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
            const desc = sportDescriptions[detectedIcon] || sportDescriptions.hockey;
            const dateStr = t.startDate
              ? (() => { try { return format(parseISO(t.startDate), "MMM d, yyyy"); } catch { return t.startDate; } })()
              : "TBD";

            return (
              <div key={t.id} className="w-full flex-shrink-0 px-4 md:px-12" data-testid={`card-upcoming-${t.id}`}>
                <Link href={`/tournaments/${t.id}`} className="block relative rounded-xl overflow-hidden max-w-2xl mx-auto aspect-square cursor-pointer" data-testid={`link-upcoming-${t.id}`}>
                  <div className="absolute inset-0">
                    <img src={bg} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50" />
                  </div>

                  <div className="hidden md:flex absolute inset-0 z-10 flex-col items-center justify-center text-center group/card">
                    <div className="w-[450px] h-[450px] transition-opacity duration-500 group-hover/card:opacity-0">
                      <img
                        src={logo}
                        alt={`${sport?.name || t.name} logo`}
                        className="w-full h-full object-contain drop-shadow-lg"
                      />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-200/80 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                      <h3 className="text-5xl font-bold font-display uppercase text-black tracking-wide mb-1" data-testid={`text-upcoming-name-${t.id}`}>
                        {t.name}
                      </h3>
                      <p className="text-md text-gray-800 max-w-sm mb-3 leading-snug">
                        {t.description || desc}
                      </p>
                      <div className="text-l text-black font-semibold">
                        Upcoming Tournament:
                      </div>
                      <div className="text-sm text-gray-700 font-bold mt-0.5">
                        {dateStr}
                      </div>
                    </div>
                  </div>

                  <EventCardMobile
                    logo={logo}
                    sportName={sport?.name || t.name}
                    name={t.name}
                    desc={t.description || desc}
                    dateStr={dateStr}
                    tournamentId={t.id}
                  />
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
            data-testid="button-upcoming-prev"
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-muted-foreground/60 hover:text-foreground transition-colors"
            data-testid="button-upcoming-next"
            disabled={activeIndex === tournaments.length - 1}
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="flex justify-center gap-2 mt-6">
            {tournaments.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === activeIndex ? "bg-foreground" : "bg-muted-foreground/30"
                }`}
                data-testid={`button-upcoming-dot-${i}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TournamentAccordionItem({ tournament }: { tournament: Tournament }) {
  const { data: divisions } = useDivisions(tournament.id);

  return (
    <AccordionItem value={String(tournament.id)} className="border-b border-gray-800">
      <div className="pt-4 pb-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Tournaments</span>
      </div>
      <AccordionTrigger
        className="text-2xl md:text-4xl font-bold font-display uppercase py-4 hover:no-underline text-white [&>svg]:text-white"
        data-testid={`accordion-tournament-${tournament.id}`}
      >
        {tournament.name}
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-6 pt-2">
          {divisions && divisions.length > 0 ? (
            divisions.map((div: Division, idx: number) => (
              <div key={div.id} className="flex flex-col" data-testid={`card-division-${div.id}`}>
                <div className="aspect-[4/3] rounded-md overflow-hidden mb-3">
                  <img
                    src={divisionImages[idx % divisionImages.length]}
                    alt={div.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-end justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <h3 className="text-base md:text-xl font-bold font-display text-white">{div.name}</h3>
                  </div>
                  <Link
                    href={`/register?tournament=${tournament.id}&division=${div.id}`}
                    className="shrink-0"
                    data-testid={`button-register-division-${div.id}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-gray-600 text-white bg-transparent text-xs font-medium tracking-wide"
                    >
                      Register Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-3">Divisions coming soon.</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

const ITEMS_PER_PAGE = 3;

function NewsCarousel({ newsItems }: { newsItems: News[] }) {
  const totalPages = Math.ceil(newsItems.length / ITEMS_PER_PAGE);
  const [page, setPage] = useState(0);
  const visible = newsItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visible.map((item) => (
          <div key={item.id} className="flex flex-col" data-testid={`card-news-home-${item.id}`}>
            <div className="aspect-[4/3] rounded-md overflow-hidden mb-3">
              <img
                src={item.imageUrl}
                alt={item.headline}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {(() => { try { return format(parseISO(item.publishedDate), "dd/MM/yyyy"); } catch { return item.publishedDate; } })()}
            </p>
            <h3 className="text-sm font-bold font-display uppercase leading-snug" data-testid={`text-news-home-headline-${item.id}`}>
              {item.headline}
            </h3>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === page ? "bg-foreground" : "bg-muted-foreground/30"
              }`}
              data-testid={`button-news-page-${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { data: tournaments } = useTournaments();
  const { data: newsItems, isLoading: newsLoading } = useNews();
  const { data: sports, isLoading: sportsLoading } = useQuery<Sport[]>({ queryKey: ["/api/sports"] });

  const upcomingTournaments = (tournaments || []).filter(t => t.status === "active" || t.status === "upcoming");

  return (
    <MainLayout>
      <section className="relative h-[80vh] min-h-[550px] flex items-center justify-center overflow-hidden" data-testid="hero-landing">
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white uppercase leading-none tracking-tight max-w-4xl mx-auto" data-testid="text-hero-title">
            Best Muslim Tournaments In The World
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-300 max-w-xl mx-auto">
            For those with integrity, patience, heart
          </p>

          <a
            href="/register"
            className="px-8 py-3 rounded-full bg-white text-black font-semibold text-sm uppercase tracking-wide
                   hover:bg-gray-200 transition"
          >
            Register Now
          </a>
          <a
            href="/tournaments"
            className="px-8 py-3 rounded-full border border-white text-white font-semibold text-sm uppercase tracking-wide
                   hover:bg-white hover:text-black transition"
          >
            Tournaments
          </a>
        </div>
      </section>

      <SponsorBar />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-display uppercase mb-4" data-testid="text-values-title">
              Anyone Can Play. Few Compete.
            </h2>
            <p className="text-muted-foreground">
              Join athletes who don't just show up to play. They show up to dominate and build legacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {valueCards.map((card) => (
              <div key={card.title} className="relative aspect-square rounded-md overflow-hidden" data-testid={`card-value-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-8">
                  <p className="text-xs md:text-sm text-gray-300 italic mb-1">{card.tagline}</p>
                  <h3 className="text-xl md:text-3xl font-bold font-display text-white uppercase mb-2" data-testid={`text-value-title-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300 max-w-xs mb-4 leading-relaxed">
                    {card.description}
                  </p>
                  <Link href={card.href} data-testid={`link-value-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/60 text-white bg-transparent text-xs md:text-sm font-medium tracking-wide uppercase px-6"
                    >
                      {card.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-12" data-testid="text-play-with-us">
            Play With Us
          </h2>

          <div className="max-w-5xl mx-auto">
            {tournaments && tournaments.length > 0 ? (
              <Accordion type="single" collapsible>
                {tournaments.map((t: Tournament) => (
                  <TournamentAccordionItem key={t.id} tournament={t} />
                ))}
              </Accordion>
            ) : (
              <p className="text-center text-gray-500">No tournaments available yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-12" data-testid="text-legacy">
            Where Stories Become Legacy.
          </h2>
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <span className="text-xs text-muted-foreground uppercase tracking-wider border-b pb-2 inline-block">News</span>
              <div className="border-b" />
            </div>
            {newsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col">
                    <div className="aspect-[4/3] rounded-md bg-muted animate-pulse mb-3" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : newsItems && newsItems.length > 0 ? (
              <NewsCarousel newsItems={newsItems} />
            ) : (
              <p className="text-center text-muted-foreground py-8">No news yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-12" data-testid="text-upcoming-events">
            Upcoming Events
          </h2>
          {sportsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-64h-80 rounded-xl bg-muted animate-pulse" />
            </div>
          ) : upcomingTournaments.length > 0 && sports ? (
            <UpcomingEventsCarousel tournaments={upcomingTournaments} sports={sports} />
          ) : (
            <p className="text-center text-muted-foreground py-8">No upcoming events at this time.</p>
          )}
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-12" data-testid="text-faq">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-bold uppercase text-sm md:text-base tracking-wide py-5 hover:no-underline" data-testid={`faq-trigger-${i}`}>
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </MainLayout>
  );
}
