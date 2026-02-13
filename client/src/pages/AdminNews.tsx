import { AdminLayout } from "@/components/AdminLayout";
import { useNews, useCreateNews, useUpdateNews, useDeleteNews } from "@/hooks/use-news";
import { useTournaments } from "@/hooks/use-tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { Plus, Pencil, Trash2, Newspaper, Upload, Loader2, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { Pagination, usePagination } from "@/components/Pagination";
import type { News, Tournament } from "@shared/schema";

function NewsDialog({
  item,
  tournaments,
  onClose,
}: {
  item?: News;
  tournaments: Tournament[];
  onClose: () => void;
}) {
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const { toast } = useToast();
  const isEdit = !!item;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [headline, setHeadline] = useState(item?.headline || "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || "");
  const [publishedDate, setPublishedDate] = useState(item?.publishedDate || new Date().toISOString().split("T")[0]);
  const [tournamentId, setTournamentId] = useState<string>(item?.tournamentId ? String(item.tournamentId) : "none");

  const { uploadFile, isUploading } = useUpload({
    folder: "news",
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
    if (!headline.trim()) {
      toast({ title: "Please enter a headline", variant: "destructive" });
      return;
    }
    if (!imageUrl.trim()) {
      toast({ title: "Please upload or enter an image", variant: "destructive" });
      return;
    }
    const data = {
      headline: headline.trim(),
      imageUrl: imageUrl.trim(),
      publishedDate,
      tournamentId: tournamentId !== "none" ? Number(tournamentId) : null,
    };
    try {
      if (isEdit && item) {
        await updateNews.mutateAsync({ id: item.id, ...data });
        toast({ title: "News updated" });
      } else {
        await createNews.mutateAsync(data);
        toast({ title: "News created" });
      }
      onClose();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Headline</Label>
        <Input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="SSB RAINS ON THE OWLS PARADE..."
          data-testid="input-news-headline"
        />
      </div>
      <div>
        <Label>Image</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2 flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              data-testid="button-upload-news-image"
            >
              {isUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4" /> Upload Image</>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-news-file"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>or enter URL:</span>
          </div>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://... or upload above"
            data-testid="input-news-image-url"
          />
          {imageUrl && (
            <div className="mt-2 aspect-video max-w-xs rounded-md overflow-hidden bg-muted">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
      <div>
        <Label>Published Date</Label>
        <Input
          type="date"
          value={publishedDate}
          onChange={(e) => setPublishedDate(e.target.value)}
          data-testid="input-news-date"
        />
      </div>
      <div>
        <Label>Tournament (optional)</Label>
        <Select value={tournamentId} onValueChange={setTournamentId}>
          <SelectTrigger data-testid="select-news-tournament">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {tournaments.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={createNews.isPending || updateNews.isPending || isUploading} data-testid="button-submit-news">
          {isEdit ? "Update" : "Create"} News
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminNews() {
  const { data: newsItems, isLoading } = useNews();
  const { data: tournaments } = useTournaments();
  const deleteNews = useDeleteNews();
  const { toast } = useToast();

  const { paginatedItems: paginatedNews, ...paginationProps } = usePagination(newsItems, 10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<News | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNews.mutateAsync(deleteTarget.id);
      toast({ title: "News deleted" });
      setDeleteTarget(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const openEdit = (item: News) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold font-display" data-testid="text-admin-news-title">
          News Management
        </h1>
        <Button onClick={openCreate} className="gap-2" data-testid="button-create-news">
          <Plus className="h-4 w-4" /> Add News
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : !newsItems || newsItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No news items yet. Add your first news above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedNews?.map((item: News) => {
            const tournament = tournaments?.find((t: Tournament) => t.id === item.tournamentId);
            return (
              <div key={item.id} className="bg-card border rounded-md p-4 flex items-center gap-4" data-testid={`card-news-${item.id}`}>
                <div className="w-20 h-14 rounded-md overflow-hidden bg-muted shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm uppercase truncate" data-testid={`text-news-headline-${item.id}`}>{item.headline}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.publishedDate}
                    {tournament && <span className="ml-2">| {tournament.name}</span>}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(item)} data-testid={`button-edit-news-${item.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(item)} data-testid={`button-delete-news-${item.id}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
          <Pagination {...paginationProps} onPageChange={paginationProps.setCurrentPage} />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit News" : "Add News"}</DialogTitle>
          </DialogHeader>
          <NewsDialog
            key={editingItem?.id ?? "new"}
            item={editingItem}
            tournaments={tournaments || []}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.headline}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteNews.isPending} data-testid="button-confirm-delete">
              {deleteNews.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
