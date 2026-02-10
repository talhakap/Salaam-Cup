import { AdminLayout } from "@/components/AdminLayout";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { useAwards, useCreateAward, useUpdateAward, useDeleteAward } from "@/hooks/use-awards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Trophy, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { Award, Tournament, Division } from "@shared/schema";

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
  tournamentId,
  divisions,
  onClose,
}: {
  award?: Award;
  tournamentId: number;
  divisions: Division[];
  onClose: () => void;
}) {
  const createAward = useCreateAward();
  const updateAward = useUpdateAward();
  const { toast } = useToast();
  const isEdit = !!award;

  const [divisionId, setDivisionId] = useState<string>(award ? String(award.divisionId) : (divisions[0] ? String(divisions[0].id) : ""));
  const [year, setYear] = useState(award?.year || new Date().getFullYear());
  const [category, setCategory] = useState(award?.category || AWARD_CATEGORIES[0]);
  const [teamName, setTeamName] = useState(award?.teamName || "");
  const [playerName, setPlayerName] = useState(award?.playerName || "");
  const [teamLogoUrl, setTeamLogoUrl] = useState(award?.teamLogoUrl || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divisionId) {
      toast({ title: "Please select a division", variant: "destructive" });
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
      tournamentId,
      divisionId: Number(divisionId),
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
        await createAward.mutateAsync(data);
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
          <Label>Division</Label>
          <Select value={divisionId} onValueChange={setDivisionId}>
            <SelectTrigger data-testid="select-award-division">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Year</Label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            data-testid="input-award-year"
          />
        </div>
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
  const { data: tournaments, isLoading: tournamentsLoading } = useTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const tournamentId = selectedTournamentId ? Number(selectedTournamentId) : 0;

  const { data: divisions } = useDivisions(tournamentId);
  const { data: awards, isLoading: awardsLoading } = useAwards(tournamentId);
  const deleteAward = useDeleteAward();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");

  if (!selectedTournamentId && tournaments?.length) {
    setSelectedTournamentId(String(tournaments[0].id));
  }

  const filteredAwards = (awards || []).filter((a: Award) => {
    if (filterDivision !== "all" && a.divisionId !== Number(filterDivision)) return false;
    if (filterYear !== "all" && a.year !== Number(filterYear)) return false;
    return true;
  });

  const years = Array.from(new Set((awards || []).map((a: Award) => a.year))).sort((a, b) => b - a);

  const handleDelete = async (id: number) => {
    try {
      await deleteAward.mutateAsync({ id, tournamentId });
      toast({ title: "Award deleted" });
      setDeleteConfirm(null);
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
        <h1 className="text-2xl font-bold font-display" data-testid="text-admin-awards-title">
          Awards Management
        </h1>
        <Button onClick={openCreate} className="gap-2" disabled={!tournamentId} data-testid="button-create-award">
          <Plus className="h-4 w-4" /> Add Award
        </Button>
      </div>

      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">Tournament</Label>
        <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
          <SelectTrigger className="max-w-xs" data-testid="select-tournament-awards">
            <SelectValue placeholder="Select tournament" />
          </SelectTrigger>
          <SelectContent>
            {(tournaments || []).map((t: Tournament) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tournamentId > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <Select value={filterDivision} onValueChange={setFilterDivision}>
            <SelectTrigger className="w-40" data-testid="select-filter-division">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {(divisions || []).map((d: Division) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
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
      )}

      {tournamentsLoading || awardsLoading ? (
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
          {filteredAwards.map((award: Award) => {
            const div = divisions?.find((d: Division) => d.id === award.divisionId);
            return (
              <div key={award.id} className="bg-card border rounded-lg p-4 flex items-center justify-between gap-4" data-testid={`card-award-${award.id}`}>
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
                    </div>
                    <p className="text-xs text-muted-foreground">{div?.name || "Unknown Division"}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(award)} data-testid={`button-edit-award-${award.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {deleteConfirm === award.id ? (
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(award.id)} data-testid={`button-confirm-delete-award-${award.id}`}>
                        Delete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(award.id)} data-testid={`button-delete-award-${award.id}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAward ? "Edit Award" : "Add Award"}</DialogTitle>
          </DialogHeader>
          {tournamentId > 0 && divisions && (
            <AwardDialog
              award={editingAward}
              tournamentId={tournamentId}
              divisions={divisions}
              onClose={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
