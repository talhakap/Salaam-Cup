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
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { logout } = useAuth();

  const sidebarItems = [
    { label: "Overview", href: "/admin", icon: Settings },
    { label: "Tournaments", href: "/admin/tournaments", icon: Trophy },
    { label: "Teams", href: "/admin/teams", icon: Users },
    { label: "Players", href: "/admin/players", icon: Users }, // Reusing Users icon
    { label: "Matches", href: "/admin/matches", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-secondary text-white min-h-screen fixed left-0 top-0 z-20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-display">ADMIN PORTAL</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              location === item.href 
                ? "bg-primary text-white" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
           <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white mb-2">
               Back to Public Site
            </Button>
           </Link>
          <Button 
            variant="destructive" 
            className="w-full justify-start gap-2"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-secondary text-white flex items-center justify-between px-4 sticky top-0 z-10">
          <span className="font-bold font-display text-lg">ADMIN</span>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
            <div className="bg-secondary w-64 h-full p-4" onClick={e => e.stopPropagation()}>
               <nav className="space-y-2 mt-12">
                {sidebarItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location === item.href ? "bg-primary text-white" : "text-gray-400"
                  )}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                 <div className="pt-4 mt-4 border-t border-white/10">
                    <Button variant="destructive" className="w-full" onClick={() => logout()}>Logout</Button>
                 </div>
               </nav>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
