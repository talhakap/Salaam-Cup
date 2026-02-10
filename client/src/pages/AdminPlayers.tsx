import { AdminLayout } from "@/components/AdminLayout";
import { useAdminPlayers } from "@/hooks/use-players";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Loader2, User, Users } from "lucide-react";
import { format } from "date-fns";

const STATUS_FILTERS = ["all", "confirmed", "flagged"] as const;

export default function AdminPlayers() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: players, isLoading } = useAdminPlayers(statusFilter === "all" ? undefined : statusFilter);

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "default" as const;
      case "flagged": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  const typeBadgeVariant = (type: string) => {
    switch (type) {
      case "player": return "outline" as const;
      case "free_agent": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-display text-secondary" data-testid="text-admin-players-title">Player Registrations</h1>
        <p className="text-muted-foreground mt-1">Review player and free agent registrations</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            data-testid={`button-filter-player-${s}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !players || players.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No player registrations found</p>
          <p className="text-sm mt-1">
            {statusFilter !== "all" ? `No ${statusFilter} players at this time.` : "No players or free agents have registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player) => (
            <Card key={player.id} data-testid={`card-player-${player.id}`}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="font-bold text-lg truncate" data-testid={`text-player-name-${player.id}`}>
                        {player.firstName} {player.lastName}
                      </h3>
                      <Badge variant={statusBadgeVariant(player.status)} data-testid={`badge-player-status-${player.id}`}>
                        {player.status}
                      </Badge>
                      <Badge variant={typeBadgeVariant(player.registrationType)} data-testid={`badge-player-type-${player.id}`}>
                        {player.registrationType === 'free_agent' ? 'Free Agent' : 'Player'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p>{player.email}</p>
                      <p>
                        {player.team ? `Team: ${player.team.name}` : 'No team (Free Agent)'}
                        {player.dob ? ` | DOB: ${player.dob}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                  {player.registeredAt && (
                    <span data-testid={`text-player-date-${player.id}`}>
                      {format(new Date(player.registeredAt), "MMM d, yyyy h:mm a")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
