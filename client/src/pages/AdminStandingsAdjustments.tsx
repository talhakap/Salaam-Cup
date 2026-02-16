import { AdminLayout } from "@/components/AdminLayout";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { useStandings } from "@/hooks/use-standings";
import { useStandingsAdjustments, useUpsertStandingsAdjustment, useDeleteStandingsAdjustment } from "@/hooks/use-standings-adjustments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Tournament, Division, StandingWithTeam, StandingsAdjustment } from "@shared/schema";

export default function AdminStandingsAdjustments() {
  const { data: tournaments } = useTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const { data: divisions } = useDivisions(selectedTournamentId || 0);
  const { data: allStandings } = useStandings(selectedTournamentId || 0);
  const { data: adjustments } = useStandingsAdjustments(selectedTournamentId || 0);
  const upsertAdjustment = useUpsertStandingsAdjustment();
  const deleteAdjustment = useDeleteStandingsAdjustment();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const [pointsAdj, setPointsAdj] = useState(0);
  const [winsAdj, setWinsAdj] = useState(0);
  const [lossesAdj, setLossesAdj] = useState(0);
  const [tiesAdj, setTiesAdj] = useState(0);
  const [gfAdj, setGfAdj] = useState(0);
  const [gaAdj, setGaAdj] = useState(0);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setSelectedTeamId(null);
    setSelectedDivisionId(null);
    setPointsAdj(0);
    setWinsAdj(0);
    setLossesAdj(0);
    setTiesAdj(0);
    setGfAdj(0);
    setGaAdj(0);
    setNotes("");
  };

  const teamsInStandings = (allStandings || []).filter((s: StandingWithTeam) => s.team);

  const handleSubmit = async () => {
    if (!selectedTournamentId || !selectedTeamId || !selectedDivisionId) {
      toast({ title: "Please select a team", variant: "destructive" });
      return;
    }
    try {
      await upsertAdjustment.mutateAsync({
        tournamentId: selectedTournamentId,
        teamId: selectedTeamId,
        divisionId: selectedDivisionId,
        pointsAdjustment: pointsAdj,
        winsAdjustment: winsAdj,
        lossesAdjustment: lossesAdj,
        tiesAdjustment: tiesAdj,
        goalsForAdjustment: gfAdj,
        goalsAgainstAdjustment: gaAdj,
        notes,
      });
      toast({ title: "Adjustment saved and standings recalculated" });
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async (adj: StandingsAdjustment) => {
    if (!selectedTournamentId) return;
    try {
      await deleteAdjustment.mutateAsync({ id: adj.id, tournamentId: selectedTournamentId });
      toast({ title: "Adjustment removed and standings recalculated" });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const openEditAdjustment = (adj: StandingsAdjustment) => {
    setSelectedTeamId(adj.teamId);
    setSelectedDivisionId(adj.divisionId);
    setPointsAdj(adj.pointsAdjustment);
    setWinsAdj(adj.winsAdjustment);
    setLossesAdj(adj.lossesAdjustment);
    setTiesAdj(adj.tiesAdjustment);
    setGfAdj(adj.goalsForAdjustment);
    setGaAdj(adj.goalsAgainstAdjustment);
    setNotes(adj.notes || "");
    setDialogOpen(true);
  };

  const getTeamName = (teamId: number) => {
    const standing = teamsInStandings.find((s: StandingWithTeam) => Number(s.teamId) === teamId);
    return standing?.team?.name || `Team #${teamId}`;
  };

  const getDivisionName = (divisionId: number) => {
    const div = (divisions || []).find((d: Division) => Number(d.id) === divisionId);
    return div?.name || `Division #${divisionId}`;
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold font-display mb-6" data-testid="text-standings-adjustments-title">Standings Adjustments</h1>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Select Tournament</label>
          <Select
            value={selectedTournamentId ? String(selectedTournamentId) : "none"}
            onValueChange={(v) => setSelectedTournamentId(v === "none" ? null : Number(v))}
          >
            <SelectTrigger className="max-w-md" data-testid="select-adj-tournament">
              <SelectValue placeholder="Choose a tournament" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Select Tournament --</SelectItem>
              {(tournaments || []).map((t: Tournament) => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTournamentId && (
          <>
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <h2 className="text-lg font-semibold">Current Adjustments</h2>
              <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-1" data-testid="button-add-adjustment">
                    <Plus className="h-4 w-4" /> Add Adjustment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add / Edit Standings Adjustment</DialogTitle>
                    <DialogDescription>Override calculated standings for a specific team. Adjustments are added to the calculated values.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Team</label>
                      <Select value={selectedTeamId ? String(selectedTeamId) : "none"} onValueChange={(v) => {
                        const tid = Number(v);
                        setSelectedTeamId(tid);
                        const standing = teamsInStandings.find((s: StandingWithTeam) => Number(s.teamId) === tid);
                        if (standing) setSelectedDivisionId(standing.divisionId);
                      }}>
                        <SelectTrigger data-testid="select-adj-team"><SelectValue placeholder="Select team" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Select Team --</SelectItem>
                          {teamsInStandings.map((s: StandingWithTeam) => (
                            <SelectItem key={s.teamId} value={String(s.teamId)}>{s.team?.name || `Team #${s.teamId}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Points Adj.</label>
                        <Input type="number" value={pointsAdj} onChange={(e) => setPointsAdj(parseInt(e.target.value) || 0)} data-testid="input-adj-points" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Wins Adj.</label>
                        <Input type="number" value={winsAdj} onChange={(e) => setWinsAdj(parseInt(e.target.value) || 0)} data-testid="input-adj-wins" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Losses Adj.</label>
                        <Input type="number" value={lossesAdj} onChange={(e) => setLossesAdj(parseInt(e.target.value) || 0)} data-testid="input-adj-losses" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Ties Adj.</label>
                        <Input type="number" value={tiesAdj} onChange={(e) => setTiesAdj(parseInt(e.target.value) || 0)} data-testid="input-adj-ties" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Goals For Adj.</label>
                        <Input type="number" value={gfAdj} onChange={(e) => setGfAdj(parseInt(e.target.value) || 0)} data-testid="input-adj-gf" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Goals Against Adj.</label>
                        <Input type="number" value={gaAdj} onChange={(e) => setGaAdj(parseInt(e.target.value) || 0)} data-testid="input-adj-ga" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes (reason for adjustment)</label>
                      <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Penalty deduction" data-testid="input-adj-notes" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmit} disabled={upsertAdjustment.isPending} data-testid="button-save-adjustment">
                      {upsertAdjustment.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Save Adjustment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {(!adjustments || adjustments.length === 0) ? (
              <p className="text-muted-foreground text-center py-8">No standings adjustments for this tournament.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead className="text-center">PTS</TableHead>
                      <TableHead className="text-center">W</TableHead>
                      <TableHead className="text-center">L</TableHead>
                      <TableHead className="text-center">T</TableHead>
                      <TableHead className="text-center">GF</TableHead>
                      <TableHead className="text-center">GA</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.map((adj: StandingsAdjustment) => (
                      <TableRow key={adj.id} data-testid={`row-adjustment-${adj.id}`}>
                        <TableCell className="font-medium">{getTeamName(adj.teamId)}</TableCell>
                        <TableCell>{getDivisionName(adj.divisionId)}</TableCell>
                        <TableCell className="text-center">{adj.pointsAdjustment > 0 ? `+${adj.pointsAdjustment}` : adj.pointsAdjustment}</TableCell>
                        <TableCell className="text-center">{adj.winsAdjustment > 0 ? `+${adj.winsAdjustment}` : adj.winsAdjustment}</TableCell>
                        <TableCell className="text-center">{adj.lossesAdjustment > 0 ? `+${adj.lossesAdjustment}` : adj.lossesAdjustment}</TableCell>
                        <TableCell className="text-center">{adj.tiesAdjustment > 0 ? `+${adj.tiesAdjustment}` : adj.tiesAdjustment}</TableCell>
                        <TableCell className="text-center">{adj.goalsForAdjustment > 0 ? `+${adj.goalsForAdjustment}` : adj.goalsForAdjustment}</TableCell>
                        <TableCell className="text-center">{adj.goalsAgainstAdjustment > 0 ? `+${adj.goalsAgainstAdjustment}` : adj.goalsAgainstAdjustment}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{adj.notes || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEditAdjustment(adj)} data-testid={`button-edit-adj-${adj.id}`}>
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(adj)} disabled={deleteAdjustment.isPending} data-testid={`button-delete-adj-${adj.id}`}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
