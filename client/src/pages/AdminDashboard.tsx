import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Trophy, ShieldCheck, Calendar } from "lucide-react";
import { useTournaments } from "@/hooks/use-tournaments";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: tournaments } = useTournaments();

  const stats = [
    { label: "Active Tournaments", value: tournaments?.filter(t => t.status === 'active').length || 0, icon: Trophy, color: "text-blue-600" },
    { label: "Pending Teams", value: 12, icon: Users, color: "text-yellow-600" }, // Mock data
    { label: "Unverified Players", value: 45, icon: ShieldCheck, color: "text-red-600" },
    { label: "Matches Today", value: 4, icon: Calendar, color: "text-green-600" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-secondary">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, Admin.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Teams waiting for approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">Team {i}</p>
                    <p className="text-sm text-muted-foreground">Men's Division A</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Review</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/teams">
                <Button variant="ghost" className="w-full">View All Pending Teams</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tournaments</CardTitle>
            <CardDescription>Quick actions</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {tournaments?.slice(0, 3).map(t => (
                 <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                   <div>
                     <p className="font-medium">{t.name}</p>
                     <p className="text-sm text-muted-foreground">{t.status}</p>
                   </div>
                   <Link href={`/tournaments/${t.id}`}>
                      <Button size="sm" variant="secondary">Manage</Button>
                   </Link>
                 </div>
               ))}
             </div>
             <div className="mt-4 pt-4 border-t">
              <Link href="/admin/tournaments">
                <Button variant="ghost" className="w-full">View All Tournaments</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
