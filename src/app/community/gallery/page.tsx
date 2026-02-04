"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PublicNav } from "@/components/bloodwings";
import { ROUTES, MOOSTIK_CLANS } from "@/types/bloodwings";
import {
  Search,
  Filter,
  Heart,
  Eye,
  Download,
  Share2,
  Sparkles,
  Image as ImageIcon,
  Film,
  Users,
  TrendingUp,
  Clock,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface GalleryItem {
  id: string;
  type: "image" | "video" | "avatar";
  title: string;
  thumbnail: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  likes: number;
  views: number;
  createdAt: string;
  tags: string[];
  clan?: string;
}

// ============================================================================
// GALLERY PAGE
// ============================================================================

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedClan, setSelectedClan] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/community/gallery");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGallery();
  }, []);

  const filteredItems = items.filter((item) => {
    if (selectedType !== "all" && item.type !== selectedType) return false;
    if (selectedClan !== "all" && item.clan !== selectedClan) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.author.name.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

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
                  Galerie
                </Badge>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                  Galerie communautaire
                </h1>
                <p className="text-zinc-400">
                  Explorez les cr&eacute;ations de la communaut&eacute; Moostik
                </p>
              </div>

              <div className="flex gap-3">
                <Link href={ROUTES.communitySubmit}>
                  <Button className="bg-blood-600 hover:bg-blood-500">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Soumettre une cr&eacute;ation
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  placeholder="Rechercher des cr&eacute;ations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-blood-600"
                />
              </div>

              <div className="flex gap-2">
                {/* Type Filter */}
                <div className="flex bg-zinc-900/50 border border-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedType("all")}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      selectedType === "all"
                        ? "bg-blood-900/50 text-blood-400"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Tout
                  </button>
                  <button
                    onClick={() => setSelectedType("image")}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
                      selectedType === "image"
                        ? "bg-blood-900/50 text-blood-400"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Images
                  </button>
                  <button
                    onClick={() => setSelectedType("video")}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
                      selectedType === "video"
                        ? "bg-blood-900/50 text-blood-400"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    Vid&eacute;os
                  </button>
                  <button
                    onClick={() => setSelectedType("avatar")}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
                      selectedType === "avatar"
                        ? "bg-blood-900/50 text-blood-400"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Avatars
                  </button>
                </div>

                {/* View Mode */}
                <div className="flex bg-zinc-900/50 border border-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-blood-900/50 text-blood-400"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("masonry")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "masonry"
                        ? "bg-blood-900/50 text-blood-400"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Clan Filter */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedClan("all")}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedClan === "all"
                    ? "bg-blood-900/50 text-blood-400 border border-blood-700/30"
                    : "bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                Tous les clans
              </button>
              {Object.entries(MOOSTIK_CLANS).map(([id, clan]) => (
                <button
                  key={id}
                  onClick={() => setSelectedClan(id)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedClan === id
                      ? "border-2"
                      : "bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700"
                  }`}
                  style={{
                    backgroundColor:
                      selectedClan === id ? clan.color + "20" : undefined,
                    borderColor: selectedClan === id ? clan.color : undefined,
                    color: selectedClan === id ? clan.color : undefined,
                  }}
                >
                  <span>{clan.icon}</span>
                  {clan.nameFr}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* GALLERY GRID */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-zinc-900/50 animate-pulse"
                />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
              }
            >
              {filteredItems.map((item) => (
                <GalleryCard key={item.id} item={item} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Aucune cr&eacute;ation trouv&eacute;e
              </h3>
              <p className="text-zinc-500 mb-6">
                Soyez le premier &agrave; partager une cr&eacute;ation dans cette cat&eacute;gorie !
              </p>
              <Link href={ROUTES.communitySubmit}>
                <Button className="bg-blood-600 hover:bg-blood-500">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Soumettre une cr&eacute;ation
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ============================================================================
// GALLERY CARD COMPONENT
// ============================================================================

function GalleryCard({
  item,
  viewMode,
}: {
  item: GalleryItem;
  viewMode: "grid" | "masonry";
}) {
  const clan = item.clan
    ? MOOSTIK_CLANS[item.clan as keyof typeof MOOSTIK_CLANS]
    : null;

  return (
    <Card
      className={`group relative overflow-hidden bg-zinc-900/50 border-zinc-800/50 hover:border-blood-700/30 transition-all ${
        viewMode === "grid" ? "aspect-square" : "break-inside-avoid mb-4"
      }`}
    >
      {/* Image */}
      <div
        className={`relative ${viewMode === "grid" ? "h-full" : "aspect-[4/5]"}`}
      >
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blood-900/30 to-zinc-900 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-zinc-700" />
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          {item.type === "video" && (
            <Badge className="bg-blue-900/80 text-blue-300 border-0 backdrop-blur-sm">
              <Film className="w-3 h-3 mr-1" />
              Vid&eacute;o
            </Badge>
          )}
          {item.type === "avatar" && (
            <Badge className="bg-purple-900/80 text-purple-300 border-0 backdrop-blur-sm">
              <Users className="w-3 h-3 mr-1" />
              Avatar
            </Badge>
          )}
        </div>

        {/* Clan Badge */}
        {clan && (
          <div className="absolute top-2 right-2">
            <Badge
              className="border-0 backdrop-blur-sm"
              style={{ backgroundColor: clan.color + "80", color: "#fff" }}
            >
              {clan.icon}
            </Badge>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>{item.author.avatar}</span>
              <span>{item.author.name}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {item.likes}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {item.views}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-white hover:text-blood-400 hover:bg-white/10"
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-white hover:text-blood-400 hover:bg-white/10"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-white hover:text-blood-400 hover:bg-white/10"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
