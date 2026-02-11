import { AdminLayout } from "@/components/AdminLayout";
import { useSponsors, useCreateSponsor, useUpdateSponsor, useDeleteSponsor } from "@/hooks/use-sponsors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { Plus, Pencil, Trash2, Handshake, Upload, Loader2, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import type { Sponsor } from "@shared/schema";

function SponsorDialog({
  item,
  onClose,
}: {
  item?: Sponsor;
  onClose: () => void;
}) {
  const createSponsor = useCreateSponsor();
  const updateSponsor = useUpdateSponsor();
  const { toast } = useToast();
  const isEdit = !!item;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(item?.name || "");
  const [logoUrl, setLogoUrl] = useState(item?.logoUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(item?.websiteUrl || "");
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setLogoUrl(response.objectPath);
      toast({ title: "Logo uploaded" });
    },
    onError: (error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    await uploadFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Please enter a sponsor name", variant: "destructive" });
      return;
    }
    if (!logoUrl.trim()) {
      toast({ title: "Please upload or enter a logo", variant: "destructive" });
      return;
    }
    const data = {
      name: name.trim(),
      logoUrl: logoUrl.trim(),
      websiteUrl: websiteUrl.trim() || null,
      sortOrder,
    };
    try {
      if (isEdit && item) {
        await updateSponsor.mutateAsync({ id: item.id, ...data });
        toast({ title: "Sponsor updated" });
      } else {
        await createSponsor.mutateAsync(data);
        toast({ title: "Sponsor created" });
      }
      onClose();
    } catch {
      toast({ title: "Failed to save sponsor", variant: "destructive" });
    }
  };

  const isPending = createSponsor.isPending || updateSponsor.isPending;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-sponsor">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Sponsor name" data-testid="input-sponsor-name" />
          </div>
          <div>
            <Label>Logo</Label>
            <div className="space-y-2">
              {logoUrl && (
                <div className="bg-muted rounded-md p-4 flex items-center justify-center">
                  <img src={logoUrl} alt="Preview" className="max-h-24 object-contain" data-testid="img-sponsor-preview" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  data-testid="button-upload-logo"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isUploading ? "Uploading..." : "Upload Logo"}
                </Button>
              </div>
              <Input
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="Or paste logo URL"
                data-testid="input-sponsor-logo-url"
              />
            </div>
          </div>
          <div>
            <Label>Website URL (optional)</Label>
            <Input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://..." data-testid="input-sponsor-website" />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} data-testid="input-sponsor-sort" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} data-testid="button-save-sponsor">
              {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSponsors() {
  const { data: sponsorsList, isLoading } = useSponsors();
  const deleteSponsor = useDeleteSponsor();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Sponsor | undefined>();
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this sponsor?")) return;
    try {
      await deleteSponsor.mutateAsync(id);
      toast({ title: "Sponsor deleted" });
    } catch {
      toast({ title: "Failed to delete sponsor", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display" data-testid="text-admin-sponsors-title">Sponsors</h1>
            <p className="text-muted-foreground text-sm">Manage sponsor logos displayed on the home page</p>
          </div>
          <Button onClick={() => { setEditing(undefined); setShowDialog(true); }} data-testid="button-add-sponsor">
            <Plus className="h-4 w-4 mr-2" /> Add Sponsor
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        ) : !sponsorsList?.length ? (
          <div className="text-center py-16 text-muted-foreground">
            <Handshake className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No sponsors yet</p>
            <p className="text-sm">Add sponsors to display their logos on the home page</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {sponsorsList.map(s => (
              <div
                key={s.id}
                className="bg-card border rounded-md p-4 flex flex-col items-center gap-3"
                data-testid={`card-sponsor-${s.id}`}
              >
                <div className="bg-muted rounded-md p-4 w-full flex items-center justify-center min-h-[80px]">
                  {s.logoUrl ? (
                    <img src={s.logoUrl} alt={s.name} className="max-h-16 object-contain" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <p className="font-semibold text-sm text-center" data-testid={`text-sponsor-name-${s.id}`}>{s.name}</p>
                {s.websiteUrl && (
                  <a href={s.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground truncate max-w-full">
                    {s.websiteUrl}
                  </a>
                )}
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { setEditing(s); setShowDialog(true); }}
                    data-testid={`button-edit-sponsor-${s.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(s.id)}
                    data-testid={`button-delete-sponsor-${s.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDialog && (
          <SponsorDialog
            item={editing}
            onClose={() => { setShowDialog(false); setEditing(undefined); }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
