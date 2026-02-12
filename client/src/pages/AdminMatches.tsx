import { AdminLayout } from "@/components/AdminLayout";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { useMatches, useCreateMatch, useUpdateMatch, useDeleteMatch, useImportMatches } from "@/hooks/use-matches";
import { useAllTeams } from "@/hooks/use-teams";
import { useVenues } from "@/hooks/use-venues";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { Loader2, Plus, Pencil, Trash2, Calendar, Upload, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Papa from "papaparse";
import type { Match, Team, Division, Tournament, Venue } from "@shared/schema";

type MatchWithTeams = Match & { homeTeam: Team | null; awayTeam: Team | null };

function MatchFormDialog({
  match,
  open,
  onClose,
  tournamentId,
  divisions,
  teams,
  venues,
}: {
  match?: MatchWithTeams;
  open: boolean;
  onClose: () => void;
  tournamentId: number;
  divisions: Division[];
  teams: Team[];
  venues: Venue[];
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
  const [venueId, setVenueId] = useState<string>(match?.venueId ? String(match.venueId) : "none");
  const [fieldLocation, setFieldLocation] = useState(match?.fieldLocation || "");

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
      venueId: venueId && venueId !== "none" ? Number(venueId) : null,
      fieldLocation: fieldLocation.trim() || null,
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Venue</label>
              <Select value={venueId} onValueChange={setVenueId}>
                <SelectTrigger data-testid="select-match-venue"><SelectValue placeholder="Select venue" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- None --</SelectItem>
                  {venues.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Field / Rink</label>
              <Input
                data-testid="input-match-field-location"
                value={fieldLocation}
                onChange={e => setFieldLocation(e.target.value)}
                placeholder="e.g. Field 1, Rink A"
              />
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
  const { data: venues } = useVenues();
  const deleteMatch = useDeleteMatch();
  const importMatches = useImportMatches();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<MatchWithTeams | null>(null);
  const [deleteMatchState, setDeleteMatchState] = useState<MatchWithTeams | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Record<string, string>[] | null>(null);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[]; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownloadTemplate = () => {
    const csvContent = "division,homeTeam,awayTeam,date,time,round,matchNumber,status,homeScore,awayScore,venue,fieldLocation\nMen's Open,Team A,Team B,2025-06-15,10:00 AM,Group Stage,1,scheduled,0,0,Paramount Fine Foods Centre,Rink 1";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matches_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        if (rows.length === 0) {
          toast({ title: "CSV file is empty", variant: "destructive" });
          return;
        }
        setImportPreview(rows);
        setImportResult(null);
        setImportOpen(true);
      },
      error: (err) => {
        toast({ title: "Failed to parse CSV", description: err.message, variant: "destructive" });
      },
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportConfirm = async () => {
    if (!importPreview || !activeTournamentId) return;
    try {
      const result = await importMatches.mutateAsync({
        tournamentId: activeTournamentId,
        matches: importPreview,
      });
      setImportResult(result);
      if (result.created > 0) {
        toast({ title: `${result.created} matches imported successfully` });
      }
      if (result.errors.length > 0 && result.created === 0) {
        toast({ title: "Import failed", description: "See errors below", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Import failed", description: (err as Error).message, variant: "destructive" });
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
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={handleDownloadTemplate} data-testid="button-download-csv-template">
            <Download className="h-4 w-4" /> CSV Template
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={!activeTournamentId} data-testid="button-import-csv">
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
          <Button className="gap-2" onClick={() => setCreateOpen(true)} disabled={!activeTournamentId} data-testid="button-create-match">
            <Plus className="h-4 w-4" /> Create Match
          </Button>
        </div>
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
                    {match.venueId && venues && (
                      <span className="ml-2">{venues.find(v => v.id === match.venueId)?.name}</span>
                    )}
                    {match.fieldLocation && (
                      <span className="ml-1">({match.fieldLocation})</span>
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
          venues={venues || []}
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
          venues={venues || []}
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

      <Dialog open={importOpen} onOpenChange={(o) => { if (!o) { setImportOpen(false); setImportPreview(null); setImportResult(null); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Matches from CSV</DialogTitle>
            <DialogDescription>
              Review the parsed data below before importing. Division and team names must match existing records exactly.
            </DialogDescription>
          </DialogHeader>

          {importResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-md bg-muted">
                {importResult.created > 0 ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
                )}
                <div>
                  <p className="font-medium">{importResult.created} of {importResult.total} matches imported</p>
                  {importResult.errors.length > 0 && (
                    <p className="text-sm text-muted-foreground">{importResult.errors.length} row(s) had errors</p>
                  )}
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">Errors:</p>
                  <div className="bg-muted rounded-md p-3 max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{err}</p>
                    ))}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => { setImportOpen(false); setImportPreview(null); setImportResult(null); }} data-testid="button-import-close">
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : importPreview ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">#</th>
                      <th className="text-left p-2 font-medium">Division</th>
                      <th className="text-left p-2 font-medium">Home</th>
                      <th className="text-left p-2 font-medium">Away</th>
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Time</th>
                      <th className="text-left p-2 font-medium">Round</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                        <td className="p-2">{row.division || "-"}</td>
                        <td className="p-2">{row.homeTeam || "-"}</td>
                        <td className="p-2">{row.awayTeam || "-"}</td>
                        <td className="p-2">{row.date || "-"}</td>
                        <td className="p-2">{row.time || "-"}</td>
                        <td className="p-2">{row.round || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importPreview.length > 20 && (
                  <p className="text-xs text-muted-foreground mt-2">Showing first 20 of {importPreview.length} rows</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setImportOpen(false); setImportPreview(null); }} data-testid="button-import-cancel">
                  Cancel
                </Button>
                <Button onClick={handleImportConfirm} disabled={importMatches.isPending} data-testid="button-import-confirm">
                  {importMatches.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                  Import {importPreview.length} Matches
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
