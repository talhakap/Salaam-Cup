import { AdminLayout } from "@/components/AdminLayout";
import { useTournaments, useCreateTournament, useUpdateTournament, useDeleteTournament, useDivisions, useCreateDivision, useUpdateDivision, useDeleteDivision, useReorderTournaments, useReorderDivisions } from "@/hooks/use-tournaments";
import { useTournamentSponsors, useCreateTournamentSponsor, useUpdateTournamentSponsor, useDeleteTournamentSponsor } from "@/hooks/use-tournament-sponsors";
import { useVenues } from "@/hooks/use-venues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Pencil, Trash2, ChevronDown, ChevronUp, Layers, Upload, ImageIcon, RotateCcw, ArrowUp, ArrowDown, GripVertical, Handshake, Images } from "lucide-react";
import { ImagePicker } from "@/components/ImagePicker";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTournamentSchema, insertDivisionSchema, STANDINGS_TYPES } from "@shared/schema";
import type { Tournament, Division, Venue, TournamentSponsor } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { useState, useRef } from "react";
import { format } from "date-fns";
import { z } from "zod";

function ImageUploadField({
  label,
  value,
  onChange,
  testIdPrefix,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  testIdPrefix: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { toast } = useToast();
  const { uploadFile, isUploading } = useUpload({
    folder: "tournaments",
    onSuccess: (response) => {
      onChange(response.objectPath);
      toast({ title: `${label} uploaded` });
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

  return (
    <div className="space-y-2">
      {value && (
        <div className="bg-muted rounded-md p-3 flex items-center justify-center">
          <img src={value} alt="Preview" className="max-h-20 object-contain" data-testid={`${testIdPrefix}-preview`} />
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
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          data-testid={`${testIdPrefix}-upload`}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          {isUploading ? "Uploading..." : `Upload ${label}`}
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setPickerOpen(true)} data-testid={`${testIdPrefix}-browse`}>
          <Images className="h-4 w-4" /> Browse Library
        </Button>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Or paste ${label.toLowerCase()} URL`}
        data-testid={`${testIdPrefix}-url`}
      />
      <ImagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => onChange(url)} currentImage={value} />
    </div>
  );
}

function DivisionManager({ tournamentId: rawTournamentId, venues }: { tournamentId: number | string; venues: Venue[] }) {
  const tournamentId = Number(rawTournamentId);
  const { data: divisions, isLoading } = useDivisions(tournamentId);
  const createDivision = useCreateDivision();
  const updateDivision = useUpdateDivision();
  const deleteDivision = useDeleteDivision();
  const reorderDivisions = useReorderDivisions();
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
      venueId: null as number | null,
      heroImage: "",
    },
  });

  const editForm = useForm({
    defaultValues: {
      name: "",
      category: "",
      description: "",
      gameFormat: "",
      registrationFee: 0,
      venueId: null as number | null,
      heroImage: "",
    },
  });

  const handleCreate = async (data: any) => {
    try {
      await createDivision.mutateAsync({ ...data, tournamentId });
      toast({ title: "Division created" });
      setCreateOpen(false);
      createForm.reset({ tournamentId, name: "", category: "", description: "", gameFormat: "", registrationFee: 0, venueId: null, heroImage: "" });
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

  const moveDivision = (index: number, direction: "up" | "down") => {
    if (!divisions) return;
    const ids = divisions.map((d) => d.id);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    reorderDivisions.mutate({ tournamentId, orderedIds: ids });
  };

  const openEdit = (div: Division) => {
    setEditDiv(div);
    editForm.reset({
      name: div.name,
      category: div.category || "",
      description: div.description || "",
      gameFormat: div.gameFormat || "",
      registrationFee: div.registrationFee || 0,
      venueId: div.venueId || null,
      heroImage: div.heroImage || "",
    });
  };

  if (isLoading) return <div className="py-4 text-center text-sm text-muted-foreground">Loading divisions...</div>;

  return (
    <div className="mt-2 border-t pt-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-1"><Layers className="h-4 w-4" /> Divisions</h4>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-green-600 gap-1" data-testid={`button-add-division-${tournamentId}`}>
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
                <FormField control={createForm.control} name="venueId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <Select value={field.value ? String(field.value) : "none"} onValueChange={v => field.onChange(v === "none" ? null : Number(v))}>
                      <FormControl>
                        <SelectTrigger data-testid="select-division-venue"><SelectValue placeholder="Select venue" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-- None --</SelectItem>
                        {venues.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="heroImage" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Hero Image</FormLabel>
                    <FormControl>
                      <ImageUploadField
                        label="Hero Image"
                        value={field.value || ''}
                        onChange={field.onChange}
                        testIdPrefix="division-hero"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
          {divisions.map((div, index) => (
            <div key={div.id} className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-md" data-testid={`row-division-${div.id}`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex flex-col flex-shrink-0">
                  <Button size="icon" variant="ghost" className="hover:bg-gray-500 hover:text-white h-5 w-5" disabled={index === 0} onClick={() => moveDivision(index, "up")} data-testid={`button-move-division-up-${div.id}`}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-gray-500 hover:text-white h-5 w-5" disabled={index === divisions.length - 1} onClick={() => moveDivision(index, "down")} data-testid={`button-move-division-down-${div.id}`}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-sm">{div.name}</span>
                  {div.category && <Badge variant="secondary" className="ml-2 text-xs">{div.category}</Badge>}
                  {div.gameFormat && <span className="text-xs text-muted-foreground ml-2">{div.gameFormat}</span>}
                  {div.registrationFee ? <span className="text-xs text-muted-foreground ml-2">${div.registrationFee}</span> : null}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button className="bg-amber-400 text-white hover:bg-white hover:text-amber-400 hover:border-amber-400" size="icon" variant="ghost" onClick={() => openEdit(div)} data-testid={`button-edit-division-${div.id}`}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button className="bg-red-700 text-white hover:bg-white hover:text-red-700 hover:border-red-700
" size="icon" variant="ghost" onClick={() => setDeleteDiv(div)} data-testid={`button-delete-division-${div.id}`}>
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
            <div>
              <label className="text-sm font-medium">Venue</label>
              <Select
                value={editForm.watch("venueId") ? String(editForm.watch("venueId")) : "none"}
                onValueChange={v => editForm.setValue("venueId", v === "none" ? null : Number(v))}
              >
                <SelectTrigger data-testid="select-edit-division-venue"><SelectValue placeholder="Select venue" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- None --</SelectItem>
                  {venues.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Hero Image</label>
              <ImageUploadField
                label="Hero Image"
                value={editForm.watch("heroImage") || ''}
                onChange={(url: string) => editForm.setValue("heroImage", url)}
                testIdPrefix="edit-division-hero"
              />
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

function TournamentSponsorManager({ tournamentId: rawTournamentId }: { tournamentId: number | string }) {
  const tournamentId = Number(rawTournamentId);
  const { data: tSponsors, isLoading } = useTournamentSponsors(tournamentId);
  const createSponsor = useCreateTournamentSponsor();
  const updateSponsor = useUpdateTournamentSponsor();
  const deleteSponsor = useDeleteTournamentSponsor();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<TournamentSponsor | null>(null);
  const [deleteItem, setDeleteItem] = useState<TournamentSponsor | null>(null);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const resetForm = () => {
    setName("");
    setLogoUrl("");
    setWebsiteUrl("");
    setSortOrder(0);
  };

  const handleCreate = async () => {
    if (!name || !logoUrl) {
      toast({ title: "Name and logo are required", variant: "destructive" });
      return;
    }
    try {
      await createSponsor.mutateAsync({ tournamentId, name, logoUrl, websiteUrl: websiteUrl || null, sortOrder });
      toast({ title: "Sponsor added" });
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const openEdit = (item: TournamentSponsor) => {
    setEditItem(item);
    setName(item.name);
    setLogoUrl(item.logoUrl);
    setWebsiteUrl(item.websiteUrl || "");
    setSortOrder(item.sortOrder || 0);
  };

  const handleEdit = async () => {
    if (!editItem || !name || !logoUrl) return;
    try {
      await updateSponsor.mutateAsync({ id: editItem.id, tournamentId, name, logoUrl, websiteUrl: websiteUrl || null, sortOrder });
      toast({ title: "Sponsor updated" });
      setEditItem(null);
      resetForm();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteSponsor.mutateAsync({ id: deleteItem.id, tournamentId });
      toast({ title: "Sponsor deleted" });
      setDeleteItem(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="py-4 text-center text-sm text-muted-foreground">Loading sponsors...</div>;

  return (
    <div className="mt-2 border-t pt-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-1"><Handshake className="h-4 w-4" /> Tournament Sponsors</h4>
        <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-green-600 gap-1" data-testid={`button-add-tsponsor-${tournamentId}`}>
              <Plus className="h-3 w-3" /> Add Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tournament Sponsor</DialogTitle>
              <DialogDescription>Add a sponsor banner for this tournament.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="input-tsponsor-name" />
              </div>
              <div>
                <label className="text-sm font-medium">Logo *</label>
                <ImageUploadField label="Logo" value={logoUrl} onChange={setLogoUrl} testIdPrefix="tsponsor-logo" />
              </div>
              <div>
                <label className="text-sm font-medium">Website URL</label>
                <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." data-testid="input-tsponsor-website" />
              </div>
              <div>
                <label className="text-sm font-medium">Sort Order</label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createSponsor.isPending} data-testid="button-create-tsponsor-submit">
                {createSponsor.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Add Sponsor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!tSponsors || tSponsors.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No tournament sponsors yet</p>
      ) : (
        <div className="space-y-2">
          {tSponsors.map((sp) => (
            <div key={sp.id} className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-md" data-testid={`row-tsponsor-${sp.id}`}>
              <div className="flex items-center gap-3 min-w-0">
                {sp.logoUrl && <img src={sp.logoUrl} alt={sp.name} className="h-8 w-auto object-contain max-w-[80px]" />}
                <div className="min-w-0">
                  <span className="font-medium text-sm">{sp.name}</span>
                  {sp.websiteUrl && <span className="text-xs text-muted-foreground ml-2 truncate">{sp.websiteUrl}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button className="bg-amber-400 text-white hover:bg-white hover:text-amber-400 hover:border-amber-400" size="icon" variant="ghost" onClick={() => openEdit(sp)} data-testid={`button-edit-tsponsor-${sp.id}`}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button className="bg-red-700 text-white hover:bg-white hover:text-red-700 hover:border-red-700" size="icon" variant="ghost" onClick={() => setDeleteItem(sp)} data-testid={`button-delete-tsponsor-${sp.id}`}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) { setEditItem(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tournament Sponsor</DialogTitle>
            <DialogDescription>Update sponsor details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="input-edit-tsponsor-name" />
            </div>
            <div>
              <label className="text-sm font-medium">Logo *</label>
              <ImageUploadField label="Logo" value={logoUrl} onChange={setLogoUrl} testIdPrefix="edit-tsponsor-logo" />
            </div>
            <div>
              <label className="text-sm font-medium">Website URL</label>
              <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium">Sort Order</label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEdit} disabled={updateSponsor.isPending} data-testid="button-update-tsponsor-submit">
              {updateSponsor.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sponsor</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{deleteItem?.name}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteSponsor.isPending} data-testid="button-confirm-delete-tsponsor">
              {deleteSponsor.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminTournaments() {
  const { data: tournaments, isLoading } = useTournaments();
  const { data: venues } = useVenues();
  const createTournament = useCreateTournament();
  const updateTournament = useUpdateTournament();
  const deleteTournament = useDeleteTournament();
  const reorderTournaments = useReorderTournaments();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTournament, setEditTournament] = useState<Tournament | null>(null);
  const [deleteTournamentState, setDeleteTournamentState] = useState<Tournament | null>(null);
  const [resetTournamentState, setResetTournamentState] = useState<Tournament | null>(null);
  const [resetting, setResetting] = useState(false);
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
      heroImage: "",
      logoUrl: "",
      isFeatured: false,
      venueId: null as number | null,
      showInfoBanner: false,
      showNewsBanner: false,
      showSponsorBanner: false,
      allowMultipleRegistrations: false,
      standingsType: "hockey_standard" as string,
      rostersVisible: false,
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
      heroImage: "",
      logoUrl: "",
      isFeatured: false,
      venueId: null as number | null,
      showInfoBanner: false,
      showNewsBanner: false,
      showSponsorBanner: false,
      allowMultipleRegistrations: false,
      standingsType: "hockey_standard" as string,
      rostersVisible: false,
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
      heroImage: t.heroImage || "",
      logoUrl: t.logoUrl || "",
      isFeatured: t.isFeatured || false,
      venueId: t.venueId || null,
      showInfoBanner: t.showInfoBanner || false,
      showNewsBanner: t.showNewsBanner || false,
      showSponsorBanner: t.showSponsorBanner || false,
      allowMultipleRegistrations: t.allowMultipleRegistrations || false,
      standingsType: t.standingsType || "hockey_standard",
      rostersVisible: t.rostersVisible || false,
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

  const handleReset = async () => {
    if (!resetTournamentState) return;
    setResetting(true);
    try {
      const res = await fetch(`/api/tournaments/${resetTournamentState.id}/reset`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message);
      toast({ title: "Tournament Reset", description: "All teams, players, matches, and standings have been removed." });
      setResetTournamentState(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setResetting(false);
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

  const moveTournament = (index: number, direction: "up" | "down") => {
    if (!tournaments) return;
    const ids = tournaments.map((t) => t.id);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    reorderTournaments.mutate(ids);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "default" as const;
      case "upcoming": return "secondary" as const;
      case "completed": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  const TournamentFormFields = ({ form, prefix = "" }: { form: any; prefix?: string; }) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField control={form.control} name="name" render={({ field }: any) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} data-testid={`${prefix}input-tournament-name`} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }: any) => (
          <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} data-testid={`${prefix}input-tournament-slug`} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField control={form.control} name="year" render={({ field }: any) => (
          <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} onChange={(e: any) => field.onChange(parseInt(e.target.value))} data-testid={`${prefix}input-tournament-year`} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="startDate" render={({ field }: any) => (
          <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} data-testid={`${prefix}input-tournament-start-date`} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="endDate" render={({ field }: any) => (
          <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} data-testid={`${prefix}input-tournament-end-date`} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <FormField control={form.control} name="showInfoBanner" render={({ field }: any) => (
          <FormItem className="flex items-end gap-2 pb-2">
            <FormControl>
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" data-testid={`${prefix}checkbox-show-info-banner`} />
            </FormControl>
            <FormLabel className="!mt-0">Show Info Banner</FormLabel>
          </FormItem>
        )} />
        <FormField control={form.control} name="showNewsBanner" render={({ field }: any) => (
          <FormItem className="flex items-end gap-2 pb-2">
            <FormControl>
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" data-testid={`${prefix}checkbox-show-news-banner`} />
            </FormControl>
            <FormLabel className="!mt-0">Show News Banner</FormLabel>
          </FormItem>
        )} />
        <FormField control={form.control} name="showSponsorBanner" render={({ field }: any) => (
          <FormItem className="flex items-end gap-2 pb-2">
            <FormControl>
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" data-testid={`${prefix}checkbox-show-sponsor-banner`} />
            </FormControl>
            <FormLabel className="!mt-0">Show Sponsor Banner</FormLabel>
          </FormItem>
        )} />
        <FormField control={form.control} name="allowMultipleRegistrations" render={({ field }: any) => (
          <FormItem className="flex items-end gap-2 pb-2">
            <FormControl>
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" data-testid={`${prefix}checkbox-allow-multiple-reg`} />
            </FormControl>
            <FormLabel className="!mt-0">Allow Multiple Registrations Per Email</FormLabel>
          </FormItem>
        )} />
        <FormField control={form.control} name="rostersVisible" render={({ field }: any) => (
          <FormItem className="flex items-end gap-2 pb-2">
            <FormControl>
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" data-testid={`${prefix}checkbox-rosters-visible`} />
            </FormControl>
            <FormLabel className="!mt-0">Show Rosters Publicly</FormLabel>
          </FormItem>
        )} />
      </div>
      <FormField control={form.control} name="description" render={({ field }: any) => (
        <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="venueId" render={({ field }: any) => (
        <FormItem>
          <FormLabel>Venue</FormLabel>
          <Select value={field.value ? String(field.value) : "none"} onValueChange={(v: string) => field.onChange(v === "none" ? null : Number(v))}>
            <FormControl>
              <SelectTrigger data-testid={`${prefix}select-tournament-venue`}><SelectValue placeholder="Select venue" /></SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">-- None --</SelectItem>
              {(venues || []).map((v: Venue) => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="standingsType" render={({ field }: any) => (
        <FormItem>
          <FormLabel>Standings Calculation Type</FormLabel>
          <Select value={field.value || "hockey_standard"} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger data-testid={`${prefix}select-standings-type`}><SelectValue placeholder="Select standings type" /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(STANDINGS_TYPES).map(([key, { label, description }]) => (
                <SelectItem key={key} value={key}>{label} — {description}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField control={form.control} name="heroImage" render={({ field }: any) => (
          <FormItem>
            <FormLabel>Hero Image</FormLabel>
            <FormControl>
              <ImageUploadField
                label="Hero Image"
                value={field.value || ''}
                onChange={field.onChange}
                testIdPrefix={`${prefix}tournament-hero`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="logoUrl" render={({ field }: any) => (
          <FormItem>
            <FormLabel>Logo</FormLabel>
            <FormControl>
              <ImageUploadField
                label="Logo"
                value={field.value || ''}
                onChange={field.onChange}
                testIdPrefix={`${prefix}tournament-logo`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </>
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-8">
        <h1 className="text-3xl font-bold font-display" data-testid="text-admin-tournaments-title">Manage Tournaments</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-green-600 gap-2" data-testid="button-create-tournament"><Plus className="h-4 w-4" /> Create Tournament</Button>
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
          {tournaments.map((t, index) => (
            <div key={t.id} className="bg-card rounded-lg shadow border" data-testid={`card-tournament-${t.id}`}>
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col flex-shrink-0">
                    <Button size="icon" variant="ghost" className="hover:bg-gray-500 hover:text-white h-6 w-6" disabled={index === 0} onClick={() => moveTournament(index, "up")} data-testid={`button-move-tournament-up-${t.id}`}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="hover:bg-gray-500 hover:text-white h-6 w-6" disabled={index === tournaments.length - 1} onClick={() => moveTournament(index, "down")} data-testid={`button-move-tournament-down-${t.id}`}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="font-bold text-lg truncate">{t.name}</h3>
                      <Badge variant={statusColor(t.status)}>{t.status}</Badge>
                      {t.isFeatured && <Badge variant="outline">Featured</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.year} &middot; {format(new Date(t.startDate), 'MMM d')} - {format(new Date(t.endDate), 'MMM d, yyyy')}
                      {t.description && <span className="hidden sm:inline ml-2">&middot; {t.description.slice(0, 60)}{t.description.length > 60 ? '...' : ''}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <div className="flex items-center gap-2 ">
                    <Switch
                      checked={!!t.registrationOpen}
                      onCheckedChange={async (checked) => {
                        try {
                          await updateTournament.mutateAsync({ id: t.id, registrationOpen: checked });
                          toast({ title: checked ? "Registration opened" : "Registration closed" });
                        } catch (err) {
                          toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
                        }
                      }}
                      data-testid={`switch-registration-${t.id}`}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {t.registrationOpen ? "Reg. Open" : "Reg. Closed"}
                    </span>
                  </div>
                  <Button className="hover:bg-gray-500 hover:text-white" size="icon" variant="ghost" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} data-testid={`button-expand-tournament-${t.id}`}>
                    {expandedId === t.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button className="bg-card rounded-md shadow bg-amber-400 text-white hover:bg-white hover:text-amber-400 hover:border-amber-400" size="icon" variant="ghost" onClick={() => openEdit(t)} data-testid={`button-edit-tournament-${t.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button className="bg-card rounded-md shadow bg-orange-600 text-white hover:bg-white hover:text-orange-600 hover:border-orange-600" size="icon" variant="ghost" onClick={() => setResetTournamentState(t)} data-testid={`button-reset-tournament-${t.id}`} title="Reset tournament">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button className="bg-card rounded-md shadow bg-red-700 text-white hover:bg-white hover:text-red-700 hover:border-red-700" size="icon" variant="ghost" onClick={() => setDeleteTournamentState(t)} data-testid={`button-delete-tournament-${t.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {expandedId === t.id && (
                <div className="px-4 pb-4">
                  <DivisionManager tournamentId={t.id} venues={venues || []} />
                  <TournamentSponsorManager tournamentId={t.id} />
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

      <Dialog open={!!resetTournamentState} onOpenChange={(o) => !o && setResetTournamentState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Tournament</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset "{resetTournamentState?.name}"? This will remove all teams, players, matches, and standings. Divisions and awards will be kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTournamentState(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset} disabled={resetting} data-testid="button-confirm-reset-tournament">
              {resetting && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Reset
            </Button>
          </DialogFooter>
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
