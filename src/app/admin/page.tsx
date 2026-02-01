"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  Search,
  Plus,
  Edit,
  Coins,
  Crown,
  Ban,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Activity,
  Settings,
  Key,
  History,
} from "lucide-react";
import type { Profile, UserRole, Plan } from "@/types/auth";
import { getRoleDisplayName, ROLE_HIERARCHY } from "@/lib/auth/auth-utils";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<UserRole, string> = {
  user: "bg-zinc-700 text-zinc-300",
  member: "bg-blue-900/60 text-blue-300",
  creator: "bg-violet-900/60 text-violet-300",
  admin: "bg-amber-900/60 text-amber-300",
  super_admin: "bg-blood-900/60 text-blood-300",
};

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isSuperAdmin, profile: adminProfile, isLoading: authLoading } = useAuth();
  
  const [users, setUsers] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Action dialogs
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [actionDialog, setActionDialog] = useState<"role" | "credits" | "plan" | null>(null);
  const [actionData, setActionData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });
      
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (planFilter !== "all") params.set("plan", planFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter, planFilter]);

  // Fetch plans
  useEffect(() => {
    fetch("/api/plans")
      .then(res => res.json())
      .then(data => setPlans(data.plans || []))
      .catch(() => setPlans([]));
  }, []);

  // Fetch users when filters change
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Execute admin action
  const executeAction = async () => {
    if (!selectedUser || !actionDialog) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: actionDialog === "role" ? "update_role" :
                  actionDialog === "credits" ? "add_credits" :
                  "update_plan",
          data: actionData,
        }),
      });

      if (res.ok) {
        await fetchUsers();
        setActionDialog(null);
        setSelectedUser(null);
        setActionData({});
      } else {
        const error = await res.json();
        alert(error.error || "Action failed");
      }
    } catch {
      alert("Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user active status
  const toggleUserActive = async (user: Profile) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "toggle_active",
          data: { isActive: !user.isActive },
        }),
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch {
      alert("Action failed");
    }
  };

  // Check auth
  if (authLoading) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="bg-[#14131a] border-blood-900/30 p-8 text-center max-w-md">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Accès refusé</h2>
            <p className="text-zinc-500">Vous n'avez pas les permissions administrateur.</p>
          </Card>
        </main>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-blood-900/30 bg-gradient-to-r from-[#0b0b0e] to-[#14131a]">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blood-600/30 to-crimson-600/20 border border-blood-600/30 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blood-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Administration</h1>
                  <p className="text-sm text-zinc-500">
                    Gérer les utilisateurs et les accès Bloodwing Studio
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", ROLE_COLORS[adminProfile?.role || "user"])}>
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleDisplayName(adminProfile?.role || "user")}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-zinc-900/50 border border-zinc-800/50">
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="invitations">
                <Key className="w-4 h-4 mr-2" />
                Invitations
              </TabsTrigger>
              <TabsTrigger value="logs">
                <History className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Rechercher par email ou nom..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px] bg-zinc-900/50 border-zinc-800">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    {ROLE_HIERARCHY.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-[150px] bg-zinc-900/50 border-zinc-800">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les plans</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchUsers}
                  className="border-zinc-800"
                >
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                </Button>

                <div className="text-sm text-zinc-500">
                  {total} utilisateur{total > 1 ? "s" : ""}
                </div>
              </div>

              {/* Users Table */}
              <Card className="bg-[#14131a] border-blood-900/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blood-900/20 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Utilisateur</TableHead>
                      <TableHead className="text-zinc-400">Rôle</TableHead>
                      <TableHead className="text-zinc-400">Plan</TableHead>
                      <TableHead className="text-zinc-400">Crédits</TableHead>
                      <TableHead className="text-zinc-400">Stats</TableHead>
                      <TableHead className="text-zinc-400">Statut</TableHead>
                      <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <RefreshCw className="w-6 h-6 mx-auto text-zinc-600 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="border-blood-900/20">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-5 h-5 text-zinc-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {user.displayName || user.email.split("@")[0]}
                                </p>
                                <p className="text-xs text-zinc-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", ROLE_COLORS[user.role])}>
                              {getRoleDisplayName(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                              {user.plan?.name || user.planId}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-amber-400 font-mono">
                              {user.creditsBalance.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-zinc-500">
                              <p>{user.imagesGenerated} images</p>
                              <p>{user.videosGenerated} vidéos</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <Badge className="bg-emerald-900/60 text-emerald-400 border-0 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Actif
                              </Badge>
                            ) : (
                              <Badge className="bg-red-900/60 text-red-400 border-0 text-xs">
                                <Ban className="w-3 h-3 mr-1" />
                                Inactif
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-400"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setActionData({ role: user.role });
                                  setActionDialog("role");
                                }}
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-emerald-400"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setActionData({ amount: 100, reason: "" });
                                  setActionDialog("credits");
                                }}
                              >
                                <Coins className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-violet-400"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setActionData({ planId: user.planId });
                                  setActionDialog("plan");
                                }}
                              >
                                <Crown className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-8 w-8 p-0",
                                  user.isActive 
                                    ? "text-zinc-400 hover:text-red-400" 
                                    : "text-zinc-400 hover:text-emerald-400"
                                )}
                                onClick={() => toggleUserActive(user)}
                              >
                                {user.isActive ? (
                                  <Ban className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-blood-900/20">
                    <div className="text-sm text-zinc-500">
                      Page {page + 1} sur {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="border-zinc-800"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="border-zinc-800"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Invitations Tab */}
            <TabsContent value="invitations">
              <Card className="bg-[#14131a] border-blood-900/20 p-8 text-center">
                <Key className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Gestion des invitations</h3>
                <p className="text-zinc-500">Créez des codes d'invitation avec rôles et crédits bonus.</p>
                <Button className="mt-4 moostik-btn-blood text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une invitation
                </Button>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs">
              <Card className="bg-[#14131a] border-blood-900/20 p-8 text-center">
                <History className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Logs d'administration</h3>
                <p className="text-zinc-500">Historique de toutes les actions administratives.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Role Dialog */}
      <Dialog open={actionDialog === "role"} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="bg-[#14131a] border-blood-900/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Modifier le rôle
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-zinc-400">
              Utilisateur: <span className="text-white">{selectedUser?.email}</span>
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-400">Nouveau rôle</Label>
              <Select 
                value={actionData.role as string} 
                onValueChange={(v) => setActionData({ ...actionData, role: v })}
              >
                <SelectTrigger className="bg-[#0b0b0e] border-blood-900/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_HIERARCHY.map((role) => (
                    <SelectItem 
                      key={role} 
                      value={role}
                      disabled={role === "super_admin" && !isSuperAdmin}
                    >
                      {getRoleDisplayName(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionDialog(null)}>
              Annuler
            </Button>
            <Button 
              onClick={executeAction} 
              disabled={isSubmitting}
              className="moostik-btn-blood text-white"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credits Dialog */}
      <Dialog open={actionDialog === "credits"} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="bg-[#14131a] border-blood-900/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              Ajouter des crédits
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-zinc-400">
              Utilisateur: <span className="text-white">{selectedUser?.email}</span>
            </p>
            <p className="text-sm text-zinc-400">
              Solde actuel: <span className="text-amber-400">{selectedUser?.creditsBalance}</span>
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-400">Montant</Label>
              <Input
                type="number"
                value={actionData.amount as number}
                onChange={(e) => setActionData({ ...actionData, amount: parseInt(e.target.value) || 0 })}
                className="bg-[#0b0b0e] border-blood-900/30"
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Raison (optionnel)</Label>
              <Input
                value={actionData.reason as string}
                onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                className="bg-[#0b0b0e] border-blood-900/30"
                placeholder="Bonus de bienvenue..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionDialog(null)}>
              Annuler
            </Button>
            <Button 
              onClick={executeAction} 
              disabled={isSubmitting || !actionData.amount}
              className="bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900/70"
            >
              {isSubmitting ? "Ajout..." : "Ajouter les crédits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Dialog */}
      <Dialog open={actionDialog === "plan"} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="bg-[#14131a] border-blood-900/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-violet-400" />
              Modifier le plan
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-zinc-400">
              Utilisateur: <span className="text-white">{selectedUser?.email}</span>
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-400">Nouveau plan</Label>
              <Select 
                value={actionData.planId as string} 
                onValueChange={(v) => setActionData({ ...actionData, planId: v })}
              >
                <SelectTrigger className="bg-[#0b0b0e] border-blood-900/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} ({plan.creditsMonthly} crédits/mois)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionDialog(null)}>
              Annuler
            </Button>
            <Button 
              onClick={executeAction} 
              disabled={isSubmitting}
              className="bg-violet-900/50 text-violet-400 hover:bg-violet-900/70"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
