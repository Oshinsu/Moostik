"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Timeline events
const TIMELINE_EVENTS = [
  {
    id: "era-before",
    era: "Avant le Génocide",
    period: "Temps immémoriaux - 2047",
    color: "emerald",
    events: [
      {
        title: "L'Âge d'Or Cooltik",
        description: "Le Clan Cooltik prospère dans les profondeurs de la Martinique. Une civilisation sophistiquée de moustiques génies, avec leur propre culture, art et philosophie.",
        characters: ["papy-tik"],
      },
      {
        title: "Le Bar Ti-Sang",
        description: "Création du bar clandestin Ti-Sang, lieu de rassemblement et de culture Moostik.",
        locations: ["bar-ti-sang"],
      },
      {
        title: "Naissance de Baby Dorval",
        description: "Un enfant martiniquais naît dans le village de Jalousies, ignorant du destin qui l'attend.",
        characters: ["baby-dorval", "mama-dorval"],
      },
    ],
  },
  {
    id: "era-genocide",
    era: "Le Génocide",
    period: "2047",
    color: "blood",
    events: [
      {
        title: "Opération BYSS",
        description: "Les humains déclenchent un nuage toxique massif sur la Martinique. Des milliards de Moostiks périssent en quelques heures.",
        locations: ["martinique-exterior-storm"],
      },
      {
        title: "Le Sacrifice de Mama",
        description: "Mama Dorval protège son enfant pendant l'attaque, subissant les effets du poison.",
        characters: ["mama-dorval", "baby-dorval"],
      },
      {
        title: "La Fuite",
        description: "Les survivants du Clan Cooltik fuient vers les profondeurs, guidés par Papy Tik.",
        characters: ["papy-tik"],
      },
    ],
  },
  {
    id: "era-after",
    era: "Après le Génocide",
    period: "2047 - Présent",
    color: "amber",
    events: [
      {
        title: "La Reconstruction",
        description: "Les survivants s'organisent. Le Bar Ti-Sang devient le quartier général de la résistance.",
        locations: ["bar-ti-sang", "cooltik-village"],
      },
      {
        title: "L'Alliance Improbable",
        description: "Baby Dorval, orphelin et transformé par les événements, devient un allié des Moostiks.",
        characters: ["baby-dorval", "papy-tik"],
      },
      {
        title: "Les Plans de Vengeance",
        description: "Papy Tik et les anciens élaborent un plan pour venger les leurs...",
        characters: ["papy-tik"],
      },
    ],
  },
];

export default function TimelinePage() {
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/characters").then(r => r.json()),
      fetch("/api/locations").then(r => r.json()),
    ]).then(([chars, locs]) => {
      setCharacters(chars || []);
      setLocations(locs || []);
    }).catch(console.error);
  }, []);

  const getCharacter = (id: string) => characters.find(c => c.id === id);
  const getLocation = (id: string) => locations.find(l => l.id === id);

  const colorClasses: Record<string, { bg: string; text: string; border: string; line: string }> = {
    emerald: { bg: "bg-emerald-900/50", text: "text-emerald-300", border: "border-emerald-700/50", line: "bg-emerald-500" },
    blood: { bg: "bg-blood-900/50", text: "text-blood-300", border: "border-blood-700/50", line: "bg-blood-500" },
    amber: { bg: "bg-amber-900/50", text: "text-amber-300", border: "border-amber-700/50", line: "bg-amber-500" },
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-4 mb-6">
            <Link href="/series" className="text-zinc-500 hover:text-white text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </Link>
          </nav>
          
          <Badge className="bg-purple-900/50 text-purple-300 border-purple-700/50 mb-4">LORE</Badge>
          <h1 className="text-4xl md:text-5xl font-black">
            <span className="text-blood-500">Chronologie</span> Moostik
          </h1>
          <p className="text-zinc-500 mt-2">
            L'histoire du Clan Cooltik, du génocide à la résistance
          </p>
        </div>
      </header>

      {/* Timeline */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-800" />

          {/* Eras */}
          {TIMELINE_EVENTS.map((era, eraIndex) => {
            const colors = colorClasses[era.color];
            const isActive = activeEra === era.id;

            return (
              <div key={era.id} className="relative mb-16">
                {/* Era Header */}
                <div 
                  className="flex items-center gap-6 mb-8 cursor-pointer"
                  onClick={() => setActiveEra(isActive ? null : era.id)}
                >
                  <div className={`w-16 h-16 rounded-full ${colors.bg} border-4 ${colors.border} flex items-center justify-center z-10`}>
                    <span className={`text-2xl font-black ${colors.text}`}>{eraIndex + 1}</span>
                  </div>
                  <div>
                    <h2 className={`text-3xl font-black ${colors.text}`}>{era.era}</h2>
                    <p className="text-zinc-500">{era.period}</p>
                  </div>
                </div>

                {/* Events */}
                <div className="ml-20 space-y-6">
                  {era.events.map((event, eventIndex) => (
                    <Card 
                      key={eventIndex}
                      className={`${colors.bg} ${colors.border} border p-6 transition-all hover:scale-[1.01]`}
                    >
                      <h3 className={`text-xl font-bold ${colors.text} mb-2`}>{event.title}</h3>
                      <p className="text-zinc-400 mb-4">{event.description}</p>
                      
                      {/* Characters */}
                      {event.characters && event.characters.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {event.characters.map(charId => {
                            const char = getCharacter(charId);
                            if (!char) return null;
                            return (
                              <Link key={charId} href={`/series/characters/${charId}`}>
                                <Badge className="bg-zinc-800/80 text-zinc-300 border-zinc-700/50 hover:bg-zinc-700/80">
                                  {char.type === "moostik" ? "🦟" : "👤"} {char.name}
                                </Badge>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Locations */}
                      {event.locations && event.locations.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {event.locations.map(locId => {
                            const loc = getLocation(locId);
                            if (!loc) return null;
                            return (
                              <Link key={locId} href={`/series/locations/${locId}`}>
                                <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700/50 hover:bg-emerald-800/50">
                                  📍 {loc.name}
                                </Badge>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
