"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  atmosphereDescription?: string;
  architectureDescription?: string;
  referenceImages?: string[];
}

export default function LocationDetailPage() {
  const params = useParams();
  const locationId = params.id as string;
  
  const [location, setLocation] = useState<Location | null>(null);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!locationId) return;
    
    fetch("/api/locations")
      .then(r => r.json())
      .then(data => {
        setAllLocations(data || []);
        const loc = data?.find((l: Location) => l.id === locationId);
        setLocation(loc || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Lieu introuvable</p>
          <Link href="/series/locations">
            <Button variant="outline">Retour aux lieux</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedLocations = allLocations
    .filter(l => l.id !== location.id && l.type === location.type)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        {location.referenceImages?.[activeImage] ? (
          <img 
            src={location.referenceImages[activeImage]} 
            alt={location.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/30 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/50 to-transparent" />
        
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 p-6">
          <Link href="/series/locations" className="text-zinc-400 hover:text-white flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Lieux
          </Link>
        </nav>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <Badge className="bg-emerald-900/80 text-emerald-300 border-emerald-700/50 mb-4">
            {location.type}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black">
            <span className="text-emerald-500">{location.name}</span>
          </h1>
        </div>
      </div>

      {/* Thumbnails */}
      {location.referenceImages && location.referenceImages.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="flex gap-2 overflow-x-auto pb-4">
            {location.referenceImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-24 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                  i === activeImage ? "border-emerald-500" : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
            <p className="text-zinc-400 leading-relaxed text-lg">{location.description}</p>
          </div>

          {location.atmosphereDescription && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Atmosphère</h2>
              <p className="text-zinc-400 leading-relaxed">{location.atmosphereDescription}</p>
            </div>
          )}

          {location.architectureDescription && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Architecture</h2>
              <p className="text-zinc-400 leading-relaxed">{location.architectureDescription}</p>
            </div>
          )}
        </div>

        {/* Related Locations */}
        {relatedLocations.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold mb-6">Lieux similaires</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedLocations.map(loc => (
                <Link key={loc.id} href={`/series/locations/${loc.id}`}>
                  <Card className="bg-zinc-900/30 border-zinc-800 hover:border-emerald-700/50 transition-all group overflow-hidden h-48">
                    <div className="relative h-full">
                      {loc.referenceImages?.[0] ? (
                        <img 
                          src={loc.referenceImages[0]} 
                          alt={loc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl opacity-30">📍</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white">{loc.name}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
