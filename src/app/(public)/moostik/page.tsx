"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROUTES, MOOSTIK_CLANS, type MoostikClan } from "@/types/bloodwings";
import {
  Play,
  Users,
  MapPin,
  BookOpen,
  ChevronRight,
  Clock,
  Calendar,
  Eye,
} from "lucide-react";

// ============================================================================
// PAGE SÉRIE MOOSTIK
// ============================================================================

const EPISODES = [
  {
    id: "ep0",
    number: 0,
    title: "L'Éveil des Ailes de Sang",
    description: "La Martinique, 1902. La montagne Pelée s'éveille, et avec elle, les premiers Moostik...",
    duration: "12 min",
    thumbnail: "/output/references/characters/baby-dorval.png",
    status: "available",
  },
  {
    id: "ep1",
    number: 1,
    title: "Les Cendres de Saint-Pierre",
    description: "Dans les ruines fumantes, les survivants découvrent leurs nouveaux pouvoirs...",
    duration: "15 min",
    thumbnail: null,
    status: "coming_soon",
  },
];

const CHARACTERS = [
  { name: "Baby Dorval", clan: "bloodwing" as MoostikClan, role: "Protagoniste" },
  { name: "Mama Dorval", clan: "sunfire" as MoostikClan, role: "Matriarche" },
  { name: "Trez", clan: "shadowveil" as MoostikClan, role: "L'Ombre" },
  { name: "Mila", clan: "crystalmind" as MoostikClan, role: "La Voyante" },
];

export default function MoostikSeriesPage() {
  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* HERO */}
      {/* ================================================================== */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blood-950/80 via-[#0b0b0e] to-[#0b0b0e]" />
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-crimson-900/50 text-crimson-400 border-crimson-700/30">
            Série Originale
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-blood-500 via-crimson-500 to-blood-600 bg-clip-text text-transparent">
              MOOSTIK
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-8">
            Martinique, 1902. L&apos;éruption de la Montagne Pelée éveille des pouvoirs ancestraux.
            Les clans renaissent de leurs cendres.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href={`/watch/ep0`}>
              <Button 
                size="lg" 
                className="bg-blood-600 hover:bg-blood-500 text-white font-bold px-8 py-6"
              >
                <Play className="w-5 h-5 mr-2" />
                Regarder l&apos;Épisode 0
              </Button>
            </Link>
            <Link href={ROUTES.studio}>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-zinc-700 text-zinc-300 px-8 py-6"
              >
                Créer avec Bloodwings
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Saison 1</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>~12 min/épisode</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>12K+ vues</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SYNOPSIS */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0b0b0e] to-[#0d0d12]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Synopsis</h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            8 mai 1902. L&apos;éruption cataclysmique de la Montagne Pelée détruit Saint-Pierre
            et tue 30 000 âmes en quelques minutes. Mais dans les cendres brûlantes,
            quelque chose d&apos;ancien s&apos;éveille. Les Moostik, créatures mythiques des légendes
            créoles, renaissent à travers les survivants. Chacun hérite des pouvoirs d&apos;un clan ancestral.
            <br /><br />
            Baby Dorval, simple enfant de la rue, découvre qu&apos;il porte en lui l&apos;essence
            des <span className="text-blood-400 font-semibold">Ailes de Sang</span>.
            Dans un monde où la frontière entre vivants et esprits s&apos;effondre,
            il devra apprendre à maîtriser ses pouvoirs... ou être consumé par eux.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ÉPISODES */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-[#0b0b0e]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Épisodes</h2>
            <Badge className="bg-blood-900/50 text-blood-400 border-blood-700/30">
              Saison 1
            </Badge>
          </div>
          
          <div className="space-y-4">
            {EPISODES.map((ep) => (
              <Card
                key={ep.id}
                className={`p-4 bg-zinc-900/50 border-zinc-800/50 hover:border-blood-700/50 transition-all ${
                  ep.status === "coming_soon" ? "opacity-60" : ""
                }`}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-48 h-28 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden">
                    {ep.thumbnail ? (
                      <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Clock className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blood-400 font-bold">E{ep.number}</span>
                      <span className="text-white font-semibold">{ep.title}</span>
                      {ep.status === "coming_soon" && (
                        <Badge className="bg-zinc-800 text-zinc-400 border-0 text-xs">
                          Bientôt
                        </Badge>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm mb-2">{ep.description}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ep.duration}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action */}
                  <div className="flex items-center">
                    {ep.status === "available" ? (
                      <Link href={`/watch/${ep.id}`}>
                        <Button className="bg-blood-600 hover:bg-blood-500">
                          <Play className="w-4 h-4 mr-2" />
                          Regarder
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="bg-zinc-800 text-zinc-500">
                        Bientôt disponible
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CLANS */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0b0b0e] to-blood-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Les Clans Moostik</h2>
            <p className="text-zinc-400">Huit clans ancestraux aux pouvoirs uniques</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(MOOSTIK_CLANS) as MoostikClan[]).map((clanId) => {
              const clan = MOOSTIK_CLANS[clanId];
              return (
                <div
                  key={clanId}
                  className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-opacity-100 transition-all text-center group"
                  style={{ borderColor: clan.color + "40" }}
                >
                  <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">
                    {clan.icon}
                  </span>
                  <h3 className="font-bold text-white mb-1">{clan.nameFr}</h3>
                  <p className="text-xs text-zinc-500">{clan.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PERSONNAGES */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-[#0b0b0e]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Personnages</h2>
            <Link href="/moostik/characters" className="text-blood-400 hover:text-blood-300 flex items-center">
              Voir tous
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {CHARACTERS.map((char) => {
              const clan = MOOSTIK_CLANS[char.clan];
              return (
                <div
                  key={char.name}
                  className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-blood-700/50 transition-all"
                >
                  <div 
                    className="w-full aspect-square rounded-lg mb-3 flex items-center justify-center text-5xl"
                    style={{ backgroundColor: clan.color + "20" }}
                  >
                    {clan.icon}
                  </div>
                  <h3 className="font-bold text-white">{char.name}</h3>
                  <p className="text-xs text-zinc-500">{char.role}</p>
                  <Badge 
                    className="mt-2 text-xs border-0"
                    style={{ backgroundColor: clan.color + "30", color: clan.color }}
                  >
                    {clan.nameFr}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA CRÉER */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0b0b0e] to-blood-950/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Envie de créer votre propre épisode ?
          </h2>
          <p className="text-zinc-400 mb-8">
            Soumettez votre épisode et gagnez 15% des revenus générés
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ROUTES.communitySubmit}>
              <Button size="lg" className="bg-blood-600 hover:bg-blood-500">
                Soumettre un épisode
              </Button>
            </Link>
            <Link href={ROUTES.studio}>
              <Button size="lg" variant="outline" className="border-zinc-700">
                Découvrir le Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
