import { AdminLayout } from "@/components/AdminLayout";
import { useTournaments, useCreateTournament, useUpdateTournament, useDeleteTournament, useDivisions, useCreateDivision, useUpdateDivision, useDeleteDivision } from "@/hooks/use-tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Pencil, Trash2, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTournamentSchema, insertDivisionSchema } from "@shared/schema";
import type { Tournament, Division } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { z } from "zod";

function DivisionManager({ tournamentId }: { tournamentId: number }) {
  const { data: divisions, isLoading } = useDivisions(tournamentId);
  const createDivision = useCreateDivision();
  const updateDivision = useUpdateDivision();
  const deleteDivision = useDeleteDivision();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editDiv, setEditDiv] = useState<Division | null>(null);
  const [deleteDiv, setDeleteDiv] = useState<Division | null>(null);

  const createForm = useForm({
    resolver: zodResolver(insertDivisionSchema),
    defaultValues: {
      tournamentId,
      name: "",
      category: "",
      description: "",
      gameFormat: "",
      registrationFee: 0,
    },
  });

  const editForm = useForm({
    defaultValues: {
      name: "",
      category: "",
      description: "",
      gameFormat: "",
      registrationFee: 0,
    },
  });

  const handleCreate = async (data: any) => {
    try {
      await createDivision.mutateAsync({ ...data, tournamentId });
      toast({ title: "Division created" });
      setCreateOpen(false);
      createForm.reset({ tournamentId, name: "", category: "", description: "", gameFormat: "", registrationFee: 0 });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleEdit = async (data: any) => {
    if (!editDiv) return;
    try {
      await updateDivision.mutateAsync({ id: editDiv.id, ...data });
      toast({ title: "Division updated" });
      setEditDiv(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteDiv) return;
    try {
      await deleteDivision.mutateAsync({ id: deleteDiv.id, tournamentId });
      toast({ title: "Division deleted" });
      setDeleteDiv(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const openEdit = (div: Division) => {
    setEditDiv(div);
    editForm.reset({
      name: div.name,
      category: div.category || "",
      description: div.description || "",
      gameFormat: div.gameFormat || "",
      registrationFee: div.registrationFee || 0,
    });
  };

  if (isLoading) return <div className="py-4 text-center text-sm text-muted-foreground">Loading divisions...</div>;

  return (
    <div className="mt-2 border-t pt-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-1"><Layers className="h-4 w-4" /> Divisions</h4>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1" data-testid={`button-add-division-${tournamentId}`}>
              <Plus className="h-3 w-3" /> Add Division
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Division</DialogTitle>
              <DialogDescription>Create a new division for this tournament.</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                <FormField control={createForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} data-testid="input-division-name" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={createForm.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="e.g. Men, Women, Youth" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={createForm.control} name="gameFormat" render={({ field }) => (
                    <FormItem><FormLabel>Game Format</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="e.g. 5v5, 3v3" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={createForm.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="registrationFee" render={({ field }) => (
                  <FormItem><FormLabel>Registration Fee ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={createDivision.isPending} data-testid="button-create-division-submit">
                    {createDivision.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Create
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!divisions || divisions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No divisions yet</p>
      ) : (
        <div className="space-y-2">
          {divisions.map((div) => (
            <div key={div.id} className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-md" data-testid={`row-division-${div.id}`}>
              <div className="min-w-0">
                <span className="font-medium text-sm">{div.name}</span>
                {div.category && <Badge variant="secondary" className="ml-2 text-xs">{div.category}</Badge>}
                {div.gameFormat && <span className="text-xs text-muted-foreground ml-2">{div.gameFormat}</span>}
                {div.registrationFee ? <span className="text-xs text-muted-foreground ml-2">${div.registrationFee}</span> : null}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(div)} data-testid={`button-edit-division-${div.id}`}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteDiv(div)} data-testid={`button-delete-division-${div.id}`}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editDiv} onOpenChange={(o) => !o && setEditDiv(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Division</DialogTitle>
            <DialogDescription>Update division details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input {...editForm.register("name")} data-testid="input-edit-division-name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input {...editForm.register("category")} />
              </div>
              <div>
                <label className="text-sm font-medium">Game Format</label>
                <Input {...editForm.register("gameFormat")} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input {...editForm.register("description")} />
            </div>
            <div>
              <label className="text-sm font-medium">Registration Fee ($)</label>
              <Input type="number" {...editForm.register("registrationFee", { valueAsNumber: true })} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateDivision.isPending} data-testid="button-update-division-submit">
                {updateDivision.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDiv} onOpenChange={(o) => !o && setDeleteDiv(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Division</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDiv?.name}"? This will also remove all teams, matches, and standings in this division.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDiv(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteDivision.isPending} data-testid="button-confirm-delete-division">
              {deleteDivision.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminTournaments() {
  const { data: tournaments, isLoading } = useTournaments();
  const createTournament = useCreateTournament();
  const updateTournament = useUpdateTournament();
  const deleteTournament = useDeleteTournament();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTournament, setEditTournament] = useState<Tournament | null>(null);
  const [deleteTournamentState, setDeleteTournamentState] = useState<Tournament | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { toast } = useToast();

  const createForm = useForm({
    resolver: zodResolver(insertTournamentSchema),
    defaultValues: {
      name: "",
      slug: "",
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
      status: "upcoming" as const,
      description: "",
      isFeatured: false,
    },
  });

  const editForm = useForm({
    defaultValues: {
      name: "",
      slug: "",
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
      status: "upcoming" as const,
      description: "",
      isFeatured: false,
    },
  });

  const onCreateSubmit = async (data: any) => {
    try {
      await createTournament.mutateAsync(data);
      toast({ title: "Tournament Created" });
      setCreateOpen(false);
      createForm.reset();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const openEdit = (t: Tournament) => {
    setEditTournament(t);
    editForm.reset({
      name: t.name,
      slug: t.slug,
      year: t.year,
      startDate: t.startDate,
      endDate: t.endDate,
      status: t.status as any,
      description: t.description || "",
      isFeatured: t.isFeatured || false,
    });
  };

  const onEditSubmit = async (data: any) => {
    if (!editTournament) return;
    try {
      await updateTournament.mutateAsync({ id: editTournament.id, ...data });
      toast({ title: "Tournament Updated" });
      setEditTournament(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTournamentState) return;
    try {
      await deleteTournament.mutateAsync(deleteTournamentState.id);
      toast({ title: "Tournament Deleted" });
      setDeleteTournamentState(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "default" as const;
      case "upcoming": return "secondary" as const;
      case "completed": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  const TournamentFormFields = ({ form, prefix = "" }: { form: any; prefix?: string }) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="name" render={({ field }: any) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} data-testid={`${prefix}input-tournament-name`} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }: any) => (
          <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} data-testid={`${prefix}input-tournament-slug`} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <FormField control={form.control} name="year" render={({ field }: any) => (
          <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} onChange={(e: any) => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="startDate" render={({ field }: any) => (
          <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="endDate" render={({ field }: any) => (
          <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="status" render={({ field }: any) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="isFeatured" render={({ field }: any) => (
          <FormItem className="flex items-end gap-2 pb-2">
            <FormControl>
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" />
            </FormControl>
            <FormLabel className="!mt-0">Featured</FormLabel>
          </FormItem>
        )} />
      </div>
      <FormField control={form.control} name="description" render={({ field }: any) => (
        <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
      )} />
    </>
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-8">
        <h1 className="text-2xl font-bold font-display" data-testid="text-admin-tournaments-title">Manage Tournaments</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-tournament"><Plus className="h-4 w-4" /> Create Tournament</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Tournament</DialogTitle>
              <DialogDescription>Create a new tournament event.</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <TournamentFormFields form={createForm} prefix="create-" />
                <DialogFooter>
                  <Button type="submit" disabled={createTournament.isPending} data-testid="button-create-tournament-submit">
                    {createTournament.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Create
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : !tournaments || tournaments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No tournaments yet</p>
          <p className="text-sm mt-1">Create your first tournament to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <div key={t.id} className="bg-card rounded-lg shadow border" data-testid={`card-tournament-${t.id}`}>
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h3 className="font-bold text-lg truncate">{t.name}</h3>
                    <Badge variant={statusColor(t.status)}>{t.status}</Badge>
                    {t.isFeatured && <Badge variant="outline">Featured</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t.year} &middot; {format(new Date(t.startDate), 'MMM d')} - {format(new Date(t.endDate), 'MMM d, yyyy')}
                    {t.description && <span className="ml-2">&middot; {t.description.slice(0, 60)}{t.description.length > 60 ? '...' : ''}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} data-testid={`button-expand-tournament-${t.id}`}>
                    {expandedId === t.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(t)} data-testid={`button-edit-tournament-${t.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteTournamentState(t)} data-testid={`button-delete-tournament-${t.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {expandedId === t.id && (
                <div className="px-4 pb-4">
                  <DivisionManager tournamentId={t.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editTournament} onOpenChange={(o) => !o && setEditTournament(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
            <DialogDescription>Update tournament details.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <TournamentFormFields form={editForm} prefix="edit-" />
              <DialogFooter>
                <Button type="submit" disabled={updateTournament.isPending} data-testid="button-update-tournament-submit">
                  {updateTournament.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTournamentState} onOpenChange={(o) => !o && setDeleteTournamentState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tournament</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTournamentState?.name}"? This will permanently remove all divisions, teams, matches, and standings associated with this tournament.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTournamentState(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTournament.isPending} data-testid="button-confirm-delete-tournament">
              {deleteTournament.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
