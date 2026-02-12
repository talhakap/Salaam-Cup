import { AdminLayout } from "@/components/AdminLayout";
import { useAllTeams, useUpdateTeam, useDeleteTeam } from "@/hooks/use-teams";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Eye, Pencil, Trash2, Mail } from "lucide-react";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import type { Team, Division } from "@shared/schema";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;

function EditTeamDialog({ team, onClose }: { team: Team; onClose: () => void }) {
  const updateTeam = useUpdateTeam();
  const { data: tournaments } = useTournaments();
  const [tournamentId, setTournamentId] = useState(team.tournamentId);
  const { data: divisionsList } = useDivisions(tournamentId);
  const { toast } = useToast();

  const [name, setName] = useState(team.name);
  const [captainName, setCaptainName] = useState(team.captainName);
  const [captainEmail, setCaptainEmail] = useState(team.captainEmail);
  const [captainPhone, setCaptainPhone] = useState(team.captainPhone);
  const [status, setStatus] = useState<string>(team.status);
  const [divisionId, setDivisionId] = useState(String(team.divisionId));
  const [paymentStatus, setPaymentStatus] = useState<string>(team.paymentStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTeam.mutateAsync({
        id: team.id,
        name,
        captainName,
        captainEmail,
        captainPhone,
        status: status as any,
        divisionId: Number(divisionId),
        tournamentId,
        paymentStatus: paymentStatus as any,
      });
      toast({ title: "Team updated" });
      onClose();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit Team</DialogTitle>
        <DialogDescription>Update team details.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Team Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} data-testid="input-edit-team-name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Captain Name</label>
            <Input value={captainName} onChange={e => setCaptainName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Captain Email</label>
            <Input value={captainEmail} onChange={e => setCaptainEmail(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Captain Phone</label>
            <Input value={captainPhone} onChange={e => setCaptainPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Tournament</label>
            <Select value={String(tournamentId)} onValueChange={v => setTournamentId(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tournaments?.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Division</label>
            <Select value={divisionId} onValueChange={setDivisionId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {divisionsList?.map((d: Division) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Payment Status</label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={updateTeam.isPending} data-testid="button-save-team">
            {updateTeam.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Save
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function AdminTeams() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: teams, isLoading } = useAllTeams(statusFilter === "all" ? undefined : statusFilter);
  const { data: tournaments } = useTournaments();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const { toast } = useToast();
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeamState, setDeleteTeamState] = useState<Team | null>(null);
  const [approvingTeamId, setApprovingTeamId] = useState<number | null>(null);
  const [resendingTeamId, setResendingTeamId] = useState<number | null>(null);

  const handleApprove = async (teamId: number) => {
    setApprovingTeamId(teamId);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Approval failed");
      }
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      toast({ title: data.message });
    } catch (err) {
      toast({ title: "Approval failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setApprovingTeamId(null);
    }
  };

  const handleResendActivation = async (teamId: number) => {
    setResendingTeamId(teamId);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/resend-activation`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to resend");
      }
      const data = await res.json();
      toast({ title: data.message });
    } catch (err) {
      toast({ title: "Resend failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setResendingTeamId(null);
    }
  };

  const handleReject = (teamId: number) => {
    updateTeam.mutate(
      { id: teamId, status: "rejected" },
      {
        onSuccess: () => toast({ title: "Team rejected" }),
        onError: () => toast({ title: "Error", variant: "destructive" }),
      }
    );
  };

  const handleDelete = async () => {
    if (!deleteTeamState) return;
    try {
      await deleteTeam.mutateAsync(deleteTeamState.id);
      toast({ title: "Team deleted" });
      setDeleteTeamState(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const getTournamentName = (tournamentId: number) => {
    return tournaments?.find(t => t.id === tournamentId)?.name || `Tournament #${tournamentId}`;
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved": return "default" as const;
      case "pending": return "secondary" as const;
      case "rejected": return "destructive" as const;
      default: return "outline" as const;
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
                    <Badge variant="outline">{team.paymentStatus}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>{getTournamentName(team.tournamentId)}</p>
                    <p>Captain: {team.captainName} ({team.captainEmail})</p>
                    {team.captainPhone && <p>Phone: {team.captainPhone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                  <Link href={`/teams/${team.id}`}>
                    <Button size="sm" variant="outline" data-testid={`button-view-team-${team.id}`}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => setEditTeam(team)} data-testid={`button-edit-team-${team.id}`}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  {team.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(team.id)}
                        disabled={approvingTeamId === team.id}
                        data-testid={`button-approve-team-${team.id}`}
                      >
                        {approvingTeamId === team.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />} Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(team.id)}
                        disabled={updateTeam.isPending}
                        data-testid={`button-reject-team-${team.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {team.status === "approved" && !team.captainUserId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResendActivation(team.id)}
                      disabled={resendingTeamId === team.id}
                      data-testid={`button-resend-activation-${team.id}`}
                    >
                      {resendingTeamId === team.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Mail className="h-4 w-4 mr-1" />} Resend Activation
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => setDeleteTeamState(team)} data-testid={`button-delete-team-${team.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editTeam} onOpenChange={(o) => !o && setEditTeam(null)}>
        {editTeam && <EditTeamDialog team={editTeam} onClose={() => setEditTeam(null)} />}
      </Dialog>

      <Dialog open={!!deleteTeamState} onOpenChange={(o) => !o && setDeleteTeamState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTeamState?.name}"? This will also remove all players and matches associated with this team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTeamState(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTeam.isPending} data-testid="button-confirm-delete-team">
              {deleteTeam.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
}
