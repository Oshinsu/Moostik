"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PLANS, type PlanTier } from "@/types/bloodwings";
import {
  Plus,
  FolderKanban,
  Film,
  Image,
  Video,
  Coins,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  Play,
  ExternalLink,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface DashboardStats {
  projects: number;
  episodes: number;
  images: number;
  videos: number;
  creditsUsed: number;
  creditsTotal: number;
}

interface RecentProject {
  id: string;
  name: string;
  updatedAt: string;
  episodesCount: number;
  imagesCount: number;
}

// ============================================================================
// DASHBOARD PAGE
// ============================================================================

export default function DashboardPage() {
  const { user, profile, plan } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch credits
        const creditsRes = await fetch("/api/credits");
        const creditsData = creditsRes.ok ? await creditsRes.json() : null;

        // Mock stats for now
        setStats({
          projects: 2,
          episodes: 3,
          images: 156,
          videos: 42,
          creditsUsed: creditsData?.balance?.used || 0,
          creditsTotal: creditsData?.balance?.total || 50,
        });

        // Mock recent projects
        setRecentProjects([
          {
            id: "moostik-ep0",
            name: "Moostik - Épisode 0",
            updatedAt: "Il y a 2 heures",
            episodesCount: 1,
            imagesCount: 89,
          },
          {
            id: "test-project",
            name: "Projet Test",
            updatedAt: "Il y a 3 jours",
            episodesCount: 0,
            imagesCount: 12,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currentPlan = (plan?.tier as PlanTier) || "free";
  const planInfo = PLANS[currentPlan];
  const creditsPercentUsed = stats 
    ? Math.round((stats.creditsUsed / planInfo.limits.maxCreditsPerMonth) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Bonjour, {profile?.displayName || "Créateur"} 👋
          </h1>
          <p className="text-zinc-400 mt-1">
            Voici un aperçu de votre studio
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/app/projects/new">
            <Button className="bg-blood-600 hover:bg-blood-500">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Projet
            </Button>
          </Link>
        </div>
      </div>

      {/* ================================================================== */}
      {/* STATS GRID */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Projets", value: stats?.projects || 0, icon: FolderKanban, color: "blood" },
          { label: "Épisodes", value: stats?.episodes || 0, icon: Film, color: "purple" },
          { label: "Images", value: stats?.images || 0, icon: Image, color: "emerald" },
          { label: "Vidéos", value: stats?.videos || 0, icon: Video, color: "blue" },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="p-4 bg-zinc-900/50 border-zinc-800/50"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-900/30 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ================================================================ */}
        {/* CREDITS USAGE */}
        {/* ================================================================ */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-blood-400" />
              Crédits
            </h2>
            <Link href="/app/credits">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                Détails
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-bold text-white">{stats?.creditsTotal || 0}</span>
                <span className="text-zinc-500 text-sm">
                  / {planInfo.limits.maxCreditsPerMonth} ce mois
                </span>
              </div>
              <Progress 
                value={100 - creditsPercentUsed} 
                className="h-2 bg-zinc-800"
              />
              <p className="text-xs text-zinc-500 mt-2">
                {stats?.creditsUsed || 0} crédits utilisés ce mois
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Plan {planInfo.nameFr}</p>
                  <p className="text-xs text-zinc-600">{planInfo.price.monthly}€/mois</p>
                </div>
                {currentPlan !== "enterprise" && (
                  <Link href="/app/credits">
                    <Button size="sm" className="bg-blood-600 hover:bg-blood-500">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Upgrade
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ================================================================ */}
        {/* RECENT PROJECTS */}
        {/* ================================================================ */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800/50 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-purple-400" />
              Projets récents
            </h2>
            <Link href="/app/projects">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                Voir tout
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/app/projects/${project.id}`}
                  className="block p-4 rounded-lg bg-zinc-800/30 border border-zinc-800/50 hover:border-blood-700/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{project.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          {project.episodesCount} épisodes
                        </span>
                        <span className="flex items-center gap-1">
                          <Image className="w-3 h-3" />
                          {project.imagesCount} images
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.updatedAt}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderKanban className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 mb-4">Aucun projet pour l&apos;instant</p>
              <Link href="/app/projects/new">
                <Button className="bg-blood-600 hover:bg-blood-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier projet
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* ================================================================== */}
      {/* QUICK ACTIONS */}
      {/* ================================================================== */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blood-900/30 to-zinc-900/50 border-blood-800/30 hover:border-blood-600/50 transition-all cursor-pointer group">
          <Link href="/app/editor" className="block">
            <Film className="w-8 h-8 text-blood-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">Créer un épisode</h3>
            <p className="text-sm text-zinc-400">
              Utilisez l&apos;éditeur pour créer votre prochain épisode
            </p>
          </Link>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-zinc-900/50 border-purple-800/30 hover:border-purple-600/50 transition-all cursor-pointer group">
          <Link href="/community/avatar" className="block">
            <Sparkles className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">Créer un avatar</h3>
            <p className="text-sm text-zinc-400">
              Transformez votre photo en personnage Moostik
            </p>
          </Link>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-900/30 to-zinc-900/50 border-emerald-800/30 hover:border-emerald-600/50 transition-all cursor-pointer group">
          <Link href="/moostik" className="block">
            <Play className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">Voir la série</h3>
            <p className="text-sm text-zinc-400">
              Découvrez Moostik, notre série de démonstration
            </p>
          </Link>
        </Card>
      </div>
    </div>
  );
}
