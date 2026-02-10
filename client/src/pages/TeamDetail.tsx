import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { useTeam } from "@/hooks/use-teams";
import { usePlayers } from "@/hooks/use-players";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ArrowLeft, Mail, Phone, ShieldCheck, AlertCircle, Clock } from "lucide-react";
import type { Player } from "@shared/schema";

export default function TeamDetail() {
  const [, params] = useRoute("/teams/:id");
  const teamId = Number(params?.id);

  const { data: team, isLoading } = useTeam(teamId);
  const { data: players } = usePlayers(teamId);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold font-display mb-4">Team Not Found</h1>
          <Link href="/tournaments">
            <Button data-testid="link-back-tournaments">Back to Tournaments</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const verifiedPlayers = players?.filter((p: Player) => p.status === "verified") || [];
  const stagingPlayers = players?.filter((p: Player) => p.status === "staging") || [];
  const rejectedPlayers = players?.filter((p: Player) => p.status === "rejected") || [];

  const statusColor: Record<string, string> = {
    verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    staging: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <Link href={`/tournaments/${team.tournamentId}`}>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white mb-4" data-testid="link-back-tournament">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Tournament
            </Button>
          </Link>
          <div className="flex items-center gap-6 flex-wrap">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-20 h-20 object-contain rounded-lg bg-white/10 p-2" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="h-10 w-10 text-white/60" />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold font-display text-white" data-testid="text-team-name">{team.name}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge className={team.status === "approved" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                  {team.status.toUpperCase()}
                </Badge>
                {team.description && <span className="text-white/70 text-sm">{team.description}</span>}
              </div>
            </div>
          </div>

          {/* Captain Info */}
          <div className="mt-6 flex items-center gap-6 text-white/80 text-sm flex-wrap">
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Captain: {team.captainName}</span>
            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {team.captainEmail}</span>
            <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {team.captainPhone}</span>
          </div>
        </div>
      </section>

      {/* Roster */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="roster">
          <TabsList className="mb-6" data-testid="tabs-team">
            <TabsTrigger value="roster" data-testid="tab-roster">Roster ({players?.length || 0})</TabsTrigger>
            <TabsTrigger value="info" data-testid="tab-info">Team Info</TabsTrigger>
          </TabsList>

          <TabsContent value="roster">
            {/* Summary Badges */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3" /> {verifiedPlayers.length} Verified</Badge>
              <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> {stagingPlayers.length} Pending Review</Badge>
              {rejectedPlayers.length > 0 && (
                <Badge variant="outline" className="gap-1 text-destructive border-destructive"><AlertCircle className="h-3 w-3" /> {rejectedPlayers.length} Rejected</Badge>
              )}
            </div>

            {players && players.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary text-secondary-foreground">
                        <TableHead className="text-secondary-foreground w-16">#</TableHead>
                        <TableHead className="text-secondary-foreground">Name</TableHead>
                        <TableHead className="text-secondary-foreground">Position</TableHead>
                        <TableHead className="text-secondary-foreground">DOB</TableHead>
                        <TableHead className="text-secondary-foreground">Status</TableHead>
                        <TableHead className="text-secondary-foreground">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.map((player: Player) => (
                        <TableRow key={player.id} data-testid={`row-player-${player.id}`}>
                          <TableCell className="font-bold text-lg">{player.jerseyNumber ?? "-"}</TableCell>
                          <TableCell className="font-medium">{player.firstName} {player.lastName}</TableCell>
                          <TableCell>{player.position || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{player.dob}</TableCell>
                          <TableCell>
                            <Badge className={statusColor[player.status]}>{player.status.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {player.adminNotes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <p className="text-muted-foreground text-center py-12">No players on the roster yet.</p>
            )}
          </TabsContent>

          <TabsContent value="info">
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Team Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><span className="text-sm text-muted-foreground">Name:</span> <span className="font-medium">{team.name}</span></div>
                  <div><span className="text-sm text-muted-foreground">Status:</span> <Badge className={team.status === "approved" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>{team.status}</Badge></div>
                  {team.teamColor && <div><span className="text-sm text-muted-foreground">Team Color:</span> <span className="inline-block w-4 h-4 rounded-full ml-2 border" style={{ backgroundColor: team.teamColor }} /></div>}
                  {team.description && <div><span className="text-sm text-muted-foreground">Description:</span> <p className="mt-1">{team.description}</p></div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Captain Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><span className="text-sm text-muted-foreground">Name:</span> <span className="font-medium">{team.captainName}</span></div>
                  <div><span className="text-sm text-muted-foreground">Email:</span> <span>{team.captainEmail}</span></div>
                  <div><span className="text-sm text-muted-foreground">Phone:</span> <span>{team.captainPhone}</span></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
