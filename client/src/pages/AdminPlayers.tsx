import { AdminLayout } from "@/components/AdminLayout";
import { useAdminPlayers, useUpdatePlayer, useDeletePlayer, useCreatePlayer } from "@/hooks/use-players";
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
import { Loader2, User, Users, Pencil, Trash2, Plus, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { Pagination, usePagination } from "@/components/Pagination";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { Player, Team } from "@shared/schema";

interface CaptainUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  createdAt: string | null;
}

const STATUS_FILTERS = ["all", "confirmed", "flagged", "staging", "rejected"] as const;
const TYPE_FILTERS = ["all", "players", "free agents", "captains"] as const;

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
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
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

function CreatePlayerDialog({ teams, onClose }: { teams: Team[]; onClose: () => void }) {
  const createPlayer = useCreatePlayer();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState(0);
  const [position, setPosition] = useState("");
  const [teamId, setTeamId] = useState("");
  const [registrationType, setRegistrationType] = useState("roster");
  const [status, setStatus] = useState("staging");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !dob) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    try {
      await createPlayer.mutateAsync({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        dob,
        jerseyNumber: jerseyNumber || undefined,
        position: position || undefined,
        teamId: teamId && teamId !== "none" ? Number(teamId) : undefined,
        registrationType: registrationType as any,
        status: status as any,
      });
      toast({ title: "Player created" });
      onClose();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Add New Player</DialogTitle>
        <DialogDescription>Manually create a player.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">First Name</label>
            <Input value={firstName} onChange={e => setFirstName(e.target.value)} data-testid="input-create-player-first" />
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <Input value={lastName} onChange={e => setLastName(e.target.value)} data-testid="input-create-player-last" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} data-testid="input-create-player-email" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">DOB</label>
            <Input type="date" value={dob} onChange={e => setDob(e.target.value)} data-testid="input-create-player-dob" />
          </div>
          <div>
            <label className="text-sm font-medium">Jersey #</label>
            <Input type="number" value={jerseyNumber} onChange={e => setJerseyNumber(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-sm font-medium">Position</label>
            <Input value={position} onChange={e => setPosition(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Team</label>
          <Select value={teamId} onValueChange={setTeamId}>
            <SelectTrigger><SelectValue placeholder="Select team (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Team (Free Agent)</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select value={registrationType} onValueChange={setRegistrationType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="roster">Roster</SelectItem>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="free_agent">Free Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={createPlayer.isPending} data-testid="button-submit-create-player">
            {createPlayer.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Create Player
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function AdminPlayers() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [tournamentFilter, setTournamentFilter] = useState<string>("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: players, isLoading } = useAdminPlayers();
  const { data: captainUsers, isLoading: captainsLoading } = useQuery<CaptainUser[]>({
    queryKey: ["/api/admin/users"],
    select: (data) => data.filter(u => u.role === "captain"),
  });
  const { data: tournaments } = useTournaments();
  const { data: divisions } = useDivisions(tournamentFilter !== "all" ? Number(tournamentFilter) : 0);
  const { data: allTeams } = useAllTeams();
  const deletePlayer = useDeletePlayer();
  const { toast } = useToast();
  const [editPlayer, setEditPlayer] = useState<PlayerWithTeam | null>(null);
  const [deletePlayerState, setDeletePlayerState] = useState<PlayerWithTeam | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      if (statusFilter !== "all") {
        if (statusFilter === "confirmed") {
          if (p.status !== "confirmed") return false;
        } else {
          if (p.status !== statusFilter) return false;
        }
      }
      if (typeFilter === "players") {
        if (p.registrationType === "free_agent") return false;
      } else if (typeFilter === "free agents") {
        if (p.registrationType !== "free_agent") return false;
      } else if (typeFilter === "captains") {
        return false;
      }
      if (tournamentFilter !== "all") {
        if (!p.team || p.team.tournamentId !== Number(tournamentFilter)) return false;
      }
      if (divisionFilter !== "all") {
        if (!p.team || p.team.divisionId !== Number(divisionFilter)) return false;
      }
      if (teamFilter !== "all") {
        if (!p.teamId || p.teamId !== Number(teamFilter)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        const email = p.email.toLowerCase();
        if (!fullName.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [players, statusFilter, typeFilter, tournamentFilter, divisionFilter, teamFilter, searchQuery]);

  const captainTeamsMap = useMemo(() => {
    if (!allTeams) return new Map<string, Team[]>();
    const map = new Map<string, Team[]>();
    allTeams
      .filter((t) => t.status === "approved" && t.captainEmail)
      .forEach((t) => {
        const email = t.captainEmail!.trim().toLowerCase();
        if (!map.has(email)) map.set(email, []);
        map.get(email)!.push(t);
      });
    return map;
  }, [allTeams]);

  const filteredCaptains = useMemo(() => {
    if (!captainUsers) return [];
    if (typeFilter !== "all" && typeFilter !== "captains") return [];
    if (statusFilter !== "all" && statusFilter !== "confirmed") return [];
    return captainUsers.filter((c) => {
      if (!c.email || !captainTeamsMap.has(c.email.trim().toLowerCase())) return false;
      if (tournamentFilter !== "all") {
        const teams = captainTeamsMap.get(c.email!.trim().toLowerCase()) || [];
        if (!teams.some(t => String(t.tournamentId) === String(tournamentFilter))) return false;
      }
      if (divisionFilter !== "all") {
        const teams = captainTeamsMap.get(c.email!.trim().toLowerCase()) || [];
        if (!teams.some(t => String(t.divisionId) === String(divisionFilter))) return false;
      }
      if (teamFilter !== "all") {
        const teams = captainTeamsMap.get(c.email!.trim().toLowerCase()) || [];
        if (!teams.some(t => String(t.id) === String(teamFilter))) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
        const email = (c.email || "").toLowerCase();
        if (!fullName.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [captainUsers, typeFilter, statusFilter, tournamentFilter, divisionFilter, teamFilter, searchQuery, captainTeamsMap]);

  const { paginatedItems: paginatedPlayers, ...paginationProps } = usePagination(filteredPlayers, 25);

  const showCaptains = (typeFilter === "all" || typeFilter === "captains") && (statusFilter === "all" || statusFilter === "confirmed");
  const showPlayers = typeFilter !== "captains";

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
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold font-display text-primary" data-testid="text-admin-players-title">Player Registrations</h1>
          <p className="text-muted-foreground mt-1">Review player and free agent registrations</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-green-600 gap-2" data-testid="button-add-player">
          <Plus className="h-4 w-4" /> Add Player
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {STATUS_FILTERS.map((s) => (
          <Button
            className="hover:bg-stone-500 hover:text-white"
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

      <div className="flex flex-wrap gap-2 mb-4">
        {TYPE_FILTERS.map((t) => (
          <Button
            className="hover:bg-stone-500 hover:text-white"
            key={t}
            variant={typeFilter === t ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(t)}
            data-testid={`button-filter-player-type-${t.replace(" ", "-")}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
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
        <div className="ml-auto w-full sm:w-auto">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[250px]"
            data-testid="input-search-players"
          />
        </div>
      </div>

      {(isLoading || captainsLoading) ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (showPlayers ? filteredPlayers.length : 0) + (showCaptains ? filteredCaptains.length : 0) === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm mt-1">
            {statusFilter !== "all" || typeFilter !== "all" || tournamentFilter !== "all" || divisionFilter !== "all" || teamFilter !== "all" || searchQuery.trim()
              ? "No players match the selected filters."
              : "No players, free agents, or captains have registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {showCaptains && filteredCaptains.length > 0 && (
            <>
              {filteredCaptains.map((captain) => {
                const captainTeams = captain.email ? captainTeamsMap.get(captain.email.trim().toLowerCase()) || [] : [];
                const getTournamentName = (tid: number | string) => tournaments?.find(t => String(t.id) === String(tid))?.name || "";
                return (
                <Card key={`captain-${captain.id}`} data-testid={`card-captain-${captain.id}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Shield className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h3 className="font-bold text-lg truncate" data-testid={`text-captain-name-${captain.id}`}>
                              {captain.firstName || captain.lastName
                                ? `${captain.firstName || ""} ${captain.lastName || ""}`.trim()
                                : captain.email}
                            </h3>
                            <Badge variant="secondary" data-testid={`badge-captain-role-${captain.id}`}>Captain</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{captain.email}</p>
                          {captainTeams.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {captainTeams.map((team) => (
                                <span key={team.id} className="text-xs text-muted-foreground">
                                  {getTournamentName(team.tournamentId)} &middot; {team.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {captain.createdAt && (
                          <span className="text-xs text-muted-foreground mr-2">
                            {format(new Date(captain.createdAt), "MMM d, yyyy")}
                          </span>
                        )}
                        <Button
                          className="hover:bg-gray-500 hover:text-white"
                          size="icon"
                          variant="ghost"
                          onClick={() => setExpandedId(expandedId === `captain-${captain.id}` ? null : `captain-${captain.id}`)}
                          data-testid={`button-expand-captain-${captain.id}`}
                        >
                          {expandedId === `captain-${captain.id}` ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {expandedId === `captain-${captain.id}` && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Email: </span>
                            <span className="font-medium">{captain.email || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">First Name: </span>
                            <span className="font-medium">{captain.firstName || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Name: </span>
                            <span className="font-medium">{captain.lastName || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Role: </span>
                            <span className="font-medium">Captain</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created: </span>
                            <span className="font-medium">{captain.createdAt ? format(new Date(captain.createdAt), "MMM d, yyyy") : "N/A"}</span>
                          </div>
                        </div>
                        {captainTeams.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-sm font-medium mb-2">Teams</p>
                            <div className="space-y-2">
                              {captainTeams.map((team) => (
                                <div key={team.id} className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="font-medium">{team.name}</span>
                                  <span className="text-muted-foreground">&middot;</span>
                                  <span className="text-muted-foreground">{getTournamentName(team.tournamentId)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );})}
            </>
          )}
          {showPlayers && filteredPlayers.length > 0 && (
            <>
          {paginatedPlayers?.map((player) => (
            <Card key={player.id} data-testid={`card-player-${player.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                      <p className="text-sm text-muted-foreground">
                        {player.team ? player.team.name : 'No team (Free Agent)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {player.registeredAt && (
                      <span className="text-xs text-muted-foreground mr-2" data-testid={`text-player-date-${player.id}`}>
                        {format(new Date(player.registeredAt), "MMM d, yyyy")}
                      </span>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setExpandedId(expandedId === `player-${player.id}` ? null : `player-${player.id}`)}
                      data-testid={`button-expand-admin-player-${player.id}`}
                    >
                      {expandedId === `player-${player.id}` ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button className="bg-amber-400 text-white hover:bg-white hover:text-amber-400 hover:border-amber-400" size="icon" variant="ghost" onClick={() => setEditPlayer(player)} data-testid={`button-edit-player-${player.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button className="bg-red-700 text-white hover:bg-white hover:text-red-700 hover:border-red-700
" size="icon" variant="ghost" onClick={() => setDeletePlayerState(player)} data-testid={`button-delete-player-${player.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {expandedId === `player-${player.id}` && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        <span className="font-medium">{player.email}</span>
                      </div>
                      {player.phone && (
                        <div>
                          <span className="text-muted-foreground">Phone: </span>
                          <span className="font-medium">{player.phone}</span>
                        </div>
                      )}
                      {player.dob && (
                        <div>
                          <span className="text-muted-foreground">DOB: </span>
                          <span className="font-medium">{player.dob}</span>
                        </div>
                      )}
                      {player.position && (
                        <div>
                          <span className="text-muted-foreground">Position: </span>
                          <span className="font-medium">{player.position}</span>
                        </div>
                      )}
                      {player.jerseyNumber && (
                        <div>
                          <span className="text-muted-foreground">Jersey #: </span>
                          <span className="font-medium">{player.jerseyNumber}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Waiver: </span>
                        <span className="font-medium">{player.waiverSigned ? "Signed" : "Not signed"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type: </span>
                        <span className="font-medium">{player.registrationType === 'free_agent' ? 'Free Agent' : player.registrationType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Team: </span>
                        <span className="font-medium">{player.team ? player.team.name : 'None'}</span>
                      </div>
                      {player.adminNotes && (
                        <div className="col-span-2 sm:col-span-3">
                          <span className="text-muted-foreground">Admin Notes: </span>
                          <span className="font-medium italic">{player.adminNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
            </>
          )}
          <Pagination {...paginationProps} onPageChange={paginationProps.setCurrentPage} />
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

      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        {createOpen && <CreatePlayerDialog teams={allTeams || []} onClose={() => setCreateOpen(false)} />}
      </Dialog>
    </AdminLayout>
  );
}
