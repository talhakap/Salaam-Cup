import { AdminLayout } from "@/components/AdminLayout";
import { useAllTeams, useUpdateTeam, useDeleteTeam, useCreateTeam } from "@/hooks/use-teams";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Eye, Pencil, Trash2, Copy, Key, Plus, Users } from "lucide-react";
import { Pagination, usePagination } from "@/components/Pagination";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import type { Team, Division } from "@shared/schema";

interface ApprovalCredentials {
  email: string;
  password: string;
  loginUrl: string;
}

function CredentialsDialog({ credentials, onClose }: { credentials: ApprovalCredentials; onClose: () => void }) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  const copyAll = () => {
    const text = `Captain Login Credentials\n\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nLogin URL: ${window.location.origin}${credentials.loginUrl}`;
    navigator.clipboard.writeText(text);
    toast({ title: "All credentials copied to clipboard" });
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-credentials">
        <DialogHeader>
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Key className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">Team Approved</DialogTitle>
          <DialogDescription className="text-center">
            A captain account has been created. Share these credentials with the team captain so they can log in and manage their roster.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 bg-muted rounded-md p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-mono text-sm" data-testid="text-credential-email">{credentials.email}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(credentials.email, "Email")} data-testid="button-copy-email">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Password</p>
              <p className="font-mono text-sm" data-testid="text-credential-password">{credentials.password}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(credentials.password, "Password")} data-testid="button-copy-password">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Login URL</p>
            <p className="font-mono text-sm">{window.location.origin}{credentials.loginUrl}</p>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={copyAll} className="w-full gap-2" data-testid="button-copy-all-credentials">
            <Copy className="h-4 w-4" /> Copy All Credentials
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;
const PAYMENT_FILTERS = ["all", "paid", "unpaid"] as const;

