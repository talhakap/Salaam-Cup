import { AdminLayout } from "@/components/AdminLayout";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { useStandings } from "@/hooks/use-standings";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, Loader2, Save, RotateCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { getStandingsColumns } from "@shared/standingsConfig";
import { api } from "@shared/routes";
import type { Tournament, Division, StandingWithTeam } from "@shared/schema";

export default function AdminStandingsAdjustments() {
  const { data: tournaments } = useTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const { data: divisions } = useDivisions(selectedTournamentId || 0);
  const { data: allStandings } = useStandings(selectedTournamentId || 0);
  const { toast } = useToast();

  const selectedTournament = (tournaments || []).find((t: Tournament) => Number(t.id) === selectedTournamentId);
  const columns = getStandingsColumns(selectedTournament?.standingsType);

  const filteredStandings = (allStandings || [])
    .filter((s: StandingWithTeam) => String(s.divisionId) === selectedDivisionId)
    .sort((a: StandingWithTeam, b: StandingWithTeam) => (a.position || 0) - (b.position || 0));

  const [localOrder, setLocalOrder] = useState<StandingWithTeam[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (filteredStandings.length > 0) {
      setLocalOrder([...filteredStandings]);
      setHasChanges(false);
    } else {
      setLocalOrder([]);
      setHasChanges(false);
    }
  }, [allStandings, selectedDivisionId]);

  useEffect(() => {
    if (selectedDivisionId === "" && divisions && divisions.length > 0) {
      setSelectedDivisionId(String(divisions[0].id));
    }
  }, [divisions, selectedDivisionId]);

  useEffect(() => {
    setSelectedDivisionId("");
  }, [selectedTournamentId]);

  const moveTeam = useCallback((index: number, direction: "up" | "down") => {
    const newOrder = [...localOrder];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    newOrder.forEach((s, i) => { s.position = i + 1; });
    setLocalOrder(newOrder);
    setHasChanges(true);
  }, [localOrder]);

  const reorderMutation = useMutation({
    mutationFn: async (data: { tournamentId: number; divisionId: number; teamPositions: { teamId: number; position: number }[] }) => {
      const res = await apiRequest("POST", `/api/tournaments/${data.tournamentId}/standings/reorder`, data);
      return res.json();
    },
    onSuccess: () => {
      if (selectedTournamentId) {
        queryClient.invalidateQueries({ queryKey: [api.standings.list.path, selectedTournamentId] });
      }
      toast({ title: "Standings order saved" });
      setHasChanges(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error saving order", description: err.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!selectedTournamentId || !selectedDivisionId) return;
    const teamPositions = localOrder.map((s, i) => ({
      teamId: Number(s.teamId),
      position: i + 1,
    }));
    reorderMutation.mutate({
      tournamentId: selectedTournamentId,
      divisionId: Number(selectedDivisionId),
      teamPositions,
    });
  };

  const handleReset = () => {
    setLocalOrder([...filteredStandings]);
    setHasChanges(false);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold font-display mb-6" data-testid="text-standings-reorder-title">Reorder Standings</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Tournament</label>
            <Select
              value={selectedTournamentId ? String(selectedTournamentId) : "none"}
              onValueChange={(v) => setSelectedTournamentId(v === "none" ? null : Number(v))}
            >
              <SelectTrigger data-testid="select-reorder-tournament">
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

          {selectedTournamentId && divisions && divisions.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Division</label>
              <Select
                value={selectedDivisionId || "none"}
                onValueChange={(v) => setSelectedDivisionId(v === "none" ? "" : v)}
              >
                <SelectTrigger data-testid="select-reorder-division">
                  <SelectValue placeholder="Choose a division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select Division --</SelectItem>
                  {divisions.map((d: Division) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedTournamentId && selectedDivisionId && (
          <>
            {hasChanges && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Button onClick={handleSave} disabled={reorderMutation.isPending} data-testid="button-save-reorder">
                  {reorderMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Order
                </Button>
                <Button variant="outline" onClick={handleReset} data-testid="button-reset-reorder">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <span className="text-sm text-muted-foreground">You have unsaved changes</span>
              </div>
            )}

            {localOrder.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-foreground">
                      <TableHead className="w-16 font-bold text-foreground">Pos</TableHead>
                      <TableHead className="w-20 font-bold text-foreground">Move</TableHead>
                      <TableHead className="font-bold text-foreground">Team</TableHead>
                      {columns.map((col) => (
                        <TableHead key={col.key} className="text-center font-bold text-foreground">{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localOrder.map((s: StandingWithTeam, index: number) => (
                      <TableRow key={`${s.divisionId}-${s.teamId}`} className="border-b" data-testid={`row-reorder-${s.teamId}`}>
                        <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              disabled={index === 0}
                              onClick={() => moveTeam(index, "up")}
                              data-testid={`button-move-up-${s.teamId}`}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              disabled={index === localOrder.length - 1}
                              onClick={() => moveTeam(index, "down")}
                              data-testid={`button-move-down-${s.teamId}`}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{s.team?.name || `Team #${s.teamId}`}</TableCell>
                        {columns.map((col) => (
                          <TableCell key={col.key} className={`text-center ${col.key === 'pts' || col.key === 'pct' ? 'font-bold' : ''}`}>
                            {col.getValue(s)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No standings available for this division yet.</p>
            )}
          </>
        )}

        {selectedTournamentId && !selectedDivisionId && divisions && divisions.length > 0 && (
          <p className="text-muted-foreground text-center py-12">Select a division to view and reorder standings.</p>
        )}

        {selectedTournamentId && divisions && divisions.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No divisions found for this tournament.</p>
        )}
      </div>
    </AdminLayout>
  );
}
