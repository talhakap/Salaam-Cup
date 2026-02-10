import { AdminLayout } from "@/components/AdminLayout";
import { useAllTeams, useUpdateTeam } from "@/hooks/use-teams";
import { useTournaments } from "@/hooks/use-tournaments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import { Link } from "wouter";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;

export default function AdminTeams() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: teams, isLoading } = useAllTeams(statusFilter === "all" ? undefined : statusFilter);
  const { data: tournaments } = useTournaments();
  const updateTeam = useUpdateTeam();
  const { toast } = useToast();

  const handleUpdateStatus = (teamId: number, status: "approved" | "rejected") => {
    updateTeam.mutate(
      { id: teamId, status },
      {
        onSuccess: () => {
          toast({ title: `Team ${status}`, description: `Team has been ${status} successfully.` });
        },
        onError: () => {
          toast({ title: "Error", description: `Failed to update team status.`, variant: "destructive" });
        },
      }
    );
  };

  const getTournamentName = (tournamentId: number) => {
    return tournaments?.find(t => t.id === tournamentId)?.name || `Tournament #${tournamentId}`;
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-display text-secondary" data-testid="text-admin-teams-title">Team Management</h1>
        <p className="text-muted-foreground mt-1">Review and manage team registrations</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            data-testid={`button-filter-${s}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !teams || teams.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No teams found</p>
          <p className="text-sm mt-1">
            {statusFilter !== "all" ? `No ${statusFilter} teams at this time.` : "No teams have registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <Card key={team.id} data-testid={`card-team-${team.id}`}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h3 className="font-bold text-lg truncate" data-testid={`text-team-name-${team.id}`}>{team.name}</h3>
                    <Badge variant={statusBadgeVariant(team.status)} data-testid={`badge-team-status-${team.id}`}>
                      {team.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>{getTournamentName(team.tournamentId)}</p>
                    <p>Captain: {team.captainName} ({team.captainEmail})</p>
                    {team.captainPhone && <p>Phone: {team.captainPhone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/teams/${team.id}`}>
                    <Button size="sm" variant="outline" data-testid={`button-view-team-${team.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  {team.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(team.id, "approved")}
                        disabled={updateTeam.isPending}
                        data-testid={`button-approve-team-${team.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(team.id, "rejected")}
                        disabled={updateTeam.isPending}
                        data-testid={`button-reject-team-${team.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
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
