import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Shield, UserCog, Loader2, Users, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  createdAt: string | null;
}

function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("captain");
  const [password, setPassword] = useState("");

  const createUser = useMutation({
    mutationFn: async (data: { email: string; firstName: string; lastName: string; role: string; password: string }) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User created successfully" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }
    createUser.mutate({ email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), role, password });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle data-testid="text-create-user-title">Create User</DialogTitle>
          <DialogDescription>Create a new admin or captain account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                data-testid="input-user-first-name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                data-testid="input-user-last-name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              data-testid="input-user-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              data-testid="input-user-password"
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Temporary password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger data-testid="select-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="captain">Team Captain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createUser.isPending} data-testid="button-submit-user">
              {createUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        if (!fullName.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  const adminCount = users?.filter(u => u.role === "admin").length || 0;
  const captainCount = users?.filter(u => u.role === "captain").length || 0;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display uppercase" data-testid="text-page-title">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage admin and captain accounts.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2" data-testid="button-create-user">
          <Plus className="h-4 w-4" /> Create User
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: `All (${users?.length || 0})` },
            { value: "admin", label: `Admins (${adminCount})` },
            { value: "captain", label: `Captains (${captainCount})` },
          ].map(f => (
            <Button
              key={f.value}
              variant={roleFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(f.value)}
              data-testid={`button-filter-${f.value}`}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto w-full sm:w-auto">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[250px]"
            data-testid="input-search-users"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <Card key={user.id} data-testid={`card-user-${user.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted shrink-0">
                      {user.role === "admin" ? <Shield className="h-5 w-5" /> : <UserCog className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <p className="font-bold text-lg truncate" data-testid={`text-user-name-${user.id}`}>
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : user.email}
                        </p>
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                          data-testid={`badge-user-role-${user.id}`}
                        >
                          {user.role === "admin" ? "Admin" : "Captain"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate" data-testid={`text-user-email-${user.id}`}>{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                      data-testid={`button-expand-user-${user.id}`}
                    >
                      {expandedId === user.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Select
                      value={user.role || "captain"}
                      onValueChange={(newRole) => updateRole.mutate({ id: user.id, role: newRole })}
                    >
                      <SelectTrigger className="w-[130px]" data-testid={`select-change-role-${user.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="captain">Captain</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this user?")) {
                          deleteUser.mutate(user.id);
                        }
                      }}
                      data-testid={`button-delete-user-${user.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {expandedId === user.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        <span className="font-medium">{user.email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">First Name: </span>
                        <span className="font-medium">{user.firstName || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Name: </span>
                        <span className="font-medium">{user.lastName || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Role: </span>
                        <span className="font-medium">{user.role === "admin" ? "Admin" : "Captain"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created: </span>
                        <span className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">User ID: </span>
                        <span className="font-medium text-xs">{user.id}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateUserDialog onClose={() => setShowCreate(false)} />}
    </AdminLayout>
  );
}
