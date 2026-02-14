import { AdminLayout } from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const ReactQuill = lazy(() => import("react-quill-new"));

export default function AdminWaiverContent() {
  const { data: waiverContent, isLoading } = useQuery<{ id: number; content: string; updatedAt: string } | null>({
    queryKey: ["/api/waiver-content"],
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await apiRequest("POST", "/api/waiver-content", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waiver-content"] });
    },
  });

  const { toast } = useToast();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (waiverContent) {
      setContent(waiverContent.content || "");
    }
  }, [waiverContent]);

  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync({ content });
      toast({ title: "Waiver content saved successfully" });
    } catch {
      toast({ title: "Error saving waiver content", variant: "destructive" });
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "link"],
      ["clean"],
    ],
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold font-display uppercase" data-testid="text-admin-waiver-title">
            Waiver Content
          </h1>
          <Button
            onClick={handleSave}
            disabled={upsertMutation.isPending}
            className="hover:border-blue-600 bg-blue-600 text-white hover:bg-white hover:text-blue-600 gap-2"
            data-testid="button-save-waiver"
          >
            <Save className="h-4 w-4" />
            {upsertMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Edit the waiver agreement that users must read and accept before registering. Changes will appear immediately on all registration forms.
        </p>

        <div className="space-y-2" data-testid="waiver-editor-section">
          <label className="text-sm font-medium">Waiver Agreement Text</label>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <div className="rules-editor">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                className="bg-background min-h-[400px]"
                data-testid="editor-waiver-content"
              />
            </div>
          </Suspense>
        </div>
      </div>
    </AdminLayout>
  );
}
