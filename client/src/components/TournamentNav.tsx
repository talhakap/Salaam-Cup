import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Calendar, Trophy, ScrollText, Award, Home } from "lucide-react";

const navItems = [
  { label: "Home", path: "", icon: Home },
  { label: "Schedule", path: "/schedule", icon: Calendar },
  { label: "Standings", path: "/standings", icon: Trophy },
  { label: "Rules", path: "/rules", icon: ScrollText },
  { label: "Awards", path: "/awards", icon: Award },
];

export function TournamentNav({ tournamentId }: { tournamentId: number }) {
  const [location] = useLocation();
  const basePath = `/tournaments/${tournamentId}`;

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-30 items-center" data-testid="tournament-nav">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const fullPath = basePath + item.path;
            const isActive = item.path === ""
              ? location === basePath || location === basePath + "/"
              : location.startsWith(fullPath);

            return (
              <Link
                key={item.label}
                href={fullPath}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 hover:text-stone-900",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground"
                )}
                data-testid={`nav-tournament-${item.label.toLowerCase()}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
