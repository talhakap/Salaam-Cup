import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { ReadyToCompete } from "@/components/ReadyToCompete";
import { FAQSection } from "@/components/FAQSection";
import { TournamentNav } from "@/components/TournamentNav";
import { useTournament, useDivisions, useUpdateDivision } from "@/hooks/use-tournaments";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X } from "lucide-react";
import { useState, lazy, Suspense, useMemo } from "react";
import DOMPurify from "dompurify";
import type { Division } from "@shared/schema";

const ReactQuill = lazy(() => import("react-quill-new"));

export default function TournamentRules() {
  const [, params] = useRoute("/tournaments/:id/rules");
  const tournamentId = Number(params?.id);

  const { data: tournament, isLoading } = useTournament(tournamentId);
  const { data: divisions } = useDivisions(tournamentId);
  const { isAuthenticated } = useAuth();
  const updateDivision = useUpdateDivision();
  const { toast } = useToast();

  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [editingDivisionId, setEditingDivisionId] = useState<number | null>(null);
  const [editorContent, setEditorContent] = useState("");

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-[45vh] bg-muted animate-pulse" />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!tournament) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold font-display mb-4">Tournament Not Found</h1>
          <Link href="/tournaments">
            <Button data-testid="link-back-tournaments">Back to Tournaments</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const divisionTabs = divisions?.map((d: Division) => ({ id: String(d.id), label: d.name })) || [];
  const selectedDiv = divisions?.find((d: Division) => String(d.id) === selectedDivision);
  const displayName = selectedDiv ? `${selectedDiv.category || ""} ${selectedDiv.name} Rules`.trim() : "Divisions & Rules";

  const startEditing = (div: Division) => {
    setEditingDivisionId(div.id);
    setEditorContent(div.rulesContent || "");
  };

  const cancelEditing = () => {
    setEditingDivisionId(null);
    setEditorContent("");
  };

  const saveRules = async () => {
    if (editingDivisionId === null) return;
    try {
      await updateDivision.mutateAsync({
        id: editingDivisionId,
        rulesContent: editorContent,
      });
      toast({ title: "Rules saved successfully" });
      setEditingDivisionId(null);
    } catch {
      toast({ title: "Error saving rules", variant: "destructive" });
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote"],
      ["clean"],
    ],
  };

  const renderDivisionRules = (div: Division) => {
    const isEditing = editingDivisionId === div.id;

    return (
      <div key={div.id}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-4xl font-bold font-display uppercase" data-testid={`text-rules-title-${div.id}`}>
            {div.category || ""} {div.name} Rules
          </h2>
          {isAuthenticated && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing(div)}
              className="gap-2 shrink-0"
              data-testid={`button-edit-rules-${div.id}`}
            >
              <Pencil className="h-4 w-4" /> Edit Rules
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2 shrink-0">
              <Button
                variant="default"
                size="sm"
                onClick={saveRules}
                disabled={updateDivision.isPending}
                className="gap-2"
                data-testid={`button-save-rules-${div.id}`}
              >
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEditing}
                data-testid={`button-cancel-rules-${div.id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <div className="rules-editor" data-testid={`editor-rules-${div.id}`}>
              <ReactQuill
                theme="snow"
                value={editorContent}
                onChange={setEditorContent}
                modules={quillModules}
                className="bg-background"
              />
            </div>
          </Suspense>
        ) : (
          <div className="space-y-6">
            {div.rulesContent ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(div.rulesContent) }}
                data-testid={`content-rules-${div.id}`}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8" data-testid={`empty-rules-${div.id}`}>
                <p>No rules have been added for this division yet.</p>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => startEditing(div)}
                    data-testid={`button-add-rules-${div.id}`}
                  >
                    <Pencil className="h-4 w-4" /> Add Rules
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const divisionsToShow = selectedDivision === "all"
    ? divisions || []
    : divisions?.filter((d: Division) => String(d.id) === selectedDivision) || [];

  return (
    <MainLayout>
      <SEO 
        title={tournament ? `${tournament.name} Rules` : "Tournament Rules"}
        description={`Official rules for ${tournament?.name || "Salaam Cup tournament"}. Game regulations, eligibility requirements, and competition guidelines.`}
        canonical={`/tournaments/${params?.id}/rules`}
        keywords={`${tournament?.name || ""} rules, tournament regulations, sports rules GTA`}
      />
      <HeroSection title="Divisions & Rules" image={tournament.heroImage || undefined} size="small" />
      <SponsorBar />
      <TournamentNav tournamentId={tournamentId} />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          {divisionTabs.length > 0 && (
            <div className="flex justify-center mb-10">
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant={selectedDivision === "all" ? "default" : "outline"}
                  className="rounded-full text-xs font-bold uppercase tracking-wider"
                  onClick={() => setSelectedDivision("all")}
                  data-testid="filter-rules-all"
                >
                  All
                </Button>
                {divisionTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={selectedDivision === tab.id ? "default" : "outline"}
                    className="rounded-full text-xs font-bold uppercase tracking-wider"
                    onClick={() => setSelectedDivision(tab.id)}
                    data-testid={`filter-rules-division-${tab.id}`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {divisionsToShow.length > 0 ? (
            <div className="space-y-16">
              {divisionsToShow.map((div: Division) => renderDivisionRules(div))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Select a division above to view its rules and details.</p>
            </div>
          )}
        </div>
      </section>

      <ReadyToCompete />
      <FAQSection />
    </MainLayout>
  );
}
