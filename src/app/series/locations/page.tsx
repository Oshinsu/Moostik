"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  referenceImages?: string[];
}

export default function SeriesLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/locations")
      .then(r => r.json())
      .then(data => setLocations(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredLocations = locations.filter(loc => {
    if (search && !loc.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by type
  const locationsByType = filteredLocations.reduce((acc, loc) => {
    const type = loc.type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(loc);
    return acc;
  }, {} as Record<string, Location[]>);

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
              <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700/50 mb-4">UNIVERS</Badge>
              <h1 className="text-4xl md:text-5xl font-black">
                <span className="text-emerald-500">Lieux</span>
              </h1>
              <p className="text-zinc-500 mt-2">
                {locations.length} lieux à explorer
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Rechercher un lieu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">Aucun lieu trouvé</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(locationsByType).map(([type, locs]) => (
              <section key={type}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-emerald-400 capitalize">{type}</span>
                  <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">{locs.length}</Badge>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locs.map(loc => (
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
                            <Badge className="bg-emerald-900/80 text-emerald-300 border-emerald-700/50 mb-2 text-[9px]">
                              {loc.type}
                            </Badge>
                            <h3 className="text-xl font-bold text-white mb-1">{loc.name}</h3>
                            <p className="text-zinc-400 text-sm line-clamp-2">{loc.description}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
