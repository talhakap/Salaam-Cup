import { AdminLayout } from "@/components/AdminLayout";
import { useTournaments, useCreateTournament } from "@/hooks/use-tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTournamentSchema } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminTournaments() {
  const { data: tournaments, isLoading } = useTournaments();
  const createTournament = useCreateTournament();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
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
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await createTournament.mutateAsync(data);
      toast({ title: "Tournament Created" });
      setOpen(false);
      form.reset();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-display">Manage Tournaments</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Tournament</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Tournament</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({field}) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({field}) => (
                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="year" render={({field}) => (
                    <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage/></FormItem>
                  )} />
                  <FormField control={form.control} name="startDate" render={({field}) => (
                    <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                  <FormField control={form.control} name="endDate" render={({field}) => (
                    <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="description" render={({field}) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value || ''}/></FormControl><FormMessage/></FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={createTournament.isPending}>
                    {createTournament.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Create
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : (
              tournaments?.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.year}</TableCell>
                  <TableCell>{format(new Date(t.startDate), 'MMM d')} - {format(new Date(t.endDate), 'MMM d')}</TableCell>
                  <TableCell className="uppercase text-xs font-bold text-muted-foreground">{t.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
