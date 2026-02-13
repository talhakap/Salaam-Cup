import { AdminLayout } from "@/components/AdminLayout";
import { useVenues, useCreateVenue, useUpdateVenue, useDeleteVenue } from "@/hooks/use-venues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Venue } from "@shared/schema";

function VenueDialog({
  item,
  onClose,
}: {
  item?: Venue;
  onClose: () => void;
}) {
  const createVenue = useCreateVenue();
  const updateVenue = useUpdateVenue();
  const { toast } = useToast();
  const isEdit = !!item;

  const [name, setName] = useState(item?.name || "");
  const [address, setAddress] = useState(item?.address || "");
  const [mapLink, setMapLink] = useState(item?.mapLink || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Please enter a venue name", variant: "destructive" });
      return;
    }
    if (!address.trim()) {
      toast({ title: "Please enter an address", variant: "destructive" });
      return;
    }
    try {
      const data = {
        name: name.trim(),
        address: address.trim(),
        mapLink: mapLink.trim() || null,
      };
      if (isEdit && item) {
        await updateVenue.mutateAsync({ id: item.id, ...data });
        toast({ title: "Venue updated" });
      } else {
        await createVenue.mutateAsync(data);
        toast({ title: "Venue created" });
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
          <DialogTitle data-testid="text-venue-dialog-title">{isEdit ? "Edit Venue" : "Add Venue"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update the venue details." : "Create a new venue."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              data-testid="input-venue-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Main Sports Complex"
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              data-testid="input-venue-address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, City, State"
            />
          </div>
          <div className="space-y-2">
            <Label>Map Link (optional)</Label>
            <Input
              data-testid="input-venue-map-link"
              value={mapLink}
              onChange={e => setMapLink(e.target.value)}
              placeholder="e.g. https://maps.google.com/..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              data-testid={isEdit ? "button-save-venue" : "button-create-venue-submit"}
              disabled={createVenue.isPending || updateVenue.isPending}
            >
              {(createVenue.isPending || updateVenue.isPending) && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {isEdit ? "Save Changes" : "Create Venue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminVenues() {
  const { data: venues, isLoading } = useVenues();
  const deleteVenue = useDeleteVenue();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Venue | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Venue | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVenue.mutateAsync(deleteTarget.id);
      toast({ title: "Venue deleted" });
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
            <h1 className="text-2xl font-bold" data-testid="text-admin-venues-title">Venues</h1>
            <p className="text-muted-foreground text-sm">Manage tournament venues and locations</p>
          </div>
          <Button
            data-testid="button-add-venue"
            onClick={() => { setEditItem(undefined); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Venue
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !venues?.length ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <MapPin className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p className="font-medium">No venues yet</p>
              <p className="text-sm mt-1">Add your first venue to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {venues.map(venue => (
              <Card key={venue.id} data-testid={`card-venue-${venue.id}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h3 className="font-semibold" data-testid={`text-venue-name-${venue.id}`}>{venue.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-edit-venue-${venue.id}`}
                        onClick={() => { setEditItem(venue); setDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-delete-venue-${venue.id}`}
                        onClick={() => setDeleteTarget(venue)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid={`text-venue-address-${venue.id}`}>{venue.address}</p>
                  {venue.mapLink && (
                    <a
                      href={venue.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary inline-flex items-center gap-1"
                      data-testid={`link-venue-map-${venue.id}`}
                    >
                      <ExternalLink className="h-3 w-3" /> View Map
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {dialogOpen && (
        <VenueDialog
          item={editItem}
          onClose={() => setDialogOpen(false)}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Venue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteVenue.isPending} data-testid="button-confirm-delete">
              {deleteVenue.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
