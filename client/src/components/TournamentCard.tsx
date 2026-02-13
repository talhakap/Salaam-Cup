import { Tournament } from "@shared/schema";
import { Link } from "wouter";
import { Calendar, Users, Trophy, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const statusColors = {
    upcoming: "bg-blue-500",
    active: "bg-green-500",
    completed: "bg-gray-500",
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none shadow-md group h-full flex flex-col ">
      <div className="relative h-48 overflow-hidden ">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 " />
        {tournament.heroImage ? (
           <img 
            src={tournament.heroImage} 
            alt={tournament.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Trophy className="h-16 w-16 text-white/20" />
          </div>
        )}
        <div className="absolute top-4 right-4 z-20">
          <Badge className={`${statusColors[tournament.status as keyof typeof statusColors]} hover:opacity-100 text-white border-none uppercase tracking-wider text-xs font-bold`}>
            {tournament.status}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 z-20">
          <h3 className="text-xl font-bold font-display text-white uppercase leading-none mb-1">
            {tournament.name}
          </h3>
          <p className="text-white/80 text-sm font-medium">{tournament.year}</p>
        </div>
      </div>
      
      <CardContent className="flex-1 pt-6">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span>
              {format(new Date(tournament.startDate), 'MMM d')} - {format(new Date(tournament.endDate), 'MMM d, yyyy')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {tournament.description || "Join us for the ultimate community sports experience."}
          </p>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50/50 p-4 border-t">
        <Link href={`/tournaments/${tournament.slug}`} className="w-full">
          <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors" variant="outline">
            View Details <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
