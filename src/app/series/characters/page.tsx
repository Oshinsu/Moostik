"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Character {
  id: string;
  name: string;
  type: "moostik" | "human";
  description: string;
  traits?: string[];
  referenceImages?: string[];
  role?: string;
}

export default function SeriesCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "moostik" | "human">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/characters")
      .then(r => r.json())
      .then(data => setCharacters(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCharacters = characters.filter(char => {
    if (filter !== "all" && char.type !== filter) return false;
    if (search && !char.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const moostikCount = characters.filter(c => c.type === "moostik").length;
  const humanCount = characters.filter(c => c.type === "human").length;

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
          
          <div className="flex items-end justify-between">
            <div>
              <Badge className="bg-purple-900/50 text-purple-300 border-purple-700/50 mb-4">UNIVERS</Badge>
              <h1 className="text-4xl md:text-5xl font-black">
                <span className="text-blood-500">Personnages</span>
              </h1>
              <p className="text-zinc-500 mt-2">
                {characters.length} personnages • {moostikCount} Moostiks • {humanCount} Humains
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Rechercher un personnage..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800"
            />
          </div>
          
          <div className="flex gap-2">
            {[
              { id: "all", label: "Tous" },
              { id: "moostik", label: "🦟 Moostiks" },
              { id: "human", label: "👤 Humains" },
            ].map(f => (
              <Button
                key={f.id}
                variant={filter === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.id as any)}
                className={filter === f.id ? "bg-blood-700 hover:bg-blood-600" : "border-zinc-700 text-zinc-400"}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blood-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">Aucun personnage trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCharacters.map(char => (
              <Link key={char.id} href={`/series/characters/${char.id}`}>
                <Card className="bg-zinc-900/30 border-zinc-800 hover:border-blood-700/50 transition-all group overflow-hidden">
                  <div className="aspect-square relative">
                    {char.referenceImages?.[0] ? (
                      <img 
                        src={char.referenceImages[0]} 
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-6xl opacity-30">
                        {char.type === "moostik" ? "🦟" : "👤"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <Badge className={`absolute top-3 right-3 text-[10px] ${
                      char.type === "moostik" 
                        ? "bg-amber-900/80 text-amber-300 border-amber-700/50" 
                        : "bg-blue-900/80 text-blue-300 border-blue-700/50"
                    }`}>
                      {char.type === "moostik" ? "MOOSTIK" : "HUMAIN"}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-lg mb-1">{char.name}</h3>
                    {char.role && (
                      <p className="text-blood-400 text-xs mb-2">{char.role}</p>
                    )}
                    <p className="text-zinc-500 text-sm line-clamp-2">{char.description?.slice(0, 100)}...</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
