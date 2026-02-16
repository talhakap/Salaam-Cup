import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  ShieldCheck, 
  Users, 
  Trophy, 
  Calendar, 
  LogOut,
  Settings,
  Menu,
  X,
  Award,
  Newspaper,
  Handshake,
  FileText,
  Image,
  HelpCircle,
  MapPin,
  Loader2,
  Dumbbell,
  UserCog
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { logout, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin-login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sidebarItems = [
    { label: "Overview", href: "/admin", icon: Settings },
    { label: "Tournaments", href: "/admin/tournaments", icon: Trophy },
    { label: "Teams", href: "/admin/teams", icon: Users },
    { label: "Players", href: "/admin/players", icon: Users }, // Reusing Users icon
    { label: "Matches", href: "/admin/matches", icon: Calendar },
    { label: "Standings Adj.", href: "/admin/standings-adjustments", icon: Settings },
    { label: "Awards", href: "/admin/awards", icon: Award },
    { label: "News", href: "/admin/news", icon: Newspaper },
    { label: "Sponsors", href: "/admin/sponsors", icon: Handshake },
    { label: "About Page", href: "/admin/about-content", icon: FileText },
    { label: "Waiver", href: "/admin/waiver", icon: FileText },
    { label: "Media Gallery", href: "/admin/media", icon: Image },
    { label: "Sports", href: "/admin/sports", icon: Dumbbell },
    { label: "Venues", href: "/admin/venues", icon: MapPin },
    { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { label: "Special Awards", href: "/admin/special-awards", icon: Award },
    { label: "Users", href: "/admin/users", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-muted flex font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-secondary text-stone-900 h-screen fixed left-0 top-0 z-20">
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img 
              src="/images/salaam-cup-logo-black.png" 
              alt="Logo" 
              className="h-7 w-7 object-contain" 
            />
            <span className="text-stone-900 text-xl font-bold font-display">ADMIN PORTAL</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              location === item.href 
                ? "bg-primary text-white" 
                : "text-gray-400 hover:text-black hover:bg-stone-400"
            )}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 flex-shrink-0">
           <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-black mb-2">
               Back to Public Site
            </Button>
           </Link>
          <Button 
            variant="destructive" 
            className="hover:bg-white hover:text-red-600 w-full justify-start gap-2"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-secondary text-stone-900 flex items-center justify-between px-4 sticky top-0 z-10">
          <span className="text-stone-900 font-bold font-display text-lg">ADMIN</span>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
            <div className="bg-secondary w-64 h-full flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-4 pt-6 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-stone-900 font-bold font-display">ADMIN</span>
                </div>
                <button onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {sidebarItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-stone-400 hover:text-white",
                    location === item.href ? "bg-primary text-white" : "text-gray-400"
                  )}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-white/10 space-y-2 flex-shrink-0">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-black">
                    Back to Public Site
                  </Button>
                </Link>
                <Button variant="destructive" className="w-full justify-start gap-2 hover:bg-white hover:text-red-600" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
