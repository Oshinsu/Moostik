"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ============================================================================
// TYPES
// ============================================================================

interface Variation {
  id: string;
  cameraAngle: string;
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl?: string;
}

interface Shot {
  id: string;
  name: string;
  number: number;
  description: string;
  sceneType: string;
  prompt: any;
  variations: Variation[];
}

interface Category {
  id: string;
  title: string;
  description: string;
  shots: Shot[];
}

interface PromoData {
  id: string;
  title: string;
  description: string;
  categories: Category[];
}

// ============================================================================
// COPYWRITING SOTA
// ============================================================================

const TAGLINES = {
  studio: "We are the real vampires.",
  production: "Where demons dream in 4K.",
  creative: "Every drop tells a story.",
  humor: "Pixar, but with more blood.",
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function PromoAssetsPage() {
  const [data, setData] = useState<PromoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("logos");
  const [openShots, setOpenShots] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/promo");
      if (res.ok) {
        const promoData = await res.json();
        setData(promoData);
      }
    } catch (error) {
      console.error("Failed to fetch promo data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleShot = (shotId: string) => {
    setOpenShots((prev) =>
      prev.includes(shotId)
        ? prev.filter((id) => id !== shotId)
        : [...prev, shotId]
    );
  };

  const generateShot = async (categoryId: string, shot: Shot) => {
    setGenerating(shot.id);
    
    try {
      // Call the batch generate API with the shot's prompt
      const res = await fetch("/api/generate/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: "promo-assets",
          shots: [{
            id: shot.id,
            name: shot.name,
            prompt: shot.prompt,
          }],
        }),
      });

      if (res.ok) {
        // Refresh data after generation
        await fetchData();
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setGenerating(null);
    }
  };

  const generateCategory = async (category: Category) => {
    setGenerating(`category-${category.id}`);
    
    try {
      const res = await fetch("/api/generate/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: "promo-assets",
          shots: category.shots.map((shot) => ({
            id: shot.id,
            name: shot.name,
            prompt: shot.prompt,
          })),
        }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Batch generation failed:", error);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blood-900 border-t-blood-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Chargement des assets...</p>
        </div>
      </div>
    );
  }

  const categories = data?.categories || [];
  const totalShots = categories.reduce((acc, cat) => acc + cat.shots.length, 0);
  const completedShots = categories.reduce(
    (acc, cat) => acc + cat.shots.filter((s) => s.variations.some((v) => v.status === "completed")).length,
    0
  );

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-zinc-100">
      {/* ================================================================== */}
      {/* HERO HEADER */}
      {/* ================================================================== */}
      <header className="relative border-b border-blood-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blood-900/40 via-[#0b0b0e] to-purple-900/20" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-4 border-b border-blood-900/20">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blood-400 hover:text-blood-300 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              QG Moostik
            </Link>
            <span className="text-zinc-700">|</span>
            <Link href="/ep0" className="text-zinc-500 hover:text-white text-sm">EP0</Link>
          </div>
          <Badge className="bg-purple-900/50 text-purple-400 border-purple-700/30">PROMO ASSETS</Badge>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-8 py-16 max-w-6xl mx-auto text-center">
          <Badge className="bg-blood-600 text-white border-0 px-4 py-1 mb-6">BLOODWINGS STUDIO</Badge>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-4">
            <span className="text-blood-500">PROMO</span> ASSETS
          </h1>
          
          <p className="text-2xl text-blood-400/80 font-light italic mb-4">
            "{TAGLINES.studio}"
          </p>
          
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
            {data?.description}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-3">
              <span className="text-3xl font-black text-white">{totalShots}</span>
              <span className="text-zinc-500 text-sm block">Assets Total</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-3">
              <span className="text-3xl font-black text-blood-500">{completedShots}</span>
              <span className="text-zinc-500 text-sm block">Générés</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-3">
              <span className="text-3xl font-black text-amber-400">{categories.length}</span>
              <span className="text-zinc-500 text-sm block">Catégories</span>
            </div>
          </div>

          {/* Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest text-zinc-500">
              <span>Production</span>
              <span className="text-blood-500">{Math.round((completedShots / totalShots) * 100)}%</span>
            </div>
            <Progress value={(completedShots / totalShots) * 100} className="h-2 bg-zinc-900" />
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* CATEGORIES TABS */}
      {/* ================================================================== */}
      <main className="max-w-7xl mx-auto p-8">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 mb-8 flex-wrap h-auto gap-1">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="data-[state=active]:bg-blood-600 data-[state=active]:text-white rounded-lg px-4 py-2 text-zinc-400 font-bold text-sm"
              >
                {cat.title.split(" ")[0]}
                <Badge className="ml-2 bg-zinc-800 text-zinc-400 border-0 text-[10px]">
                  {cat.shots.length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{category.title}</h2>
                  <p className="text-zinc-500">{category.description}</p>
                </div>
                <Button
                  onClick={() => generateCategory(category)}
                  disabled={generating !== null}
                  className="moostik-btn-blood text-white font-bold"
                >
                  {generating === `category-${category.id}` ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Génération...
                    </>
                  ) : (
                    <>
                      🚀 Générer Tout ({category.shots.length})
                    </>
                  )}
                </Button>
              </div>

              {/* Shots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.shots.map((shot) => {
                  const hasImage = shot.variations.some((v) => v.status === "completed" && v.imageUrl);
                  const previewImage = shot.variations.find((v) => v.imageUrl)?.imageUrl;
                  const isGenerating = generating === shot.id;
                  const isOpen = openShots.includes(shot.id);

                  return (
                    <Card key={shot.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                      {/* Preview */}
                      <div className="aspect-video relative bg-gradient-to-br from-blood-900/30 to-zinc-900">
                        {previewImage ? (
                          <img src={previewImage} alt={shot.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <span className="text-4xl opacity-30">🎨</span>
                              <p className="text-zinc-600 text-xs mt-2 uppercase">Pending</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <Badge
                          className={`absolute top-2 right-2 text-[9px] border-0 ${
                            hasImage
                              ? "bg-green-600 text-white"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {hasImage ? "✓ READY" : "PENDING"}
                        </Badge>
                        
                        {/* Number */}
                        <Badge className="absolute top-2 left-2 bg-blood-600 text-white text-[10px] border-0">
                          #{shot.number.toString().padStart(2, "0")}
                        </Badge>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-white font-bold mb-1">{shot.name}</h3>
                        <p className="text-zinc-500 text-xs mb-4 line-clamp-2">{shot.description}</p>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => generateShot(category.id, shot)}
                            disabled={generating !== null}
                            size="sm"
                            className="flex-1 bg-blood-600 hover:bg-blood-500 text-white text-xs"
                          >
                            {isGenerating ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              "🎬 Générer"
                            )}
                          </Button>
                          <Button
                            onClick={() => toggleShot(shot.id)}
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-xs"
                          >
                            {isOpen ? "▲" : "▼"} JSON
                          </Button>
                        </div>

                        {/* Collapsible JSON Preview */}
                        <Collapsible open={isOpen}>
                          <CollapsibleContent>
                            <div className="mt-4 p-3 bg-zinc-950 rounded-lg overflow-auto max-h-60">
                              <pre className="text-[10px] text-zinc-400 font-mono whitespace-pre-wrap">
                                {JSON.stringify(shot.prompt, null, 2)}
                              </pre>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* ================================================================== */}
      {/* COPYWRITING SECTION */}
      {/* ================================================================== */}
      <section className="border-t border-blood-900/30 bg-zinc-900/30 py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-8 text-center">
            <span className="text-blood-500">📝</span> Copywriting SOTA
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(TAGLINES).map(([key, tagline]) => (
              <Card key={key} className="bg-zinc-900/50 border-zinc-800 p-6">
                <Badge className="bg-blood-900/30 text-blood-400 border-blood-700/30 mb-3">
                  {key.toUpperCase()}
                </Badge>
                <p className="text-2xl font-bold text-white italic">"{tagline}"</p>
              </Card>
            ))}
          </div>

          {/* Studio Description */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-8 mt-8">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-blood-400">
              🩸 BLOODWINGS STUDIO
            </h3>
            <div className="text-zinc-300 space-y-4 leading-relaxed">
              <p>Le premier studio d'animation au monde dirigé par des moustiques.</p>
              <p>
                Nos réalisateurs ont 2mm de hauteur mais des ambitions de titan.
                Notre directeur artistique voit le monde en POV micro — chaque grain 
                de poussière est une montagne, chaque goutte de rosée un océan.
              </p>
              <p className="text-white font-bold">
                Nous ne faisons pas des films.
                <br />
                Nous faisons des monuments à la mémoire de nos morts.
              </p>
              <p className="text-blood-400 font-black text-center text-xl mt-6">
                🩸 DÉMONIAQUE. MIGNON. IMPITOYABLE. 🩸
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <footer className="border-t border-blood-900/30 p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-zinc-500 text-sm">
            © 2026 BLOODWINGS STUDIO — "Pixar, but with more blood."
          </div>
          <Link href="/ep0">
            <Button variant="outline" className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20">
              Voir EP0 →
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
