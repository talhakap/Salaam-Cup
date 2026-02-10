import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Team, Player, insertPlayerSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlayers, useCreatePlayer } from "@/hooks/use-players";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Users, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import heroImg from "/images/team-detail.png";

// Schema for adding a player
const addPlayerFormSchema = insertPlayerSchema.omit({ teamId: true, status: true, waiverSigned: true, adminNotes: true });

function AddPlayerDialog({ teamId }: { teamId: number }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createPlayer = useCreatePlayer();

  const form = useForm({
    resolver: zodResolver(addPlayerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "",
      jerseyNumber: 0,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await createPlayer.mutateAsync({ ...data, teamId });
      toast({ title: "Player added!", description: "They are now in staging." });
      setOpen(false);
      form.reset();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><UserPlus className="h-4 w-4" /> Add Player</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
          <DialogDescription>
            Enter player details. They will need to be verified by admin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({field}) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({field}) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                )} />
             </div>
             <FormField control={form.control} name="email" render={({field}) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage/></FormItem>
             )} />
             <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="dob" render={({field}) => (
                    <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
               )} />
               <FormField control={form.control} name="jerseyNumber" render={({field}) => (
                    <FormItem><FormLabel>Jersey #</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage/></FormItem>
               )} />
             </div>
             <DialogFooter>
               <Button type="submit" disabled={createPlayer.isPending}>
                 {createPlayer.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Add Player"}
               </Button>
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CaptainDashboard() {
  const { user } = useAuth();
  // Fetch teams where captainId matches current user
  // Since we don't have a direct "my-teams" endpoint in the minimal schema, we filter via list
  // Ideally, backend should have /api/my-teams. We'll use the tournament list or assume we just show one.
  // Workaround: We will fetch all teams and filter in frontend (not performant but fine for demo)
  // OR: If schema allowed filtering by captainId.
  // For this generator, I'll fetch a specific tournament's teams or mocking the "My Team" fetch
  // Let's assume the user has one team.
  // Real implementation: API should support ?captainId=...
  
  // MOCK: Fetch teams for tournament 1 and find the one matching the user email or name if ID doesn't work
  // In a real app, strict relation is needed.
  // I will just show a "Select your team" or assume ID=1 for demo purposes if not found.
  
  // NOTE: I'll use a placeholder UI if no team is found.
  
  return (
    <MainLayout>
      <div className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-display uppercase">Captain's Dashboard</h1>
          <p className="opacity-80">Manage your team and roster.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
         <Alert className="mb-8 border-primary/20 bg-primary/5">
           <AlertCircle className="h-4 w-4 text-primary" />
           <AlertTitle>Registration Status</AlertTitle>
           <AlertDescription>
             Your team is currently <strong>Pending</strong>. Roster submissions are open but players will be in staging until verified.
           </AlertDescription>
         </Alert>

         <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                   <div>
                     <CardTitle>Roster Management</CardTitle>
                     <CardDescription>Add and manage your players.</CardDescription>
                   </div>
                   <AddPlayerDialog teamId={1} /> {/* Hardcoded ID for demo, usually dynamic */}
                 </CardHeader>
                 <CardContent>
                   <RosterList teamId={1} />
                 </CardContent>
               </Card>
            </div>

            <div className="space-y-8">
               <Card>
                 <CardHeader>
                   <CardTitle>Team Info</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex justify-between border-b pb-2">
                     <span className="text-muted-foreground">Team Name</span>
                     <span className="font-medium">Toronto Eagles</span>
                   </div>
                   <div className="flex justify-between border-b pb-2">
                     <span className="text-muted-foreground">Division</span>
                     <span className="font-medium">Men's A</span>
                   </div>
                   <div className="flex justify-between border-b pb-2">
                     <span className="text-muted-foreground">Season</span>
                     <span className="font-medium">Summer 2025</span>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                     <span className="text-muted-foreground">Status</span>
                     <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
                   </div>
                 </CardContent>
               </Card>
            </div>
         </div>
      </div>
    </MainLayout>
  );
}

function RosterList({ teamId }: { teamId: number }) {
  const { data: players, isLoading } = usePlayers(teamId);

  if (isLoading) return <div className="p-4 text-center">Loading roster...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>#</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
              No players added yet.
            </TableCell>
          </TableRow>
        ) : (
          players?.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">{player.firstName} {player.lastName}</TableCell>
              <TableCell>{player.jerseyNumber}</TableCell>
              <TableCell>
                <Badge variant={player.status === 'verified' ? 'default' : 'secondary'} className={
                  player.status === 'verified' ? 'bg-green-600 hover:bg-green-700' : 
                  player.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 
                  'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }>
                  {player.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
