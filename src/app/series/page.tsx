"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PublicHeader } from "@/components/public";

// ============================================================================
// TYPES
// ============================================================================

interface Character {
  id: string;
  name: string;
  type: "moostik" | "human";
  description: string;
  referenceImages?: string[];
}

interface Location {
  id: string;
  name: string;
  description: string;
  referenceImages?: string[];
}

interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
}

// ============================================================================
// SERIES LANDING PAGE
// ============================================================================

export default function SeriesLandingPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    Promise.all([
      fetch("/api/characters").then(r => r.json()),
      fetch("/api/locations").then(r => r.json()),
      fetch("/api/episodes").then(r => r.json()),
    ]).then(([chars, locs, eps]) => {
      setCharacters(chars || []);
      setLocations(locs || []);
      setEpisodes(eps || []);
    }).catch(console.error);
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const moostikCharacters = characters.filter(c => c.type === "moostik");
  const humanCharacters = characters.filter(c => c.type === "human");

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white overflow-x-hidden">
      {/* Public Navigation */}
      <PublicHeader />

      {/* ================================================================ */}
      {/* HERO SECTION - Parallax */}
      {/* ================================================================ */}
      <section 
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden -mt-16"
      >
        {/* Background Layers (Parallax) */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-blood-900/30 via-[#0b0b0e] to-[#0b0b0e]"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        
        {/* Animated Blood Veins */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blood-600 via-blood-800 to-transparent animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          />
          <div 
            className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blood-700 to-blood-900 animate-pulse"
            style={{ animationDelay: "0.5s", transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div 
            className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-blood-700 via-transparent to-blood-800 animate-pulse"
            style={{ animationDelay: "1s", transform: `translateY(${scrollY * 0.15}px)` }}
          />
        </div>

        {/* Hero Content */}
        <div
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          style={{ transform: `translateY(${scrollY * -0.3}px)`, opacity: Math.max(0, 1 - scrollY / 500) }}
        >
          {/* Studio Badge */}
          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 mb-6 text-sm">
            PROOF OF CONCEPT — PIPELINE GÉNÉRATIF
          </Badge>

          {/* Title */}
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase mb-4">
            <span className="block text-blood-500 moostik-text-glow">MOOSTIK</span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-zinc-400 font-light tracking-wide mb-2">
            T0.5 — Genèse des Bloodwings
          </p>

          {/* Tagline */}
          <p className="text-lg text-blood-400 italic mb-8">
            43 shots. 5 parties. 100% généré.
          </p>

          {/* Synopsis factuel */}
          <p className="text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Une série sur des moustiques anthropomorphes. Du génocide à la reconstruction.
            Esthétique Pixar-démoniaque. Fait pour prouver que le pipeline fonctionne.
            Le reste, c&apos;est de la narration.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/watch/t05">
              <Button size="lg" className="moostik-btn-blood text-white font-bold px-8 py-6 text-lg group">
                <span className="mr-2 group-hover:scale-110 transition-transform">▶</span>
                Voir T0.5
              </Button>
            </Link>
            <Link href="/library">
              <Button size="lg" variant="outline" className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20 px-8 py-6 text-lg">
                Explorer les assets
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
          style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
        >
          <svg className="w-8 h-8 text-blood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TECH SECTION */}
      {/* ================================================================ */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 mb-6">PIPELINE</Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="text-blood-500">Comment</span> c&apos;est fait
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6 text-zinc-400">
              <p>
                <span className="text-blood-400 font-bold">Génération image.</span> Chaque shot
                commence par une image. Références de personnages et lieux injectées automatiquement
                pour maintenir la cohérence sur 43 shots.
              </p>
              <p>
                <span className="text-amber-400 font-bold">Image-to-video.</span> First frame,
                last frame, interpolation. Le système chain les shots pour une continuité narrative
                sans intervention manuelle.
              </p>
            </div>
            <div className="space-y-6 text-zinc-400">
              <p>
                <span className="text-purple-400 font-bold">Beat sync.</span> Analyse BPM de la track
                (Requiem for Attack on Titan), calage automatique des cuts sur le tempo.
                Le montage se construit sur la musique.
              </p>
              <p>
                <span className="text-emerald-400 font-bold">Composition.</span> Audio, transitions,
                export EDL. Le résultat sort prêt pour post-prod ou diffusion directe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CHARACTERS CAROUSEL */}
      {/* ================================================================ */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] via-blood-950/20 to-[#0b0b0e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-purple-900/50 text-purple-300 border-purple-700/50 mb-4">PERSONNAGES</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Les <span className="text-blood-500">héros</span> de l'ombre
            </h2>
          </div>

          {/* Moostik Characters */}
          <div className="mb-16">
            <h3 className="text-xl text-amber-400 font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">🦟</span> Les Moostiks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {moostikCharacters.slice(0, 5).map((char) => (
                <Link key={char.id} href={`/series/characters/${char.id}`}>
                  <Card className="bg-zinc-900/50 border-zinc-800 hover:border-blood-700/50 transition-all group overflow-hidden">
                    <div className="aspect-square relative bg-gradient-to-br from-blood-900/20 to-zinc-900">
                      {char.referenceImages?.[0] ? (
                        <img 
                          src={char.referenceImages[0]} 
                          alt={char.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🦟</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-white truncate">{char.name}</h4>
                      <p className="text-xs text-zinc-500 truncate">{char.description?.slice(0, 50)}...</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Human Characters */}
          <div>
            <h3 className="text-xl text-blue-400 font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">👤</span> Les Humains
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {humanCharacters.slice(0, 5).map((char) => (
                <Link key={char.id} href={`/series/characters/${char.id}`}>
                  <Card className="bg-zinc-900/50 border-zinc-800 hover:border-blue-700/50 transition-all group overflow-hidden">
                    <div className="aspect-square relative bg-gradient-to-br from-blue-900/20 to-zinc-900">
                      {char.referenceImages?.[0] ? (
                        <img 
                          src={char.referenceImages[0]} 
                          alt={char.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">👤</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-white truncate">{char.name}</h4>
                      <p className="text-xs text-zinc-500 truncate">{char.description?.slice(0, 50)}...</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/series/characters">
              <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                Voir tous les personnages →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* LOCATIONS SECTION */}
      {/* ================================================================ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700/50 mb-4">LIEUX</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Le <span className="text-emerald-500">monde</span> Moostik
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {locations.slice(0, 3).map((loc) => (
              <Link key={loc.id} href={`/series/locations/${loc.id}`}>
                <Card className="bg-zinc-900/30 border-zinc-800 hover:border-emerald-700/50 transition-all group overflow-hidden h-80">
                  <div className="relative h-full">
                    {loc.referenceImages?.[0] ? (
                      <img 
                        src={loc.referenceImages[0]} 
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 to-zinc-900 flex items-center justify-center">
                        <span className="text-8xl opacity-20">📍</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{loc.name}</h3>
                      <p className="text-zinc-400 text-sm line-clamp-2">{loc.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/series/locations">
              <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                Explorer tous les lieux →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* EPISODES SECTION */}
      {/* ================================================================ */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] via-zinc-950 to-[#0b0b0e]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-blood-900/50 text-blood-300 border-blood-700/50 mb-4">ÉPISODES</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              La <span className="text-blood-500">saga</span>
            </h2>
          </div>

          <div className="space-y-4">
            {episodes.map((ep) => (
              <Link key={ep.id} href={`/series/${ep.id}`}>
                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-blood-700/50 transition-all p-6 flex items-center gap-6 group">
                  <div className="w-20 h-20 rounded-xl bg-blood-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blood-900/50 transition-colors">
                    <span className="text-3xl font-black text-blood-400">
                      {ep.number.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1">{ep.title}</h3>
                    <p className="text-zinc-500 text-sm line-clamp-2">{ep.description}</p>
                  </div>
                  <svg className="w-6 h-6 text-blood-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CTA SECTION */}
      {/* ================================================================ */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blood-900/20 via-transparent to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="text-blood-500">Tu veux</span> le même pipeline ?
          </h2>
          <p className="text-xl text-zinc-500 mb-10">
            Early access. Places limitées. Projets sérieux uniquement.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/studio">
              <Button size="lg" className="moostik-btn-blood text-white font-bold px-10 py-6 text-lg group">
                Voir comment ça marche
              </Button>
            </Link>
            <Link href="/library">
              <Button size="lg" variant="outline" className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20 px-10 py-6 text-lg">
                Explorer les assets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="py-12 px-4 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-blood-500 font-bold text-xl">MOOSTIK</p>
            <p className="text-zinc-600 text-sm">© 2026 Bloodwings Studio. All rights reserved.</p>
          </div>
          
          <nav className="flex gap-6">
            <Link href="/series/characters" className="text-zinc-500 hover:text-white text-sm">Personnages</Link>
            <Link href="/series/locations" className="text-zinc-500 hover:text-white text-sm">Lieux</Link>
            <Link href="/series/lore" className="text-zinc-500 hover:text-white text-sm">Lore</Link>
            <Link href="/promo" className="text-zinc-500 hover:text-white text-sm">Press Kit</Link>
          </nav>
          
          <p className="text-zinc-700 text-xs italic">"We are the real vampires."</p>
        </div>
      </footer>
    </div>
  );
}
