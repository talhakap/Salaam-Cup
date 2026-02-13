import { AdminLayout } from "@/components/AdminLayout";
import { useSports, useCreateSport, useUpdateSport, useDeleteSport } from "@/hooks/use-sports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Dumbbell, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Sport } from "@shared/schema";

function SportDialog({
  item,
  onClose,
}: {
  item?: Sport;
  onClose: () => void;
}) {
  const createSport = useCreateSport();
  const updateSport = useUpdateSport();
  const { toast } = useToast();
  const isEdit = !!item;

  const [name, setName] = useState(item?.name || "");
  const [icon, setIcon] = useState(item?.icon || "");
  const [description, setDescription] = useState(item?.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Please enter a sport name", variant: "destructive" });
      return;
    }
    try {
      const data = {
        name: name.trim(),
        icon: icon.trim() || null,
        description: description.trim() || null,
      };
      if (isEdit && item) {
        await updateSport.mutateAsync({ id: item.id, ...data });
        toast({ title: "Sport updated" });
      } else {
        await createSport.mutateAsync(data);
        toast({ title: "Sport created" });
      }
      onClose();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle data-testid="text-sport-dialog-title">{isEdit ? "Edit Sport" : "Add Sport"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update the sport details." : "Create a new sport."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              data-testid="input-sport-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ball Hockey"
            />
          </div>
          <div className="space-y-2">
            <Label>Icon (optional)</Label>
            <Input
              data-testid="input-sport-icon"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              placeholder="e.g. hockey, basketball, soccer"
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Input
              data-testid="input-sport-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Street ball hockey"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              data-testid={isEdit ? "button-save-sport" : "button-create-sport-submit"}
              disabled={createSport.isPending || updateSport.isPending}
            >
              {(createSport.isPending || updateSport.isPending) && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {isEdit ? "Save Changes" : "Create Sport"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSports() {
  const { data: sports, isLoading } = useSports();
  const deleteSport = useDeleteSport();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Sport | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Sport | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSport.mutateAsync(deleteTarget.id);
      toast({ title: "Sport deleted" });
      setDeleteTarget(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-sports-title">Sports</h1>
            <p className="text-muted-foreground text-sm">Manage sports types for tournaments</p>
          </div>
          <Button
            data-testid="button-add-sport"
            onClick={() => { setEditItem(undefined); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Sport
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !sports?.length ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <Dumbbell className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p className="font-medium">No sports yet</p>
              <p className="text-sm mt-1">Add your first sport to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sports.map(sport => (
              <Card key={sport.id} data-testid={`card-sport-${sport.id}`}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h3 className="font-semibold" data-testid={`text-sport-name-${sport.id}`}>{sport.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-edit-sport-${sport.id}`}
                        onClick={() => { setEditItem(sport); setDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-delete-sport-${sport.id}`}
                        onClick={() => setDeleteTarget(sport)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {sport.icon && (
                    <p className="text-xs text-muted-foreground" data-testid={`text-sport-icon-${sport.id}`}>Icon: {sport.icon}</p>
                  )}
                  {sport.description && (
                    <p className="text-sm text-muted-foreground" data-testid={`text-sport-desc-${sport.id}`}>{sport.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {dialogOpen && (
        <SportDialog
          item={editItem}
          onClose={() => setDialogOpen(false)}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sport</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? Tournaments linked to this sport may be affected. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteSport.isPending} data-testid="button-confirm-delete">
              {deleteSport.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
