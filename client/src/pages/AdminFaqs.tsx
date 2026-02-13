import { AdminLayout } from "@/components/AdminLayout";
import { useFaqs, useCreateFaq, useUpdateFaq, useDeleteFaq } from "@/hooks/use-faqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, HelpCircle, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Faq } from "@shared/schema";

function FaqDialog({
  item,
  onClose,
}: {
  item?: Faq;
  onClose: () => void;
}) {
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const { toast } = useToast();
  const isEdit = !!item;

  const [question, setQuestion] = useState(item?.question || "");
  const [answer, setAnswer] = useState(item?.answer || "");
  const [featured, setFeatured] = useState(item?.featured || false);
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast({ title: "Please enter a question", variant: "destructive" });
      return;
    }
    if (!answer.trim()) {
      toast({ title: "Please enter an answer", variant: "destructive" });
      return;
    }
    const data = {
      question: question.trim(),
      answer: answer.trim(),
      featured,
      sortOrder,
    };
    try {
      if (isEdit && item) {
        await updateFaq.mutateAsync({ id: item.id, ...data });
        toast({ title: "FAQ updated" });
      } else {
        await createFaq.mutateAsync(data);
        toast({ title: "FAQ created" });
      }
      onClose();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Question</Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What is Salaam Cup?"
          data-testid="input-faq-question"
        />
      </div>
      <div>
        <Label>Answer</Label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Salaam Cup is a premier community sports organization..."
          rows={5}
          data-testid="input-faq-answer"
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={featured}
          onCheckedChange={setFeatured}
          data-testid="switch-faq-featured"
        />
        <Label className="flex items-center gap-1.5">
          <Star className="w-4 h-4" />
          Featured on homepage (max 5 shown)
        </Label>
      </div>
      <div>
        <Label>Sort Order</Label>
        <Input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          data-testid="input-faq-sort-order"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-faq-cancel">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createFaq.isPending || updateFaq.isPending}
          data-testid="button-faq-save"
        >
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminFaqs() {
  const { data: faqsList, isLoading } = useFaqs();
  const deleteFaq = useDeleteFaq();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Faq | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFaq.mutateAsync(deleteTarget.id);
      toast({ title: "FAQ deleted" });
      setDeleteTarget(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6" />
          <h1 className="text-2xl font-bold font-heading">FAQs</h1>
        </div>
        <Button
          onClick={() => { setEditItem(undefined); setDialogOpen(true); }}
          data-testid="button-add-faq"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !faqsList?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          No FAQs yet. Click "Add FAQ" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {faqsList.map((faq) => (
            <div
              key={faq.id}
              className="border rounded-md p-4 flex flex-col sm:flex-row sm:items-start gap-3"
              data-testid={`faq-item-${faq.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm uppercase">{faq.question}</h3>
                  {faq.featured && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-md">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                <p className="text-xs text-muted-foreground mt-1">Sort: {faq.sortOrder}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => { setEditItem(faq); setDialogOpen(true); }}
                  data-testid={`button-edit-faq-${faq.id}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteTarget(faq)}
                  data-testid={`button-delete-faq-${faq.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <FaqDialog
            item={editItem}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.question}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteFaq.isPending} data-testid="button-confirm-delete">
              {deleteFaq.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
