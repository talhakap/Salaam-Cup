import { AdminLayout } from "@/components/AdminLayout";
import { useAdminPlayers, useUpdatePlayer, useDeletePlayer } from "@/hooks/use-players";
import { useAllTeams } from "@/hooks/use-teams";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { Loader2, User, Users, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Player, Team } from "@shared/schema";

const STATUS_FILTERS = ["all", "confirmed", "flagged", "verified", "staging", "rejected"] as const;

type PlayerWithTeam = Player & { team: Team | null };

function EditPlayerDialog({ player, onClose }: { player: PlayerWithTeam; onClose: () => void }) {
  const updatePlayer = useUpdatePlayer();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(player.firstName);
  const [lastName, setLastName] = useState(player.lastName);
  const [email, setEmail] = useState(player.email);
  const [phone, setPhone] = useState(player.phone || "");
  const [jerseyNumber, setJerseyNumber] = useState(player.jerseyNumber || 0);
  const [position, setPosition] = useState(player.position || "");
  const [status, setStatus] = useState(player.status);
  const [adminNotes, setAdminNotes] = useState(player.adminNotes || "");
  const [waiverSigned, setWaiverSigned] = useState(player.waiverSigned || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePlayer.mutateAsync({
        id: player.id,
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        jerseyNumber: jerseyNumber || undefined,
        position: position || undefined,
        status: status as any,
        adminNotes: adminNotes || undefined,
        waiverSigned,
      });
      toast({ title: "Player updated" });
      onClose();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit Player</DialogTitle>
        <DialogDescription>Update player details and status.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">First Name</label>
            <Input value={firstName} onChange={e => setFirstName(e.target.value)} data-testid="input-edit-player-first" />
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <Input value={lastName} onChange={e => setLastName(e.target.value)} data-testid="input-edit-player-last" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Jersey #</label>
            <Input type="number" value={jerseyNumber} onChange={e => setJerseyNumber(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-sm font-medium">Position</label>
            <Input value={position} onChange={e => setPosition(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Admin Notes</label>
          <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="resize-none" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={waiverSigned} onChange={e => setWaiverSigned(e.target.checked)} className="h-4 w-4" />
          <label className="text-sm font-medium">Waiver Signed</label>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={updatePlayer.isPending} data-testid="button-save-player">
            {updatePlayer.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Save
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function AdminPlayers() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tournamentFilter, setTournamentFilter] = useState<string>("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const { data: players, isLoading } = useAdminPlayers(statusFilter === "all" ? undefined : statusFilter);
  const { data: tournaments } = useTournaments();
  const { data: divisions } = useDivisions(tournamentFilter !== "all" ? Number(tournamentFilter) : 0);
  const { data: allTeams } = useAllTeams();
  const deletePlayer = useDeletePlayer();
  const { toast } = useToast();
  const [editPlayer, setEditPlayer] = useState<PlayerWithTeam | null>(null);
  const [deletePlayerState, setDeletePlayerState] = useState<PlayerWithTeam | null>(null);

  const teamsForFilter = useMemo(() => {
    if (!allTeams) return [];
    return allTeams.filter((t) => {
      if (tournamentFilter !== "all" && t.tournamentId !== Number(tournamentFilter)) return false;
      if (divisionFilter !== "all" && t.divisionId !== Number(divisionFilter)) return false;
      return true;
    });
  }, [allTeams, tournamentFilter, divisionFilter]);

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    return players.filter((p) => {
      if (tournamentFilter !== "all") {
        if (!p.team || p.team.tournamentId !== Number(tournamentFilter)) return false;
      }
      if (divisionFilter !== "all") {
        if (!p.team || p.team.divisionId !== Number(divisionFilter)) return false;
      }
      if (teamFilter !== "all") {
        if (!p.teamId || p.teamId !== Number(teamFilter)) return false;
      }
      return true;
    });
  }, [players, tournamentFilter, divisionFilter, teamFilter]);

  const handleDelete = async () => {
    if (!deletePlayerState) return;
    try {
      await deletePlayer.mutateAsync(deletePlayerState.id);
      toast({ title: "Player deleted" });
      setDeletePlayerState(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "default" as const;
      case "verified": return "default" as const;
      case "flagged": return "destructive" as const;
      case "rejected": return "destructive" as const;
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

      <div className="flex flex-wrap gap-2 mb-4">
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

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={tournamentFilter} onValueChange={(val) => { setTournamentFilter(val); setDivisionFilter("all"); setTeamFilter("all"); }}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-player-tournament">
            <SelectValue placeholder="All Tournaments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tournaments</SelectItem>
            {tournaments?.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={divisionFilter} onValueChange={(val) => { setDivisionFilter(val); setTeamFilter("all"); }} disabled={tournamentFilter === "all"}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-player-division">
            <SelectValue placeholder="All Divisions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisions?.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-player-team">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teamsForFilter.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No player registrations found</p>
          <p className="text-sm mt-1">
            {statusFilter !== "all" || tournamentFilter !== "all" || divisionFilter !== "all" || teamFilter !== "all"
              ? "No players match the selected filters."
              : "No players or free agents have registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlayers.map((player) => (
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
                        {player.jerseyNumber ? ` | #${player.jerseyNumber}` : ''}
                        {player.position ? ` | ${player.position}` : ''}
                      </p>
                      {player.adminNotes && <p className="text-xs italic">Notes: {player.adminNotes}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {player.registeredAt && (
                    <span className="text-xs text-muted-foreground mr-2" data-testid={`text-player-date-${player.id}`}>
                      {format(new Date(player.registeredAt), "MMM d, yyyy")}
                    </span>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => setEditPlayer(player)} data-testid={`button-edit-player-${player.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeletePlayerState(player)} data-testid={`button-delete-player-${player.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editPlayer} onOpenChange={(o) => !o && setEditPlayer(null)}>
        {editPlayer && <EditPlayerDialog player={editPlayer} onClose={() => setEditPlayer(null)} />}
      </Dialog>

      <Dialog open={!!deletePlayerState} onOpenChange={(o) => !o && setDeletePlayerState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletePlayerState?.firstName} {deletePlayerState?.lastName}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePlayerState(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deletePlayer.isPending} data-testid="button-confirm-delete-player">
              {deletePlayer.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
