import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { useCaptainAuth } from "@/hooks/use-captain-auth";
import { useMyTeams } from "@/hooks/use-teams";
import { Team, insertPlayerSchema } from "@shared/schema";
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
import { usePlayers, useCreatePlayer, useDeletePlayer, useUpdatePlayer } from "@/hooks/use-players";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, AlertCircle, LogIn, Trash2, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Fragment } from "react";
import type { Player } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

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
      toast({ title: "Player added!", description: "They will need admin verification." });
      setOpen(false);
      form.reset();
    } catch (err: any) {
      const msg = err?.response ? await err.response.text().catch(() => err.message) : err.message;
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-add-player"><UserPlus className="h-4 w-4" /> Add Player</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
          <DialogDescription>
            Enter player details. They will appear on your roster once confirmed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({field}) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} data-testid="input-player-first-name" /></FormControl><FormMessage/></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({field}) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} data-testid="input-player-last-name" /></FormControl><FormMessage/></FormItem>
                )} />
             </div>
             <FormField control={form.control} name="email" render={({field}) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} data-testid="input-player-email" /></FormControl><FormMessage/></FormItem>
             )} />
             <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="dob" render={({field}) => (
                    <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} data-testid="input-player-dob" /></FormControl><FormMessage/></FormItem>
               )} />
               <FormField control={form.control} name="jerseyNumber" render={({field}) => (
                    <FormItem><FormLabel>Jersey #</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)} data-testid="input-player-jersey" /></FormControl><FormMessage/></FormItem>
               )} />
             </div>
             <DialogFooter>
               <Button type="submit" disabled={createPlayer.isPending} data-testid="button-submit-player">
                 {createPlayer.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Add Player"}
               </Button>
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function RosterList({ teamId }: { teamId: number }) {
  const { data: players, isLoading } = usePlayers(teamId);
  const deletePlayer = useDeletePlayer();
  const updatePlayer = useUpdatePlayer();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = async (playerId: number) => {
    try {
      await deletePlayer.mutateAsync(playerId);
      toast({ title: "Player removed from roster" });
      setDeleteConfirmId(null);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleApprove = async (playerId: number) => {
    try {
      await updatePlayer.mutateAsync({ id: playerId, status: "confirmed" } as any);
      toast({ title: "Player approved" });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>#</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No players added yet. Use the "Add Player" button to get started.
              </TableCell>
            </TableRow>
          ) : (
            players?.map((player: Player) => (
              <Fragment key={player.id}>
                <TableRow data-testid={`row-player-${player.id}`}>
                  <TableCell className="font-medium">{player.firstName} {player.lastName}</TableCell>
                  <TableCell>{player.jerseyNumber}</TableCell>
                  <TableCell>
                    <Badge variant={player.status === 'confirmed' ? 'default' : player.status === 'flagged' || player.status === 'rejected' ? 'destructive' : 'secondary'} data-testid={`badge-player-status-${player.id}`}>
                      {player.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {player.status === "flagged" && player.registrationType === "player" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleApprove(player.id)}
                          disabled={updatePlayer.isPending}
                          data-testid={`button-approve-player-${player.id}`}
                          title="Approve player"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setExpandedId(expandedId === player.id ? null : player.id)}
                        data-testid={`button-expand-player-${player.id}`}
                      >
                        {expandedId === player.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(player.id)}
                        data-testid={`button-delete-player-${player.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedId === player.id && (
                  <TableRow>
                    <TableCell colSpan={4} className="bg-muted/50">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 py-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email: </span>
                          <span className="font-medium">{player.email}</span>
                        </div>
                        {player.phone && (
                          <div>
                            <span className="text-muted-foreground">Phone: </span>
                            <span className="font-medium">{player.phone}</span>
                          </div>
                        )}
                        {player.dob && (
                          <div>
                            <span className="text-muted-foreground">DOB: </span>
                            <span className="font-medium">{player.dob}</span>
                          </div>
                        )}
                        {player.position && (
                          <div>
                            <span className="text-muted-foreground">Position: </span>
                            <span className="font-medium">{player.position}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Waiver: </span>
                          <span className="font-medium">{player.waiverSigned ? "Signed" : "Not signed"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type: </span>
                          <span className="font-medium">{player.registrationType}</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={deleteConfirmId !== null} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this player from your roster? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deletePlayer.isPending}
              data-testid="button-confirm-delete-roster-player"
            >
              {deletePlayer.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TeamCard({ team }: { team: Team & { tournamentName?: string; divisionName?: string } }) {
  const statusVariant = team.status === "approved" ? "default" : team.status === "rejected" ? "destructive" : "secondary";

  return (
    <div className="space-y-8" data-testid={`section-team-${team.id}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase" data-testid={`text-team-heading-${team.id}`}>{team.name}</h2>
          {(team.tournamentName || team.divisionName) && (
            <p className="text-muted-foreground text-sm mt-1" data-testid={`text-team-context-${team.id}`}>
              {[team.tournamentName, team.divisionName].filter(Boolean).join(" \u2014 ")}
            </p>
          )}
        </div>
        <Badge variant={statusVariant} data-testid={`badge-team-header-status-${team.id}`}>
          {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
        </Badge>
      </div>

      <Alert className={team.status === "approved" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : team.status === "rejected" ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950" : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Team Status: {team.status.charAt(0).toUpperCase() + team.status.slice(1)}</AlertTitle>
        <AlertDescription>
          {team.status === "approved"
            ? "Your team is approved! You can now manage your roster."
            : team.status === "pending"
            ? "Your team registration is under review. You can still add players."
            : "Your team registration was not approved. Contact admin for details."}
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle>Roster Management</CardTitle>
                <CardDescription>Add and manage your players.</CardDescription>
              </div>
              {team.status !== "rejected" && <AddPlayerDialog teamId={team.id} />}
            </CardHeader>
            <CardContent>
              <RosterList teamId={team.id} />
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
                <span className="font-medium" data-testid="text-team-name">{team.name}</span>
              </div>
              {team.tournamentName && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Tournament</span>
                  <span className="font-medium text-sm text-right" data-testid="text-team-tournament">{team.tournamentName}</span>
                </div>
              )}
              {team.divisionName && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Division</span>
                  <span className="font-medium" data-testid="text-team-division">{team.divisionName}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Captain</span>
                <span className="font-medium">{team.captainName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-sm">{team.captainEmail}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant} data-testid="badge-team-status">{team.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CaptainDashboard() {
  const { user } = useAuth();
  const { captain, isLoading: captainLoading, logout: captainLogout } = useCaptainAuth();
  const isLoggedIn = !!user || !!captain;
  const { data: myTeams, isLoading, error } = useMyTeams();

  if (captainLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!isLoggedIn) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <LogIn className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Sign in with the credentials you received when your team was approved.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/captain-login">
              <Button data-testid="link-captain-login">Captain Sign In</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-secondary text--stone-900 py-12">
        <div className="container mx-auto px-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold font-display uppercase" data-testid="text-captain-title">Captain's Dashboard</h1>
            <p className="opacity-80">Manage your teams and rosters.</p>
          </div>
          {captain && (
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-80">{captain.email}</span>
              <Button variant="outline" size="sm" onClick={() => captainLogout()} data-testid="button-captain-logout" className="border-black/30 text-black">
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load your teams. Please try again later.</AlertDescription>
          </Alert>
        ) : !myTeams || myTeams.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold mb-2">No Teams Found</h2>
            <p className="text-muted-foreground mb-6">
              No teams are linked to your account yet. If you registered a team, make sure you're signed in with the same email you used during registration. Your team must also be approved by an admin before it appears here.
            </p>
            <Link href="/register">
              <Button data-testid="link-register">Register a Team</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {myTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
