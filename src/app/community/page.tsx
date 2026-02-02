"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicNav } from "@/components/bloodwings";
import { ROUTES, MOOSTIK_CLANS, type CommunityPostType } from "@/types/bloodwings";
import {
  Search,
  Plus,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  TrendingUp,
  Clock,
  Award,
  UserPlus,
  Sparkles,
  Film,
  Users,
} from "lucide-react";

// ============================================================================
// PLACEHOLDER DATA - COMMUNITY EN DÉVELOPPEMENT
// ============================================================================

interface MockPost {
  id: string;
  type: CommunityPostType;
  author: { name: string; username: string; avatar: string; badges: string[] };
  title: string;
  content: string;
  thumbnail: string | null;
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  clan?: string;
  status?: string;
}

// Community feature en cours de développement
// Ces données sont des placeholders pour l'UI
const MOCK_POSTS: MockPost[] = [];

const TRENDING_CREATORS: { name: string; username: string; avatar: string; followers: number }[] = [];

// ============================================================================
// COMMUNITY PAGE
// ============================================================================

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#0b0b0e]">
      <PublicNav />
      
      <main className="pt-16">
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <section className="border-b border-zinc-800/50 bg-gradient-to-b from-blood-950/30 to-[#0b0b0e]">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <Badge className="mb-2 bg-blood-900/50 text-blood-400 border-blood-700/30">
                  Communauté
                </Badge>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                  Créations de la communauté
                </h1>
                <p className="text-zinc-400">
                  Partagez vos créations, soumettez vos épisodes, créez votre avatar
                </p>
              </div>
              
              <div className="flex gap-3">
                <Link href={ROUTES.communityAvatar}>
                  <Button variant="outline" className="border-zinc-700">
                    <Users className="w-4 h-4 mr-2" />
                    Créer mon Avatar
                  </Button>
                </Link>
                <Link href={ROUTES.communitySubmit}>
                  <Button className="bg-blood-600 hover:bg-blood-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Soumettre un épisode
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Search */}
            <div className="mt-6 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  placeholder="Rechercher des créations, avatars, épisodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-blood-600"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* MAIN CONTENT */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Feed */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="trending" className="w-full">
                <TabsList className="bg-zinc-900/50 border border-zinc-800/50 mb-6">
                  <TabsTrigger value="trending" className="data-[state=active]:bg-blood-900/50 data-[state=active]:text-blood-400">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Tendances
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="data-[state=active]:bg-blood-900/50 data-[state=active]:text-blood-400">
                    <Clock className="w-4 h-4 mr-2" />
                    Récent
                  </TabsTrigger>
                  <TabsTrigger value="episodes" className="data-[state=active]:bg-blood-900/50 data-[state=active]:text-blood-400">
                    <Film className="w-4 h-4 mr-2" />
                    Épisodes
                  </TabsTrigger>
                  <TabsTrigger value="avatars" className="data-[state=active]:bg-blood-900/50 data-[state=active]:text-blood-400">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Avatars
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="trending" className="space-y-4">
                  {MOCK_POSTS.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </TabsContent>
                
                <TabsContent value="recent" className="space-y-4">
                  {[...MOCK_POSTS].reverse().map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </TabsContent>
                
                <TabsContent value="episodes" className="space-y-4">
                  {MOCK_POSTS.filter(p => p.type === "episode_submission").map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </TabsContent>
                
                <TabsContent value="avatars" className="space-y-4">
                  {MOCK_POSTS.filter(p => p.type === "avatar").map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Revenue sharing info */}
              <Card className="p-4 bg-gradient-to-br from-emerald-900/20 to-zinc-900/50 border-emerald-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white">Revenue Sharing</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                  Soumettez votre épisode Moostik et gagnez <span className="text-emerald-400 font-bold">15%</span> des revenus générés s&apos;il est publié !
                </p>
                <Link href={ROUTES.communitySubmit}>
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500">
                    Soumettre un épisode
                  </Button>
                </Link>
              </Card>
              
              {/* Top creators */}
              <Card className="p-4 bg-zinc-900/50 border-zinc-800/50">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blood-400" />
                  Créateurs populaires
                </h3>
                <div className="space-y-3">
                  {TRENDING_CREATORS.map((creator) => (
                    <Link
                      key={creator.username}
                      href={ROUTES.communityProfile(creator.username)}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{creator.avatar}</span>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-blood-400 transition-colors">
                            {creator.name}
                          </p>
                          <p className="text-xs text-zinc-500">@{creator.username}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-blood-400">
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </Card>
              
              {/* Clans */}
              <Card className="p-4 bg-zinc-900/50 border-zinc-800/50">
                <h3 className="font-bold text-white mb-4">Explorer par clan</h3>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(MOOSTIK_CLANS).map(([id, clan]) => (
                    <Link
                      key={id}
                      href={`/community?clan=${id}`}
                      className="aspect-square rounded-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                      style={{ backgroundColor: clan.color + "20" }}
                      title={clan.nameFr}
                    >
                      {clan.icon}
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// ============================================================================
// POST CARD COMPONENT
// ============================================================================

function PostCard({ post }: { post: MockPost }) {
  const clan = post.clan ? MOOSTIK_CLANS[post.clan as keyof typeof MOOSTIK_CLANS] : null;
  
  return (
    <Card className="p-4 bg-zinc-900/50 border-zinc-800/50 hover:border-blood-700/30 transition-all">
      <div className="flex gap-4">
        {/* Thumbnail */}
        {post.thumbnail && (
          <div className="w-32 h-24 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden">
            <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{post.author.avatar}</span>
            <span className="text-sm font-medium text-white">{post.author.name}</span>
            <span className="text-xs text-zinc-500">@{post.author.username}</span>
                {post.author.badges.includes("verified") && (
                  <Badge className="bg-blue-900/50 text-blue-400 border-0 text-[10px] px-1.5 py-0">
                    ✓
                  </Badge>
                )}
                {post.author.badges.includes("top_creator") && (
                  <Badge className="bg-amber-900/50 text-amber-400 border-0 text-[10px] px-1.5 py-0">
                    Top
                  </Badge>
                )}
            <span className="text-xs text-zinc-600 ml-auto">{post.createdAt}</span>
          </div>
          
          {/* Title & Type */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white truncate">{post.title}</h3>
            {post.type === "episode_submission" && (
              <Badge className={`text-[10px] ${
                post.status === "published" 
                  ? "bg-emerald-900/50 text-emerald-400" 
                  : "bg-amber-900/50 text-amber-400"
              } border-0`}>
                {post.status === "published" ? "Publié" : "En review"}
              </Badge>
            )}
            {clan && (
              <Badge 
                className="text-[10px] border-0" 
                style={{ backgroundColor: clan.color + "30", color: clan.color }}
              >
                {clan.icon} {clan.nameFr}
              </Badge>
            )}
          </div>
          
          {/* Description */}
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{post.content}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <button className="flex items-center gap-1 hover:text-blood-400 transition-colors">
              <Heart className="w-4 h-4" />
              {post.likes}
            </button>
            <button className="flex items-center gap-1 hover:text-blood-400 transition-colors">
              <MessageSquare className="w-4 h-4" />
              {post.comments}
            </button>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views}
            </span>
            <button className="flex items-center gap-1 hover:text-blood-400 transition-colors ml-auto">
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
