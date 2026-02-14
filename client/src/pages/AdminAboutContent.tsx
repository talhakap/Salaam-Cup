import { AdminLayout } from "@/components/AdminLayout";
import { useAboutContent, useUpsertAboutContent } from "@/hooks/use-about-content";
import { useUpload } from "@/hooks/use-upload";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Upload, FileText, Type } from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";

const ReactQuill = lazy(() => import("react-quill-new"));

export default function AdminAboutContent() {
  const { data: aboutContent, isLoading } = useAboutContent();
  const upsertMutation = useUpsertAboutContent();
  const { uploadFile, isUploading } = useUpload({ folder: "about" });
  const { toast } = useToast();

  const [contentType, setContentType] = useState<"pdf" | "richtext">("richtext");
  const [pdfUrl, setPdfUrl] = useState("");
  const [richTextContent, setRichTextContent] = useState("");

  useEffect(() => {
    if (aboutContent) {
      setContentType(aboutContent.contentType as "pdf" | "richtext");
      setPdfUrl(aboutContent.pdfUrl || "");
      setRichTextContent(aboutContent.richTextContent || "");
    }
  }, [aboutContent]);

  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync({
        contentType,
        pdfUrl: contentType === "pdf" ? pdfUrl : null,
        richTextContent: contentType === "richtext" ? richTextContent : null,
      });
      toast({ title: "About content saved successfully" });
    } catch {
      toast({ title: "Error saving content", variant: "destructive" });
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Please select a PDF file", variant: "destructive" });
      return;
    }
    const result = await uploadFile(file);
    if (result) {
      setPdfUrl(result.objectPath);
      toast({ title: "PDF uploaded successfully" });
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "link", "image"],
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
          <h1 className="text-3xl font-bold font-display uppercase" data-testid="text-admin-about-title">
            About Page Content
          </h1>
          <Button
            onClick={handleSave}
            disabled={upsertMutation.isPending}
            className="hover:border-blue-600 bg-blue-600 text-white hover:bg-white hover:text-blue-600 gap-2"
            data-testid="button-save-about"
          >
            <Save className="h-4 w-4" />
            {upsertMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Manage the letter/content section on the About page. Choose between uploading a PDF or writing rich text content.
        </p>

        <div className="flex gap-3" data-testid="content-type-selector">
          <Button
            variant={contentType === "richtext" ? "default" : "outline"}
            onClick={() => setContentType("richtext")}
            className="hover:bg-stone-500 hover:text-white gap-2"
            data-testid="button-type-richtext"
          >
            <Type className="h-4 w-4" />
            Rich Text
          </Button>
          <Button
            variant={contentType === "pdf" ? "default" : "outline"}
            onClick={() => setContentType("pdf")}
            className="hover:bg-stone-500 hover:text-white gap-2"
            data-testid="button-type-pdf"
          >
            <FileText className="h-4 w-4" />
            PDF Upload
          </Button>
        </div>

        {contentType === "pdf" ? (
          <div className="space-y-4" data-testid="pdf-section">
            <div className="space-y-2">
              <label className="text-sm font-medium">PDF File</label>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    data-testid="input-pdf-file"
                  />
                  <Button variant="outline" className="hover:bg-stone-500 hover:text-white gap-2" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Uploading..." : "Upload PDF"}
                    </span>
                  </Button>
                </label>
                {pdfUrl && (
                  <span className="text-sm text-muted-foreground" data-testid="text-pdf-url">
                    PDF uploaded
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Or enter PDF URL directly</label>
              <input
                type="url"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://example.com/letter.pdf"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                data-testid="input-pdf-url"
              />
            </div>

            {pdfUrl && (
              <div className="border rounded-md overflow-hidden" data-testid="pdf-preview">
                <iframe
                  src={pdfUrl}
                  className="w-full min-h-[500px]"
                  title="PDF Preview"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2" data-testid="richtext-section">
            <label className="text-sm font-medium">Content</label>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <div className="rules-editor">
                <ReactQuill
                  theme="snow"
                  value={richTextContent}
                  onChange={setRichTextContent}
                  modules={quillModules}
                  className="bg-background min-h-[300px]"
                  data-testid="editor-about-richtext"
                />
              </div>
            </Suspense>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