function EditTeamDialog({ team, onClose }: { team: Team; onClose: () => void }) {
  const updateTeam = useUpdateTeam();
  const { data: tournaments } = useTournaments();
  const [tournamentId, setTournamentId] = useState(Number(team.tournamentId));
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
        tournamentId: Number(tournamentId),
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

function CreateTeamDialog({ onClose }: { onClose: () => void }) {
  const { data: tournaments } = useTournaments();
  const [tournamentId, setTournamentId] = useState<number>(0);
  const { data: divisionsList } = useDivisions(tournamentId);
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (tournamentId === 0 && tournaments && tournaments.length > 0) {
      setTournamentId(Number(tournaments[0].id));
    }
  }, [tournaments, tournamentId]);

  const [name, setName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [status, setStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !captainName || !captainEmail || !captainPhone || !divisionId || !tournamentId) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          captainName,
          captainEmail,
          captainPhone,
          tournamentId: Number(tournamentId),
          divisionId: Number(divisionId),
          status: status as any,
          paymentStatus: paymentStatus as any,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create team");

      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });

      if (data.credentials) {
        setCredentials(data.credentials);
        toast({ title: "Team created with captain account" });
      } else {
        toast({ title: data.message || "Team created" });
        onClose();
      }
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (credentials) {
    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Captain Credentials Created</DialogTitle>
          <DialogDescription>A new captain account was created and emailed. You can also share these credentials directly.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <div className="flex items-center gap-2">
              <Input readOnly value={credentials.email} data-testid="text-credentials-email" />
              <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(credentials.email); toast({ title: "Copied" }); }} data-testid="button-copy-email">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <div className="flex items-center gap-2">
              <Input readOnly value={credentials.password} data-testid="text-credentials-password" />
              <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(credentials.password); toast({ title: "Copied" }); }} data-testid="button-copy-password">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} data-testid="button-done-credentials">Done</Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Add New Team</DialogTitle>
        <DialogDescription>Manually create a team. If status is set to "Approved", a captain account will be created and credentials emailed automatically.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Team Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} data-testid="input-create-team-name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Captain Name</label>
            <Input value={captainName} onChange={e => setCaptainName(e.target.value)} data-testid="input-create-captain-name" />
          </div>
          <div>
            <label className="text-sm font-medium">Captain Email</label>
            <Input value={captainEmail} onChange={e => setCaptainEmail(e.target.value)} data-testid="input-create-captain-email" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Captain Phone</label>
          <Input value={captainPhone} onChange={e => setCaptainPhone(e.target.value)} data-testid="input-create-captain-phone" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Tournament</label>
            <Select value={String(tournamentId)} onValueChange={v => { setTournamentId(Number(v)); setDivisionId(""); }}>
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
              <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
              <SelectContent>
                {divisionsList?.map((d: Division) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        <DialogFooter>
          <Button type="submit" disabled={submitting} data-testid="button-submit-create-team">
            {submitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Create Team
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function AdminTeams() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [tournamentFilter, setTournamentFilter] = useState<string>("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const { data: teams, isLoading } = useAllTeams();
  const { data: tournaments } = useTournaments();
  const { data: divisions } = useDivisions(tournamentFilter !== "all" ? Number(tournamentFilter) : 0);
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const { toast } = useToast();
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeamState, setDeleteTeamState] = useState<Team | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [credentials, setCredentials] = useState<ApprovalCredentials | null>(null);
  const [approvingTeamId, setApprovingTeamId] = useState<number | null>(null);

  const filteredTeams = teams?.filter((team) => {
    if (statusFilter !== "all" && team.status !== statusFilter) return false;
    if (paymentFilter !== "all" && team.paymentStatus !== paymentFilter) return false;
    if (tournamentFilter !== "all" && team.tournamentId !== Number(tournamentFilter)) return false;
    if (divisionFilter !== "all" && team.divisionId !== Number(divisionFilter)) return false;
    return true;
  });

  const { paginatedItems: paginatedTeams, ...paginationProps } = usePagination(filteredTeams, 25);

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
      setCredentials(data.credentials);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      toast({ title: "Team approved and captain account created" });
    } catch (err) {
      toast({ title: "Approval failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setApprovingTeamId(null);
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
    return tournaments?.find(t => Number(t.id) === Number(tournamentId))?.name || `Tournament #${tournamentId}`;
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
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground" data-testid="text-admin-teams-title">Team Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage team registrations</p>
        </div>
        <Button  onClick={() => setCreateOpen(true)} className="bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-green-600 gap-2" data-testid="button-add-team">
          <Plus className="h-4 w-4" /> Add Team
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {STATUS_FILTERS.map((s) => (
          <Button className="hover:bg-stone-500 hover:text-white"
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

      <div className="flex flex-wrap gap-2 mb-4">
        {PAYMENT_FILTERS.map((p) => (
          <Button className="hover:bg-stone-500 hover:text-white"
            key={p}
            variant={paymentFilter === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPaymentFilter(p)}
            data-testid={`button-filter-payment-${p}`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={tournamentFilter} onValueChange={(val) => { setTournamentFilter(val); setDivisionFilter("all"); }}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-tournament">
            <SelectValue placeholder="All Tournaments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tournaments</SelectItem>
            {tournaments?.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={divisionFilter} onValueChange={setDivisionFilter} disabled={tournamentFilter === "all"}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-division">
            <SelectValue placeholder="All Divisions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisions?.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !filteredTeams || filteredTeams.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No teams found</p>
          <p className="text-sm mt-1">
            {statusFilter !== "all" || paymentFilter !== "all" || tournamentFilter !== "all" || divisionFilter !== "all"
              ? "No teams match the selected filters."
              : "No teams have registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedTeams?.map((team) => (
            <Card key={team.id} data-testid={`card-team-${team.id}`}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-muted flex items-center justify-center">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-8 h-8 object-contain rounded-full" data-testid={`img-team-logo-${team.id}`} />
                    ) : (
                      <Users className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
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
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                  {team.status === "pending" && (
                    <>
                      <Button 
                        className="bg-card rounded-md shadow text-white bg-green-600 hover:border-green-600 hover:bg-white hover:text-green-600"
                        size="sm"
                        onClick={() => handleApprove(team.id)}
                        disabled={approvingTeamId === team.id}
                        data-testid={`button-approve-team-${team.id}`}
                      >
                        {approvingTeamId === team.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />} Approve
                      </Button>
                      <Button
                        className=" bg-card rounded-md shadow bg-red-700 text-white hover:bg-white hover:text-red-700 hover:border-red-700"
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
                  <Link href={`/teams/${team.id}`}>
                    <Button className="hover:border-blue-600 bg-blue-600 text-white hover:bg-white hover:text-blue-600" size="sm" variant="outline" data-testid={`button-view-team-${team.id}`}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </Link>
                  <Button className="bg-amber-400 text-white hover:bg-white hover:text-amber-400 hover:border-amber-400" size="sm" variant="outline" onClick={() => setEditTeam(team)} data-testid={`button-edit-team-${team.id}`}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>

                  <Button className="bg-card rounded-md shadow bg-red-700 text-white hover:bg-white hover:text-red-700 hover:border-red-700" size="icon" variant="ghost" onClick={() => setDeleteTeamState(team)} data-testid={`button-delete-team-${team.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Pagination {...paginationProps} onPageChange={paginationProps.setCurrentPage} />
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

      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        {createOpen && <CreateTeamDialog onClose={() => setCreateOpen(false)} />}
      </Dialog>

      {credentials && (
        <CredentialsDialog credentials={credentials} onClose={() => setCredentials(null)} />
      )}
    </AdminLayout>
  );
}
