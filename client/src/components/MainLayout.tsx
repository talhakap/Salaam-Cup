import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  Menu, 
  X, 
  Trophy, 
  Users, 
  Calendar, 
  ShieldCheck, 
  LogOut,
  LayoutDashboard
} from "lucide-react";
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

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Tournaments", href: "/tournaments" },
    { label: "About", href: "/about" },
    { label: "Media", href: "/media" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-display tracking-tight text-foreground hidden sm:block">
              SALAAM CUP
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary uppercase tracking-wide",
                  location === item.href ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User / Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                      <AvatarFallback>{(user?.firstName?.[0] || "")}{(user?.lastName?.[0] || "")}</AvatarFallback>
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
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Captain's Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Admin Portal</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex gap-2">
                 <Link href="/api/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-white hover:bg-primary/90">Register Team</Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "text-base font-medium p-2 rounded-md hover:bg-muted transition-colors",
                  location === item.href && "text-primary bg-primary/10"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
             {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                 <Link href="/api/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full justify-start bg-primary">Register Team</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-secondary text-secondary-foreground py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-display">SALAAM CUP</span>
              </div>
              <p className="text-sm text-gray-400">
                Organizing elite community sports tournaments since 2025. 
                Bringing communities together through competition.
              </p>
            </div>
            
            <div className="col-span-1">
              <h4 className="font-bold mb-4 text-primary">Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/tournaments" className="hover:text-white transition-colors">Tournaments</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/media" className="hover:text-white transition-colors">Media</Link></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold mb-4 text-primary">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>info@salaamcup.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Toronto, ON</li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold mb-4 text-primary">Follow Us</h4>
              <div className="flex gap-4">
                {/* Social icons placeholder */}
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">IG</div>
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">FB</div>
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">X</div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
            © 2025 Salaam Cup. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
