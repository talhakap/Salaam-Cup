import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useCaptainAuth } from "@/hooks/use-captain-auth";
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
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useState } from "react";
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

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { captain, logout: captainLogout, isAuthenticated: isCaptainAuth } = useCaptainAuth();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Tournaments", href: "/tournaments" },
    { label: "Media", href: "/media" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-body">
      <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-logo">
            <span className="text-2xl font-bold font-display tracking-tight text-foreground">
              SALAAM CUP
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
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
            ))}
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
              <a href="/api/login" className="hidden md:block">
                <Button className="rounded-full font-bold uppercase text-xs tracking-wider px-6" data-testid="button-login">
                  Register Now
                </Button>
              </a>
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
            {navItems.map((item) => (
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
            ))}
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
                <a href="/api/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-full font-bold uppercase text-xs tracking-wider" data-testid="button-login-mobile">
                    Register Now
                  </Button>
                </a>
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
                SALAAM CUP
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
                <li><Link href="/contact" className="hover:text-white transition-colors" data-testid="footer-contact">CONTACT</Link></li>
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
