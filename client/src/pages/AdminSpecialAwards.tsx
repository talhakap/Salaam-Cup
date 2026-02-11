import { AdminLayout } from "@/components/AdminLayout";
import { useSpecialAwards, useCreateSpecialAward, useUpdateSpecialAward, useDeleteSpecialAward } from "@/hooks/use-special-awards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { Plus, Pencil, Trash2, Award, Upload, Loader2, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import type { SpecialAward } from "@shared/schema";

function SpecialAwardDialog({
  item,
  onClose,
}: {
  item?: SpecialAward;
  onClose: () => void;
}) {
  const createAward = useCreateSpecialAward();
  const updateAward = useUpdateSpecialAward();
  const { toast } = useToast();
  const isEdit = !!item;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [header, setHeader] = useState(item?.header || "");
  const [description, setDescription] = useState(item?.description || "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || "");
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setImageUrl(response.objectPath);
      toast({ title: "Image uploaded" });
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
    if (!header.trim()) {
      toast({ title: "Please enter a header", variant: "destructive" });
      return;
    }
    if (!description.trim()) {
      toast({ title: "Please enter a description", variant: "destructive" });
      return;
    }
    if (!imageUrl.trim()) {
      toast({ title: "Please upload or enter an image", variant: "destructive" });
      return;
    }
    const data = {
      header: header.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      sortOrder,
    };
    try {
      if (isEdit && item) {
        await updateAward.mutateAsync({ id: item.id, ...data });
        toast({ title: "Special award updated" });
      } else {
        await createAward.mutateAsync(data);
        toast({ title: "Special award created" });
      }
      onClose();
    } catch {
      toast({ title: "Failed to save special award", variant: "destructive" });
    }
  };

  const isPending = createAward.isPending || updateAward.isPending;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-special-award">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Special Award" : "Add Special Award"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Header</Label>
            <Input value={header} onChange={e => setHeader(e.target.value)} placeholder="Award name or title" data-testid="input-special-award-header" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description of the award or recipient"
              rows={4}
              data-testid="input-special-award-description"
            />
          </div>
          <div>
            <Label>Image</Label>
            <div className="space-y-2">
              {imageUrl && (
                <div className="bg-muted rounded-md p-2 flex items-center justify-center">
                  <img src={imageUrl} alt="Preview" className="max-h-32 object-contain rounded-md" data-testid="img-special-award-preview" />
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
                  data-testid="button-upload-special-award-image"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
              <Input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Or paste image URL"
                data-testid="input-special-award-image-url"
              />
            </div>
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} data-testid="input-special-award-sort" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} data-testid="button-save-special-award">
              {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSpecialAwards() {
  const { data: awardsList, isLoading } = useSpecialAwards();
  const deleteAward = useDeleteSpecialAward();
  const { toast } = useToast();
  const [editing, setEditing] = useState<SpecialAward | undefined>();
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this special award?")) return;
    try {
      await deleteAward.mutateAsync(id);
      toast({ title: "Special award deleted" });
    } catch {
      toast({ title: "Failed to delete special award", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display" data-testid="text-admin-special-awards-title">Special Awards</h1>
            <p className="text-muted-foreground text-sm">Manage the "We Admire Them" section on the About page</p>
          </div>
          <Button onClick={() => { setEditing(undefined); setShowDialog(true); }} data-testid="button-add-special-award">
            <Plus className="h-4 w-4 mr-2" /> Add Award
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-60 rounded-lg" />)}
          </div>
        ) : !awardsList?.length ? (
          <div className="text-center py-16 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No special awards yet</p>
            <p className="text-sm">Add awards to display in the "We Admire Them" section on the About page</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {awardsList.map(a => (
              <div
                key={a.id}
                className="bg-card border rounded-md overflow-hidden"
                data-testid={`card-special-award-${a.id}`}
              >
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {a.imageUrl ? (
                    <img src={a.imageUrl} alt={a.header} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold font-display text-sm" data-testid={`text-special-award-header-${a.id}`}>{a.header}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3" data-testid={`text-special-award-desc-${a.id}`}>{a.description}</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { setEditing(a); setShowDialog(true); }}
                      data-testid={`button-edit-special-award-${a.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(a.id)}
                      data-testid={`button-delete-special-award-${a.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDialog && (
          <SpecialAwardDialog
            item={editing}
            onClose={() => { setShowDialog(false); setEditing(undefined); }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
