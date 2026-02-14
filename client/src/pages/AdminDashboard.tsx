import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Trophy, ShieldCheck, Calendar, Loader2 } from "lucide-react";
import { useTournaments } from "@/hooks/use-tournaments";
import { useAllTeams } from "@/hooks/use-teams";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: tournaments } = useTournaments();
  const { data: allTeams } = useAllTeams();
  const { data: pendingTeams } = useAllTeams("pending");

  const pendingCount = pendingTeams?.length || 0;
  const approvedCount = allTeams?.filter(t => t.status === "approved").length || 0;

  const stats = [
    { label: "Active Tournaments", value: tournaments?.filter(t => t.status === 'active').length || 0, icon: Trophy, color: "text-blue-600" },
    { label: "Pending Teams", value: pendingCount, icon: Users, color: "text-yellow-600" },
    { label: "Approved Teams", value: approvedCount, icon: ShieldCheck, color: "text-green-600" },
    { label: "Total Teams", value: allTeams?.length || 0, icon: Calendar, color: "text-muted-foreground" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-stone-900" data-testid="text-admin-title">Dashboard Overview</h1>
        <p className="text-stone-900">Welcome back, Admin.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} data-testid={`card-stat-${i}`}>
            <CardContent className="p-4 md:p-6 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2" data-testid={`text-stat-value-${i}`}>{stat.value}</p>
              </div>
              <div className={`p-2 md:p-3 rounded-full bg-gray-100 ${stat.color} hidden sm:flex`}>
                <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Teams waiting for approval</CardDescription>
          </CardHeader>
          <CardContent>
            {!pendingTeams ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : pendingTeams.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No pending teams</p>
            ) : (
              <div className="space-y-4">
                {pendingTeams.slice(0, 5).map(team => (
                  <div key={team.id} className="flex items-center justify-between gap-2 border-b pb-4 last:border-0" data-testid={`row-pending-team-${team.id}`}>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{team.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{team.captainName}</p>
                    </div>
                    <Link href="/admin/teams" className="flex-shrink-0">
                      <Button className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 hover:border-blue-600 " size="sm" variant="outline" data-testid={`button-review-${team.id}`}>Review</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/teams">
                <Button className="w-full bg-black hover:bg-white hover:text-black" data-testid="link-view-all-teams">View All Teams</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tournaments</CardTitle>
            <CardDescription>Overview</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {tournaments?.slice(0, 3).map(t => (
                 <div key={t.id} className="flex items-center justify-between gap-2 border-b pb-4 last:border-0">
                   <div className="min-w-0">
                     <p className="font-medium truncate">{t.name}</p>
                     <p className="text-sm text-muted-foreground capitalize">{t.status}</p>
                   </div>
                   <Link href={`/tournaments/${t.slug}`} className="flex-shrink-0">
                      <Button className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 hover:border-blue-600"size="sm" variant="secondary">View</Button>
                   </Link>
                 </div>
               ))}
               {(!tournaments || tournaments.length === 0) && (
                 <p className="text-muted-foreground text-sm text-center py-4">No tournaments yet</p>
               )}
             </div>
             <div className="mt-4 pt-4 border-t">
              <Link href="/admin/tournaments">
                <Button variant="ghost" className="w-full border-black bg-black text-white hover:bg-white hover:text-black">View All Tournaments</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
