import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useCaptainAuth } from "@/hooks/use-captain-auth";
import { useQuery } from "@tanstack/react-query";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { 
  Menu, 
  X, 
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Sport, Tournament, Division } from "@shared/schema";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { captain, logout: captainLogout, isAuthenticated: isCaptainAuth } = useCaptainAuth();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Tournaments", href: "/tournaments", hasDropdown: true },
    { label: "Media", href: "/media" },
    { label: "Contact", href: "/register" },
  ];

  const { data: sports } = useQuery<Sport[]>({ queryKey: ["/api/sports"] });
  const { data: tournaments } = useTournaments();
  const [tournamentDropdownOpen, setTournamentDropdownOpen] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allTournaments = tournaments || [];
  const activeTournament = selectedTournamentId ?? (allTournaments.length > 0 ? Number(allTournaments[0].id) : null);

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setTournamentDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setTournamentDropdownOpen(false);
      setSelectedSportId(null);
      setSelectedTournamentId(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const [mobileTournamentExpanded, setMobileTournamentExpanded] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-body">
      <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
        <div className="container mx-auto px-4 h-39 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-logo">
            <span className="text-2xl font-bold font-display tracking-tight text-foreground">
              <img
                src="/images/salaam-cup-logo-black.png"
                alt="Sport Cup Manager Logo"
                className="h-20 w-auto"
              />
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => 
              item.hasDropdown ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                  ref={dropdownRef}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors uppercase tracking-wide flex items-center gap-1",
                      location.startsWith("/tournaments") 
                        ? "text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    data-testid="nav-tournaments"
                  >
                    {item.label}
                    <ChevronDown className="h-3 w-3" />
                  </Link>

                  {tournamentDropdownOpen && (
                    <div 
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-background border border-border rounded-md shadow-lg min-w-[420px] z-50"
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                      data-testid="dropdown-tournaments"
                    >
                      <div className="flex divide-x divide-border">
                        <div className="p-4 min-w-[200px]">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Tournaments</h4>
                          <ul className="space-y-1">
                            {allTournaments.length > 0 ? allTournaments.map((t: Tournament) => (
                              <li key={t.id}>
                                <Link
                                  href={`/tournaments/${t.slug}`}
                                  className={cn(
                                    "block text-sm py-1.5 px-2 rounded-md flex items-center justify-between gap-2 transition-colors",
                                    Number(activeTournament) === Number(t.id)
                                      ? "text-foreground font-medium bg-muted"
                                      : "text-muted-foreground hover:text-foreground"
                                  )}
                                  onMouseEnter={() => setSelectedTournamentId(Number(t.id))}
                                  onClick={() => { setTournamentDropdownOpen(false); setSelectedSportId(null); setSelectedTournamentId(null); }}
                                  data-testid={`dropdown-tournament-${t.id}`}
                                >
                                  {t.name}
                                  <ChevronRight className="h-3 w-3" />
                                </Link>
                              </li>
                            )) : (
                              <li className="text-xs text-muted-foreground px-2 py-1">No tournaments</li>
                            )}
                          </ul>
                        </div>

                        <TournamentDivisionsColumn
                          tournamentId={activeTournament}
                          tournamentSlug={allTournaments.find(t => Number(t.id) === activeTournament)?.slug || null}
                          onClose={() => { setTournamentDropdownOpen(false); setSelectedSportId(null); setSelectedTournamentId(null); }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors uppercase tracking-wide",
                    location === item.href 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                      <AvatarFallback className="bg-foreground text-background text-xs font-bold">
                        {(user?.firstName?.[0] || "")}{(user?.lastName?.[0] || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/captain">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-captain">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Captain Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-admin">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Admin Portal</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer" data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isCaptainAuth ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-captain-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-foreground text-background text-xs font-bold">
                        {captain?.email?.[0]?.toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Team Captain</p>
                      <p className="text-xs leading-none text-muted-foreground">{captain?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/captain">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-captain-dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>My Teams</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => captainLogout()} className="text-destructive cursor-pointer" data-testid="button-captain-logout-nav">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/register" className="hidden md:block">
                <Button className="rounded-full font-bold uppercase text-xs tracking-wider px-6" data-testid="button-register">
                  Register Now
                </Button>
              </Link>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-mobile-menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t bg-background p-4 flex flex-col gap-1 animate-in slide-in-from-top-2">
            {navItems.map((item) => 
              item.hasDropdown ? (
                <div key={item.href}>
                  <button
                    className={cn(
                      "w-full text-left text-sm font-medium p-3 rounded-md transition-colors uppercase tracking-wide flex items-center justify-between",
                      location.startsWith("/tournaments") 
                        ? "text-foreground bg-muted" 
                        : "text-muted-foreground"
                    )}
                    onClick={() => setMobileTournamentExpanded(!mobileTournamentExpanded)}
                    data-testid="nav-mobile-tournaments-toggle"
                  >
                    {item.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", mobileTournamentExpanded && "rotate-180")} />
                  </button>
                  {mobileTournamentExpanded && (
                    <div className="pl-4 pb-2 space-y-1">
                      <Link 
                        href="/tournaments"
                        className="block text-sm p-2 text-muted-foreground hover:text-foreground"
                        onClick={() => { setIsOpen(false); setMobileTournamentExpanded(false); }}
                        data-testid="nav-mobile-all-tournaments"
                      >
                        All Tournaments
                      </Link>
                      {(tournaments || []).map((t: Tournament) => (
                        <Link
                          key={t.id}
                          href={`/tournaments/${t.slug}`}
                          className="block text-sm p-2 text-muted-foreground hover:text-foreground"
                          onClick={() => { setIsOpen(false); setMobileTournamentExpanded(false); }}
                          data-testid={`nav-mobile-tournament-${t.id}`}
                        >
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "text-sm font-medium p-3 rounded-md transition-colors uppercase tracking-wide",
                    location === item.href 
                      ? "text-foreground bg-muted" 
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                  data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              )
            )}
            {isCaptainAuth && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <Link href="/captain" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full" data-testid="button-captain-dashboard-mobile">My Teams</Button>
                </Link>
                <Button variant="ghost" className="w-full text-destructive" onClick={() => { captainLogout(); setIsOpen(false); }} data-testid="button-captain-logout-mobile">
                  Sign Out
                </Button>
              </div>
            )}
            {!isAuthenticated && !isCaptainAuth && (
              <div className="mt-4 pt-4 border-t">
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-full font-bold uppercase text-xs tracking-wider" data-testid="button-register-mobile">
                    Register Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-foreground text-background py-16" data-testid="footer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="col-span-1">
              <span className="text-2xl font-bold font-display tracking-tight block mb-4">
                <img
                  src="/images/salaam-cup-logo-white.png"
                  alt="Sport Cup Manager Logo"
                  className="h-20 w-auto"
                />
              </span>
              <p className="text-sm text-gray-400 leading-relaxed">
                Salaam Cup is a premier sports organization uniting athletes through competition, faith, and community.
              </p>
            </div>
            
            <div className="col-span-1">
              <h4 className="font-bold mb-4 text-sm tracking-wider">Information</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors" data-testid="footer-home">HOME</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors" data-testid="footer-about">ABOUT</Link></li>
                <li><Link href="/media" className="hover:text-white transition-colors" data-testid="footer-media">MEDIA</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors" data-testid="footer-contact">CONTACT</Link></li>
                <li><Link href="/admin-login" className="hover:text-white transition-colors" data-testid="footer-admin-login">ADMIN LOGIN</Link></li>
                <li><Link href="/captain-login" className="hover:text-white transition-colors" data-testid="footer-captain-login">CAPTAIN LOGIN</Link></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold mb-4 text-sm tracking-wider">Sports</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/tournaments" className="hover:text-white transition-colors">HOCKEY</Link></li>
                <li><Link href="/tournaments" className="hover:text-white transition-colors">BASKETBALL</Link></li>
                <li><Link href="/tournaments" className="hover:text-white transition-colors">SOCCER</Link></li>
                <li><Link href="/tournaments" className="hover:text-white transition-colors">SOFTBALL</Link></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold mb-4 text-sm tracking-wider">Connect With Us</h4>
              <div className="flex gap-3 mb-4">
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" data-testid="social-instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" data-testid="social-facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" data-testid="social-linkedin">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" data-testid="social-tiktok">
                  <SiTiktok className="h-4 w-4" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4" />
                <span>info@salaamcup.com</span>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
            Copyright &copy;2025 Salaam Cup. Created by Aeth Digital.
          </div>
        </div>
      </footer>
    </div>
  );
}

function TournamentDivisionsColumn({ tournamentId, tournamentSlug, onClose }: { tournamentId: number | null; tournamentSlug: string | null; onClose: () => void }) {
  const { data: divisions } = useDivisions(tournamentId || 0);

  if (!tournamentId) return null;

  return (
    <div className="p-4 min-w-[150px]">
      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Divisions</h4>
      <ul className="space-y-1">
        {(divisions || []).length > 0 ? (divisions || []).map((div: Division) => (
          <li key={div.id}>
            <Link
              href={`/tournaments/${tournamentSlug || tournamentId}`}
              className="block text-sm py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              onClick={onClose}
              data-testid={`dropdown-division-${div.id}`}
            >
              {div.name}
            </Link>
          </li>
        )) : (
          <li className="text-xs text-muted-foreground px-2 py-1">No divisions</li>
        )}
      </ul>
    </div>
  );
}
