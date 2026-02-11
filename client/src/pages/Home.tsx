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
import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { Tournament, Division, News } from "@shared/schema";

const valueCards = [
  { title: "Amazing Community", image: "/images/hero-about.png" },
  { title: "Real Competition", image: "/images/hero-tournaments.png" },
  { title: "Content Media Team", image: "/images/hero-media.png" },
  { title: "Professional Staff", image: "/images/hero-register.png" },
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

  const upcomingTournaments = tournaments?.filter(t => t.status === 'active' || t.status === 'upcoming').slice(0, 2);

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

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {valueCards.map((card) => (
              <div key={card.title} className="relative aspect-[4/3] rounded-md overflow-hidden group" data-testid={`card-value-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
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

      {upcomingTournaments && upcomingTournaments.length > 0 && (
        <section className="py-20 bg-foreground text-background">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Upcoming Events</p>
            <h2 className="text-3xl md:text-5xl font-bold font-display uppercase mb-8" data-testid="text-upcoming">
              {upcomingTournaments[0].name.replace('Salaam Cup ', '').toUpperCase()}
            </h2>
            <p className="text-gray-400 mb-2 text-sm">
              Tournament will take place {upcomingTournaments[0].startDate} - {upcomingTournaments[0].endDate}
            </p>
            <div className="mt-8">
              <Link href="/tournaments">
                <Button variant="outline" className="rounded-full border-white text-white bg-transparent px-8 font-bold uppercase text-xs tracking-wider" data-testid="button-upcoming-tournaments">
                  Upcoming Tournaments
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

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
