"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { BloodwingsLogo } from "@/components/bloodwings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES, PLANS, type PlanTier } from "@/types/bloodwings";
import {
  LayoutDashboard,
  FolderKanban,
  Film,
  Library,
  Coins,
  Settings,
  Users,
  ChevronRight,
  LogOut,
  Crown,
  Sparkles,
  Menu,
  X,
  Bot,
  Network,
  Waves,
  Brain,
  Ghost,
} from "lucide-react";

// ============================================================================
// NAV ITEMS
// ============================================================================

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/editor", label: "Éditeur", icon: Film, external: true },
  { href: "/library", label: "Bibliothèque", icon: Library, external: true },
  { href: "/app/credits", label: "Crédits", icon: Coins },
];

// EMERGENT AI - Systèmes SOTA++
const AI_NAV_ITEMS = [
  { href: "/app/agents", label: "Hub Agents", icon: Bot, badge: "SOTA" },
  { href: "/app/swarm", label: "Swarm Narrative", icon: Network, badge: "NEW" },
  { href: "/app/reality-bleed", label: "Reality Bleed", icon: Ghost, badge: "NEW" },
  { href: "/app/molt", label: "The Molt", icon: Brain, badge: "NEW" },
];

const SECONDARY_NAV = [
  { href: ROUTES.community, label: "Communauté", icon: Users, external: true },
  { href: "/app/settings", label: "Paramètres", icon: Settings },
];

// ============================================================================
// LAYOUT
// ============================================================================

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, plan, isLoading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState<{ total: number; used: number } | null>(null);

  // Fetch credits on mount
  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch("/api/credits");
        if (res.ok) {
          const data = await res.json();
          setCredits({
            total: data.balance.total,
            used: data.balance.used,
          });
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      }
    }

    if (user) {
      fetchCredits();
    }
  }, [user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="animate-pulse">
          <BloodwingsLogo size="lg" />
        </div>
      </div>
    );
  }

  // Get plan info
  const currentPlan = plan?.tier as PlanTier || "free";
  const planInfo = PLANS[currentPlan];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] flex">
      {/* ================================================================== */}
      {/* SIDEBAR */}
      {/* ================================================================== */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0d12] border-r border-blood-900/20 transform transition-transform duration-200 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-blood-900/20">
          <Link href="/">
            <BloodwingsLogo size="sm" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav - Production */}
        <nav className="p-4 space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
            Production
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-blood-900/30 text-blood-400"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.label === "Crédits" && credits && (
                  <Badge className="ml-auto bg-blood-900/50 text-blood-400 border-0 text-xs">
                    {credits.total}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Nav - Emergent AI */}
        <nav className="px-4 pb-4 space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-blood-500" />
            Emergent AI
          </div>
          {AI_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-blood-900/40 to-purple-900/20 text-blood-400 border border-blood-800/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.badge && (
                  <Badge className={cn(
                    "ml-auto border-0 text-[10px] px-1.5",
                    item.badge === "NEW"
                      ? "bg-emerald-900/50 text-emerald-400"
                      : "bg-purple-900/50 text-purple-400"
                  )}>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Secondary Nav */}
        <div className="p-4 border-t border-blood-900/20">
          {SECONDARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-all"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Plan Badge */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blood-900/20">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blood-900/30 to-zinc-900/50 border border-blood-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{planInfo.nameFr}</span>
              {currentPlan !== "enterprise" && (
                <Link href="/app/credits">
                  <Badge className="bg-blood-600 text-white border-0 text-xs cursor-pointer hover:bg-blood-500">
                    Upgrade
                  </Badge>
                </Link>
              )}
            </div>
            {credits && (
              <div className="text-xs text-zinc-500">
                <span className="text-blood-400 font-medium">{credits.total}</span> crédits restants
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-blood-900/20 bg-[#0b0b0e]/80 backdrop-blur-sm sticky top-0 z-40">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb / Title */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Bloodwings Studio</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
            <span className="text-white font-medium">
              {NAV_ITEMS.find(item =>
                pathname === item.href ||
                (item.href !== "/app/dashboard" && pathname.startsWith(item.href))
              )?.label || AI_NAV_ITEMS.find(item =>
                pathname === item.href || pathname.startsWith(item.href + "/")
              )?.label || "Dashboard"}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Credits quick view */}
            {credits && (
              <Link
                href="/app/credits"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-blood-700/50 transition-colors"
              >
                <Coins className="w-4 h-4 text-blood-400" />
                <span className="text-sm text-white font-medium">{credits.total}</span>
                <span className="text-xs text-zinc-500">crédits</span>
              </Link>
            )}

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 focus:outline-none">
                  <Avatar className="w-8 h-8 border border-blood-700/50">
                    <AvatarImage src={profile?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-blood-900/50 text-blood-400 text-sm">
                      {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#14131a] border-blood-900/30">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-white">{profile?.displayName || "Utilisateur"}</span>
                    <span className="text-xs text-zinc-500 font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blood-900/30" />
                <DropdownMenuItem asChild>
                  <Link href="/app" className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/credits" className="cursor-pointer">
                    <Coins className="w-4 h-4 mr-2" />
                    Crédits & Plan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-blood-900/30" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-400 focus:text-red-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
