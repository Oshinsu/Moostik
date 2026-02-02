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
          {/* Badge */}
          <Badge className="bg-blood-900/50 text-blood-300 border-blood-700/50 mb-6 text-sm">
            ÉPISODE 0 — GENÈSE
          </Badge>

          {/* Title */}
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase mb-4">
            <span className="block text-blood-500 moostik-text-glow">MOOSTIK</span>
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-zinc-300 font-light tracking-wide mb-8">
            &ldquo;Nous sommes les vrais vampires.&rdquo;
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/watch/t05">
              <Button size="lg" className="moostik-btn-blood text-white font-bold px-8 py-6 text-lg group">
                <span className="mr-2 group-hover:scale-110 transition-transform">▶</span>
                Regarder l&apos;Épisode 0
              </Button>
            </Link>
            <Link href="/library">
              <Button size="lg" variant="outline" className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20 px-8 py-6 text-lg">
                Explorer la galerie
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
      {/* SYNOPSIS - L'HISTOIRE COMPLÈTE */}
      {/* ================================================================ */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <Badge className="bg-blood-900/50 text-blood-300 border-blood-700/50 mb-6">SYNOPSIS</Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="text-blood-500">Genèse</span> des Bloodwings
          </h2>

          {/* Introduction */}
          <div className="prose prose-invert prose-lg max-w-none mb-16">
            <p className="text-zinc-300 text-xl leading-relaxed mb-6">
              Dans les murs d&apos;une maison créole de Martinique vit un peuple que personne ne soupçonne.
              Les <span className="text-amber-400 font-semibold">Moostik</span> — des moustiques aux yeux d&apos;ambre,
              dotés d&apos;une intelligence millénaire — ont bâti une civilisation entière dans l&apos;ombre des humains.
              Leur village, niché entre les lames des persiennes, pulse d&apos;une vie invisible.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-6">
              Mama Dorval berce son nouveau-né. Koko affûte sa trompe. Mila prépare le repas du soir.
              Trez raconte des histoires aux plus jeunes. C&apos;est une nuit comme les autres dans le village Cooltik.
            </p>
            <p className="text-zinc-500 leading-relaxed">
              Personne ne voit venir ce qui va suivre.
            </p>
          </div>

          {/* PARTIE 1: APOCALYPSE */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🔥</span>
              <div>
                <Badge className="bg-red-900/50 text-red-300 border-red-700/50 mb-1">PARTIE I</Badge>
                <h3 className="text-2xl font-black text-white">APOCALYPSE</h3>
              </div>
            </div>
            <div className="pl-14 space-y-4 text-zinc-400 border-l-2 border-red-900/50">
              <p>
                Un enfant de cinq ans. Une bombe aérosol rouge et noir : <span className="text-red-400 font-bold">BYSS</span>.
                Un geste innocent qui va déclencher l&apos;enfer.
              </p>
              <p>
                Le nuage toxique se répand. Les flammes noires et rouges engloutissent tout.
                Du point de vue des Moostik, les doigts de l&apos;enfant sont des <span className="text-red-400">titans</span> —
                des colonnes de chair gigantesques qui écrasent les structures, balaient les familles,
                transforment leur monde en cauchemar.
              </p>
              <p>
                La fuite commence. Cinq survivants courent entre les gouttes de poison :
                <span className="text-amber-400"> Koko</span>, <span className="text-purple-400">Mila</span>,
                <span className="text-blue-400"> Trez</span>, <span className="text-pink-400">Mama Dorval</span>
                et son bébé dans les bras.
              </p>
              <p className="text-red-400 font-semibold">
                Trez n&apos;y arrivera pas. Les doigts titans l&apos;écrasent. Premier mort. Premier cri.
              </p>
            </div>
          </div>

          {/* PARTIE 2: ÉVASION */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🏃</span>
              <div>
                <Badge className="bg-blue-900/50 text-blue-300 border-blue-700/50 mb-1">PARTIE II</Badge>
                <h3 className="text-2xl font-black text-white">ÉVASION</h3>
              </div>
            </div>
            <div className="pl-14 space-y-4 text-zinc-400 border-l-2 border-blue-900/50">
              <p>
                Les quatre survivants atteignent les persiennes — la frontière entre leur monde et l&apos;extérieur.
                De l&apos;autre côté : le déluge. Chaque goutte de pluie est une <span className="text-blue-400">bombe</span>
                qui peut les écraser.
              </p>
              <p>
                Ils esquivent. Ils volent. Ils survivent — jusqu&apos;à ce qu&apos;une ombre noire fonde du ciel.
                Un corbeau. Ses yeux fixent le bébé Dorval.
              </p>
              <p className="text-pink-400 font-semibold">
                Mama n&apos;hésite pas une seconde. Elle se jette entre le bec et son enfant.
                Son corps protège le bébé. Son sacrifice leur offre le temps de fuir.
              </p>
              <p>
                Trois survivants. Un bébé orphelin. Et quelque part au loin, un vieux pneu abandonné
                dans la végétation tropicale.
              </p>
            </div>
          </div>

          {/* PARTIE 3: RECONSTRUCTION */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🏗️</span>
              <div>
                <Badge className="bg-amber-900/50 text-amber-300 border-amber-700/50 mb-1">PARTIE III</Badge>
                <h3 className="text-2xl font-black text-white">RECONSTRUCTION</h3>
              </div>
            </div>
            <div className="pl-14 space-y-4 text-zinc-400 border-l-2 border-amber-900/50">
              <p>
                Le Pneu devient leur refuge. Dans cette chambre à air géante, le silence remplace les cris.
                Le deuil commence.
              </p>
              <p>
                Mais la vie continue. <span className="text-purple-400">Mila</span> pond. Des dizaines de cocons
                lumineux apparaissent dans la nurserie improvisée. Une nouvelle génération naît des cendres.
              </p>
              <p>
                Le bébé Dorval grandit. <span className="text-amber-400">Koko</span> lui apprend à se battre —
                le maniement de la trompe, l&apos;art du combat aérien. Mila lui transmet la mémoire —
                les noms des morts, l&apos;histoire du génocide, le serment de ne jamais oublier.
              </p>
              <p className="text-amber-400 font-semibold">
                L&apos;enfant devient adolescent. L&apos;adolescent devient leader.
                Et le leader a une vision.
              </p>
            </div>
          </div>

          {/* PARTIE 4: BLOODWINGS */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">⚔️</span>
              <div>
                <Badge className="bg-blood-900/50 text-blood-300 border-blood-700/50 mb-1">PARTIE IV</Badge>
                <h3 className="text-2xl font-black text-white">BLOODWINGS</h3>
              </div>
            </div>
            <div className="pl-14 space-y-4 text-zinc-400 border-l-2 border-blood-900/50">
              <p>
                Le Pneu devient <span className="text-blood-400 font-bold">Tire City</span>. Une vraie cité
                émerge — architecture bio-organique, forges, académies, places publiques.
                Les survivants ne se cachent plus. Ils se préparent.
              </p>
              <p>
                Dorval fonde la secte des <span className="text-blood-400 font-bold">Bloodwings</span>.
                Leur emblème : la Goutte-Œil, symbole du sang versé et de la vigilance éternelle.
                Leurs serments se font dans le sang. Leur objectif est simple : la vengeance.
              </p>
              <p>
                L&apos;Académie du Sang forme les guerriers. Combat à la trompe. Tactiques d&apos;essaim.
                Science du venin. Fort Sang-Noir devient le cœur militaire de la résistance.
              </p>
              <p className="text-blood-400 font-semibold">
                Vingt ans passent. Le bébé Dorval est devenu Papy Tik — patriarche, stratège, légende.
              </p>
            </div>
          </div>

          {/* PARTIE 5: 20 ANS PLUS TARD */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🍷</span>
              <div>
                <Badge className="bg-purple-900/50 text-purple-300 border-purple-700/50 mb-1">PARTIE V</Badge>
                <h3 className="text-2xl font-black text-white">20 ANS PLUS TARD</h3>
              </div>
            </div>
            <div className="pl-14 space-y-4 text-zinc-400 border-l-2 border-purple-900/50">
              <p>
                <span className="text-amber-400 font-bold">Bar Ti Sang</span>. Lumières tamisées.
                Cocktails de nectar. Musique langoureuse. Les femelles Moostik dansent —
                abdomens voluptueux, ailes irisées, regards de braise.
              </p>
              <p>
                Papy Tik traverse la salle. Les conversations s&apos;arrêtent sur son passage.
                Respect. Crainte. Dévotion. Vingt ans de préparation. Vingt ans d&apos;attente.
              </p>
              <p className="text-blood-400 font-semibold text-lg">
                Un messager arrive. Il murmure quelque chose à l&apos;oreille du patriarche.
                Pour la première fois depuis des années, Papy Tik sourit.
              </p>
              <p className="text-white font-bold text-xl text-center mt-8">
                La vengeance peut enfin commencer.
              </p>
              <p className="text-blood-500 font-black text-2xl text-center mt-4">
                TO BE CONTINUED...
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-3xl font-black text-blood-500">5</p>
              <p className="text-zinc-500 text-sm">Parties</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blood-500">19</p>
              <p className="text-zinc-500 text-sm">Séquences</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blood-500">43</p>
              <p className="text-zinc-500 text-sm">Shots</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blood-500">~8</p>
              <p className="text-zinc-500 text-sm">Minutes</p>
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
            <span className="text-blood-500">Plonge</span> dans l&apos;univers
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Explore les personnages, les lieux, le lore complet.
            Ou regarde l&apos;épisode 0 maintenant.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/watch/t05">
              <Button size="lg" className="moostik-btn-blood text-white font-bold px-10 py-6 text-lg group">
                <span className="mr-2">▶</span>
                Regarder l&apos;Épisode 0
              </Button>
            </Link>
            <Link href="/series/lore">
              <Button size="lg" variant="outline" className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20 px-10 py-6 text-lg">
                Explorer le lore
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
