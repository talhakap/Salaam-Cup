import { AdminLayout } from "@/components/AdminLayout";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { useMatches, useCreateMatch, useUpdateMatch, useDeleteMatch } from "@/hooks/use-matches";
import { useAllTeams } from "@/hooks/use-teams";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Match, Team, Division, Tournament } from "@shared/schema";

type MatchWithTeams = Match & { homeTeam: Team | null; awayTeam: Team | null };

function MatchFormDialog({
  match,
  open,
  onClose,
  tournamentId,
  divisions,
  teams,
}: {
  match?: MatchWithTeams;
  open: boolean;
  onClose: () => void;
  tournamentId: number;
  divisions: Division[];
  teams: Team[];
}) {
  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const { toast } = useToast();
  const isEdit = !!match;

  const [divisionId, setDivisionId] = useState<string>(match ? String(match.divisionId) : (divisions[0] ? String(divisions[0].id) : ""));
  const [homeTeamId, setHomeTeamId] = useState<string>(match?.homeTeamId ? String(match.homeTeamId) : "");
  const [awayTeamId, setAwayTeamId] = useState<string>(match?.awayTeamId ? String(match.awayTeamId) : "");
  const [startTime, setStartTime] = useState(match?.startTime ? new Date(match.startTime).toISOString().slice(0, 16) : "");
  const [homeScore, setHomeScore] = useState(match?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match?.awayScore ?? 0);
  const [status, setStatus] = useState<string>(match?.status || "scheduled");
  const [round, setRound] = useState(match?.round || "");
  const [matchNumber, setMatchNumber] = useState(match?.matchNumber ?? 0);

  const filteredTeams = divisionId ? teams.filter(t => t.divisionId === Number(divisionId)) : teams;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      tournamentId,
      divisionId: Number(divisionId),
      homeTeamId: homeTeamId && homeTeamId !== "none" ? Number(homeTeamId) : null,
      awayTeamId: awayTeamId && awayTeamId !== "none" ? Number(awayTeamId) : null,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      homeScore,
      awayScore,
      status,
      round: round || null,
      matchNumber: matchNumber || null,
    };
    try {
      if (isEdit && match) {
        await updateMatch.mutateAsync({ id: match.id, ...data });
        toast({ title: "Match updated" });
      } else {
        await createMatch.mutateAsync(data);
        toast({ title: "Match created" });
      }
      onClose();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Match" : "Create Match"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update match details and scores." : "Add a new match to this tournament."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Division</label>
            <Select value={divisionId} onValueChange={setDivisionId}>
              <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
              <SelectContent>
                {divisions.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Home Team</label>
              <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- None --</SelectItem>
                  {filteredTeams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Away Team</label>
              <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- None --</SelectItem>
                  {filteredTeams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Home Score</label>
              <Input type="number" value={homeScore} onChange={e => setHomeScore(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-sm font-medium">Away Score</label>
              <Input type="number" value={awayScore} onChange={e => setAwayScore(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date & Time</label>
              <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Round</label>
              <Input value={round} onChange={e => setRound(e.target.value)} placeholder="e.g. Group Stage, Semifinal" />
            </div>
            <div>
              <label className="text-sm font-medium">Match #</label>
              <Input type="number" value={matchNumber} onChange={e => setMatchNumber(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMatch.isPending || updateMatch.isPending} data-testid={isEdit ? "button-save-match" : "button-create-match-submit"}>
              {(createMatch.isPending || updateMatch.isPending) && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminMatches() {
  const { data: tournaments, isLoading: tournamentsLoading } = useTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const activeTournamentId = selectedTournamentId || (tournaments?.[0]?.id ?? 0);
  const { data: matches, isLoading: matchesLoading } = useMatches(activeTournamentId);
  const { data: divisions } = useDivisions(activeTournamentId);
  const { data: allTeams } = useAllTeams();
  const deleteMatch = useDeleteMatch();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<MatchWithTeams | null>(null);
  const [deleteMatchState, setDeleteMatchState] = useState<MatchWithTeams | null>(null);

  const tournamentTeams = allTeams?.filter(t => t.tournamentId === activeTournamentId && t.status === "approved") || [];

  const handleDelete = async () => {
    if (!deleteMatchState) return;
    try {
      await deleteMatch.mutateAsync({ id: deleteMatchState.id, tournamentId: activeTournamentId });
      toast({ title: "Match deleted" });
      setDeleteMatchState(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "live": return "destructive" as const;
      case "final": return "default" as const;
      case "cancelled": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  const getDivisionName = (divisionId: number) => divisions?.find(d => d.id === divisionId)?.name || "";

  return (
    <AdminLayout>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-secondary" data-testid="text-admin-matches-title">Match Management</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage matches</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)} disabled={!activeTournamentId} data-testid="button-create-match">
          <Plus className="h-4 w-4" /> Create Match
        </Button>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium mr-2">Tournament:</label>
        {tournamentsLoading ? (
          <Loader2 className="h-4 w-4 animate-spin inline" />
        ) : (
          <Select
            value={String(activeTournamentId)}
            onValueChange={v => setSelectedTournamentId(Number(v))}
          >
            <SelectTrigger className="w-[260px] inline-flex">
              <SelectValue placeholder="Select tournament" />
            </SelectTrigger>
            <SelectContent>
              {tournaments?.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name} ({t.year})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {matchesLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !matches || matches.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No matches scheduled</p>
          <p className="text-sm mt-1">Create your first match to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match: MatchWithTeams) => (
            <Card key={match.id} data-testid={`card-match-${match.id}`}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <Badge variant={statusBadge(match.status)}>{match.status}</Badge>
                    <Badge variant="outline">{getDivisionName(match.divisionId)}</Badge>
                    {match.round && <Badge variant="secondary">{match.round}</Badge>}
                    {match.matchNumber ? <span className="text-xs text-muted-foreground">Match #{match.matchNumber}</span> : null}
                  </div>
                  <div className="font-bold text-lg mt-1" data-testid={`text-match-teams-${match.id}`}>
                    {match.homeTeam?.name || "TBD"} vs {match.awayTeam?.name || "TBD"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {match.status === "final" || match.status === "live" ? (
                      <span className="font-semibold text-foreground">{match.homeScore} - {match.awayScore}</span>
                    ) : null}
                    {match.startTime && (
                      <span className="ml-2">{format(new Date(match.startTime), "MMM d, yyyy h:mm a")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => setEditMatch(match)} data-testid={`button-edit-match-${match.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteMatchState(match)} data-testid={`button-delete-match-${match.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {createOpen && activeTournamentId && divisions && (
        <MatchFormDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          tournamentId={activeTournamentId}
          divisions={divisions}
          teams={tournamentTeams}
        />
      )}

      {editMatch && divisions && (
        <MatchFormDialog
          match={editMatch}
          open={!!editMatch}
          onClose={() => setEditMatch(null)}
          tournamentId={activeTournamentId}
          divisions={divisions}
          teams={tournamentTeams}
        />
      )}

      <Dialog open={!!deleteMatchState} onOpenChange={(o) => !o && setDeleteMatchState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Match</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this match ({deleteMatchState?.homeTeam?.name || "TBD"} vs {deleteMatchState?.awayTeam?.name || "TBD"})?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMatchState(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMatch.isPending} data-testid="button-confirm-delete-match">
              {deleteMatch.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
