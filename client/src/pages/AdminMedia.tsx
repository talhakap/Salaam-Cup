import { AdminLayout } from "@/components/AdminLayout";
import {
  useMediaYears,
  useCreateMediaYear,
  useUpdateMediaYear,
  useDeleteMediaYear,
  useCreateMediaItem,
  useUpdateMediaItem,
  useDeleteMediaItem,
} from "@/hooks/use-media";
import { useUpload } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Upload,
  Loader2,
  ImageIcon,
  ChevronDown,
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { MediaYear, MediaItem, MediaYearWithItems } from "@shared/schema";

function MediaItemDialog({
  item,
  mediaYearId,
  onClose,
}: {
  item?: MediaItem;
  mediaYearId: number;
  onClose: () => void;
}) {
  const createItem = useCreateMediaItem();
  const updateItem = useUpdateMediaItem();
  const { toast } = useToast();
  const isEdit = !!item;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(item?.imageUrl || "");
  const [category, setCategory] = useState(item?.category || "");
  const [tournamentName, setTournamentName] = useState(item?.tournamentName || "");
  const [linkUrl, setLinkUrl] = useState(item?.linkUrl || "");
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);

  const { uploadFile, isUploading } = useUpload({
    folder: "media",
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
    if (!imageUrl.trim() || !category.trim() || !tournamentName.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        mediaYearId,
        imageUrl: imageUrl.trim(),
        category: category.trim(),
        tournamentName: tournamentName.trim(),
        linkUrl: linkUrl.trim() || undefined,
        sortOrder,
      };

      if (isEdit) {
        await updateItem.mutateAsync({ id: item.id, ...payload });
        toast({ title: "Card updated" });
      } else {
        await createItem.mutateAsync(payload);
        toast({ title: "Card added" });
      }
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Card" : "Add Card"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Image</Label>
            <div className="mt-1.5 space-y-2">
              {imageUrl ? (
                <div className="relative aspect-video rounded-md overflow-hidden border">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-foreground/30 transition-colors"
                  data-testid="upload-media-image"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      <span className="text-sm">Upload Image</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Input
                placeholder="Or paste image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                data-testid="input-media-image-url"
              />
            </div>
          </div>

          <div>
            <Label>Category</Label>
            <Input
              placeholder="e.g. Mens, Junior, Women"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5"
              data-testid="input-media-category"
            />
          </div>

          <div>
            <Label>Tournament Name</Label>
            <Input
              placeholder="e.g. Ball Hockey"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="mt-1.5"
              data-testid="input-media-tournament-name"
            />
          </div>

          <div>
            <Label>Link URL (optional)</Label>
            <Input
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="mt-1.5"
              data-testid="input-media-link-url"
            />
          </div>

          <div>
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="mt-1.5"
              data-testid="input-media-sort-order"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} data-testid="button-save-media-item">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEdit ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function YearSection({ yearData }: { yearData: MediaYearWithItems }) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<MediaItem | undefined>();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditYear, setShowEditYear] = useState(false);
  const deleteYear = useDeleteMediaYear();
  const updateYear = useUpdateMediaYear();
  const deleteItem = useDeleteMediaItem();
  const { toast } = useToast();

  const handleDeleteYear = async () => {
    if (!confirm(`Delete ${yearData.year} and all its cards?`)) return;
    try {
      await deleteYear.mutateAsync(yearData.id);
      toast({ title: `${yearData.year} deleted` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteItem = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.tournamentName}" card?`)) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast({ title: "Card deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card className="mb-4" data-testid={`admin-media-year-${yearData.year}`}>
      <div className="flex items-center justify-between gap-2 p-4 flex-wrap">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left"
          data-testid={`admin-media-year-toggle-${yearData.year}`}
        >
          <ChevronDown className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
          <h3 className="font-display text-xl font-bold">{yearData.year} Tournaments</h3>
          <span className="text-sm text-muted-foreground">({yearData.items.length} cards)</span>
        </button>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddItem(true)} data-testid={`button-add-card-${yearData.year}`}>
            <Plus className="w-4 h-4 mr-1" /> Add Card
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setShowEditYear(true)} data-testid={`button-edit-year-${yearData.year}`}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="destructive" onClick={handleDeleteYear} data-testid={`button-delete-year-${yearData.year}`}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4">
          {yearData.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No cards yet. Add a tournament card above.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {yearData.items.map((item) => (
                <Card key={item.id} className="overflow-hidden" data-testid={`admin-media-item-${item.id}`}>
                  <div className="aspect-[4/3] relative">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.tournamentName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground uppercase">{item.category}</p>
                    <p className="font-bold text-sm">{item.tournamentName}</p>
                    {item.linkUrl && (
                      <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate block mt-1">
                        {item.linkUrl}
                      </a>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <Button size="icon" variant="ghost" onClick={() => setEditingItem(item)} data-testid={`button-edit-item-${item.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item)} data-testid={`button-delete-item-${item.id}`}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {(showAddItem || editingItem) && (
        <MediaItemDialog
          item={editingItem}
          mediaYearId={yearData.id}
          onClose={() => {
            setShowAddItem(false);
            setEditingItem(undefined);
          }}
        />
      )}

      {showEditYear && (
        <EditYearDialog
          yearData={yearData}
          onClose={() => setShowEditYear(false)}
        />
      )}
    </Card>
  );
}

function EditYearDialog({ yearData, onClose }: { yearData: MediaYearWithItems; onClose: () => void }) {
  const updateYear = useUpdateMediaYear();
  const { toast } = useToast();
  const [year, setYear] = useState(yearData.year);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateYear.mutateAsync({ id: yearData.id, year });
      toast({ title: "Year updated" });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Year</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Year</Label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-1.5"
              min={2000}
              max={2100}
              data-testid="input-edit-year"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-edit-year">Cancel</Button>
            <Button type="submit" disabled={updateYear.isPending} data-testid="button-save-edit-year">
              {updateYear.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminMedia() {
  const { data: mediaYears, isLoading } = useMediaYears();
  const createYear = useCreateMediaYear();
  const { toast } = useToast();
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createYear.mutateAsync({ year: newYear, sortOrder: 0 });
      toast({ title: `${newYear} added` });
      setShowAddYear(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display" data-testid="text-admin-media-title">Media Gallery</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage media years and tournament cards for the gallery page.</p>
          </div>
          <Button onClick={() => setShowAddYear(true)} data-testid="button-add-year">
            <Plus className="w-4 h-4 mr-2" /> Add Year
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : mediaYears && mediaYears.length > 0 ? (
          mediaYears.map((yearData) => (
            <YearSection key={yearData.id} yearData={yearData} />
          ))
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg mb-2">No Years Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add a year to start building your media gallery.</p>
            <Button onClick={() => setShowAddYear(true)} data-testid="button-add-year-empty">
              <Plus className="w-4 h-4 mr-2" /> Add Year
            </Button>
          </Card>
        )}
      </div>

      {showAddYear && (
        <Dialog open onOpenChange={() => setShowAddYear(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Year</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddYear} className="space-y-4">
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                  className="mt-1.5"
                  min={2000}
                  max={2100}
                  data-testid="input-new-year"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddYear(false)}>Cancel</Button>
                <Button type="submit" disabled={createYear.isPending} data-testid="button-save-year">
                  {createYear.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Add Year
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
