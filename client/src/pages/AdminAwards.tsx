import { AdminLayout } from "@/components/AdminLayout";
import { useAllAwards, useCreateAward, useUpdateAward, useDeleteAward } from "@/hooks/use-awards";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Trophy, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Award } from "@shared/schema";

const AWARD_CATEGORIES = [
  "Champions",
  "Runner Up",
  "Champions MVP",
  "Runner Up MVP",
  "Most Valuable Player",
  "Best Goalkeeper",
  "Top Scorer",
  "Best Defenseman",
  "Sportsmanship Award",
];

function AwardDialog({
  award,
  onClose,
}: {
  award?: Award;
  onClose: () => void;
}) {
  const createAward = useCreateAward();
  const updateAward = useUpdateAward();
  const { toast } = useToast();
  const isEdit = !!award;

  const { data: tournaments } = useTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    award?.tournamentId ? String(award.tournamentId) : "none"
  );
  const activeTournamentId = selectedTournamentId !== "none" ? Number(selectedTournamentId) : null;
  const { data: divisions } = useDivisions(activeTournamentId || 0);

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    award?.divisionId ? String(award.divisionId) : "none"
  );

  const [tournamentName, setTournamentName] = useState(award?.tournamentName || "");
  const [divisionName, setDivisionName] = useState(award?.divisionName || "");
  const [year, setYear] = useState(award?.year || new Date().getFullYear());
  const [category, setCategory] = useState(award?.category || AWARD_CATEGORIES[0]);
  const [teamName, setTeamName] = useState(award?.teamName || "");
  const [playerName, setPlayerName] = useState(award?.playerName || "");
  const [teamLogoUrl, setTeamLogoUrl] = useState(award?.teamLogoUrl || "");

  const handleTournamentChange = (val: string) => {
    setSelectedTournamentId(val);
    setSelectedDivisionId("none");
    if (val !== "none") {
      const t = tournaments?.find(t => String(t.id) === val);
      if (t) {
        setTournamentName(t.name);
        setYear(t.year);
      }
    } else {
      setTournamentName("");
    }
    setDivisionName("");
  };

  const handleDivisionChange = (val: string) => {
    setSelectedDivisionId(val);
    if (val !== "none") {
      const d = divisions?.find(d => String(d.id) === val);
      if (d) setDivisionName(d.name);
    } else {
      setDivisionName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournamentName.trim()) {
      toast({ title: "Please enter a tournament name", variant: "destructive" });
      return;
    }
    if (!divisionName.trim()) {
      toast({ title: "Please enter a division name", variant: "destructive" });
      return;
    }
    if (!year || year < 2000 || year > 2100) {
      toast({ title: "Please enter a valid year", variant: "destructive" });
      return;
    }
    if (!teamName && !playerName) {
      toast({ title: "Please enter a team name or player name", variant: "destructive" });
      return;
    }
    const data = {
      tournamentId: activeTournamentId,
      divisionId: selectedDivisionId !== "none" ? Number(selectedDivisionId) : null,
      tournamentName: tournamentName.trim(),
      divisionName: divisionName.trim(),
      year,
      category,
      teamName: teamName || null,
      playerName: playerName || null,
      teamLogoUrl: teamLogoUrl || null,
    };
    try {
      if (isEdit && award) {
        await updateAward.mutateAsync({ id: award.id, ...data });
        toast({ title: "Award updated" });
      } else {
        await createAward.mutateAsync(data as any);
        toast({ title: "Award created" });
      }
      onClose();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Link to Tournament</Label>
          <Select value={selectedTournamentId} onValueChange={handleTournamentChange}>
            <SelectTrigger data-testid="select-award-tournament">
              <SelectValue placeholder="Select tournament" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- None (manual entry) --</SelectItem>
              {(tournaments || []).map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Link to Division</Label>
          <Select
            value={selectedDivisionId}
            onValueChange={handleDivisionChange}
            disabled={!activeTournamentId}
          >
            <SelectTrigger data-testid="select-award-division">
              <SelectValue placeholder={activeTournamentId ? "Select division" : "Select tournament first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- None --</SelectItem>
              {(divisions || []).map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tournament Name</Label>
          <Input
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            placeholder="e.g., Salaam Cup 2024"
            data-testid="input-award-tournament-name"
          />
          <p className="text-xs text-muted-foreground mt-1">Auto-filled from selection, or type manually</p>
        </div>
        <div>
          <Label>Division Name</Label>
          <Input
            value={divisionName}
            onChange={(e) => setDivisionName(e.target.value)}
            placeholder="e.g., Men's Open"
            data-testid="input-award-division-name"
          />
          <p className="text-xs text-muted-foreground mt-1">Auto-filled from selection, or type manually</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Year</Label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            data-testid="input-award-year"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-award-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {AWARD_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Team Name</Label>
        <Input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g., Dirty Clan"
          data-testid="input-award-team-name"
        />
      </div>
      <div>
        <Label>Player Name (for individual awards)</Label>
        <Input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="e.g., Ahmed Khan"
          data-testid="input-award-player-name"
        />
      </div>
      <div>
        <Label>Team Logo URL</Label>
        <Input
          value={teamLogoUrl}
          onChange={(e) => setTeamLogoUrl(e.target.value)}
          placeholder="https://..."
          data-testid="input-award-logo-url"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={createAward.isPending || updateAward.isPending} data-testid="button-submit-award">
          {isEdit ? "Update" : "Create"} Award
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminAwards() {
  const { data: awards, isLoading } = useAllAwards();
  const deleteAward = useDeleteAward();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Award | null>(null);

  const [filterTournament, setFilterTournament] = useState<string>("all");
  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");

  const tournamentNames = Array.from(new Set((awards || []).map((a) => a.tournamentName).filter(Boolean))).sort();
  const divisionNames = Array.from(new Set((awards || []).map((a) => a.divisionName).filter(Boolean))).sort();
  const years = Array.from(new Set((awards || []).map((a) => a.year))).sort((a, b) => b - a);

  const filteredAwards = (awards || []).filter((a) => {
    if (filterTournament !== "all" && a.tournamentName !== filterTournament) return false;
    if (filterDivision !== "all" && a.divisionName !== filterDivision) return false;
    if (filterYear !== "all" && a.year !== Number(filterYear)) return false;
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAward.mutateAsync({ id: deleteTarget.id });
      toast({ title: "Award deleted" });
      setDeleteTarget(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const openEdit = (award: Award) => {
    setEditingAward(award);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingAward(undefined);
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-3xl font-bold font-display" data-testid="text-admin-awards-title">
          Awards Management
        </h1>
        <Button onClick={openCreate} className="bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-green-600
gap-2" data-testid="button-create-award">
          <Plus className="h-4 w-4" /> Add Award
        </Button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Select value={filterTournament} onValueChange={setFilterTournament}>
          <SelectTrigger className="w-48" data-testid="select-filter-tournament">
            <SelectValue placeholder="Tournament" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tournaments</SelectItem>
            {tournamentNames.map((name) => (
              <SelectItem key={name} value={name!}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDivision} onValueChange={setFilterDivision}>
          <SelectTrigger className="w-40" data-testid="select-filter-division">
            <SelectValue placeholder="Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisionNames.map((name) => (
              <SelectItem key={name} value={name!}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-32" data-testid="select-filter-year">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filteredAwards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No awards found. Add your first award above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAwards.map((award) => (
            <div key={award.id} className="bg-card border rounded-md p-4 flex items-center justify-between gap-4" data-testid={`card-award-${award.id}`}>
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {award.teamLogoUrl ? (
                    <img src={award.teamLogoUrl} alt="" className="w-8 h-8 object-contain rounded-full" />
                  ) : (
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm truncate">
                      {award.category === "Champions" || award.category === "Runner Up"
                        ? (award.teamName || "TBD")
                        : (award.playerName || "TBD")}
                    </span>
                    <Badge variant="secondary" className="text-xs">{award.category}</Badge>
                    <Badge variant="outline" className="text-xs">{award.year}</Badge>
                    {award.tournamentId && <Badge variant="outline" className="text-xs border-green-500 text-green-600">Linked</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {award.tournamentName || "Unknown Tournament"} — {award.divisionName || "Unknown Division"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button className="bg-amber-400 text-white hover:bg-white hover:text-amber-400 hover:border-amber-400" size="icon" variant="ghost" onClick={() => openEdit(award)} data-testid={`button-edit-award-${award.id}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button className="bg-red-700 text-white hover:bg-white hover:text-red-700 hover:border-red-700" size="icon" variant="ghost" onClick={() => setDeleteTarget(award)} data-testid={`button-delete-award-${award.id}`}>
                  <Trash2 className="h-4 w-4 " />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAward ? "Edit Award" : "Add Award"}</DialogTitle>
          </DialogHeader>
          <AwardDialog
            key={editingAward?.id || "new"}
            award={editingAward}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Award</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {deleteTarget?.category} award for "{deleteTarget?.teamName || deleteTarget?.playerName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteAward.isPending} data-testid="button-confirm-delete">
              {deleteAward.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
