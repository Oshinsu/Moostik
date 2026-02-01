"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Character {
  id: string;
  name: string;
  type: "moostik" | "human";
  description: string;
  traits?: string[];
  visualDescription?: string;
  referenceImages?: string[];
  role?: string;
  backstory?: string;
}

export default function CharacterDetailPage() {
  const params = useParams();
  const characterId = params.id as string;
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!characterId) return;
    
    fetch("/api/characters")
      .then(r => r.json())
      .then(data => {
        setAllCharacters(data || []);
        const char = data?.find((c: Character) => c.id === characterId);
        setCharacter(char || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [characterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blood-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Personnage introuvable</p>
          <Link href="/series/characters">
            <Button variant="outline">Retour aux personnages</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedCharacters = allCharacters
    .filter(c => c.id !== character.id && c.type === character.type)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/series/characters" className="text-zinc-500 hover:text-white flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Personnages
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400">{character.name}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 mb-4">
              {character.referenceImages?.[activeImage] ? (
                <img 
                  src={character.referenceImages[activeImage]} 
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl opacity-20">
                  {character.type === "moostik" ? "🦟" : "👤"}
                </div>
              )}
            </div>
            
            {character.referenceImages && character.referenceImages.length > 1 && (
              <div className="flex gap-2">
                {character.referenceImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage ? "border-blood-500" : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <Badge className={`mb-4 ${
              character.type === "moostik" 
                ? "bg-amber-900/50 text-amber-300 border-amber-700/50" 
                : "bg-blue-900/50 text-blue-300 border-blue-700/50"
            }`}>
              {character.type === "moostik" ? "🦟 MOOSTIK" : "👤 HUMAIN"}
            </Badge>
            
            <h1 className="text-5xl font-black mb-2">
              <span className="text-blood-500">{character.name}</span>
            </h1>
            
            {character.role && (
              <p className="text-xl text-zinc-400 mb-6">{character.role}</p>
            )}

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-2">Description</h2>
                <p className="text-zinc-400 leading-relaxed">{character.description}</p>
              </div>

              {character.visualDescription && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-2">Apparence</h2>
                  <p className="text-zinc-400 leading-relaxed">{character.visualDescription}</p>
                </div>
              )}

              {character.backstory && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-2">Histoire</h2>
                  <p className="text-zinc-400 leading-relaxed">{character.backstory}</p>
                </div>
              )}

              {character.traits && character.traits.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-2">Traits</h2>
                  <div className="flex flex-wrap gap-2">
                    {character.traits.map((trait, i) => (
                      <Badge key={i} variant="outline" className="border-zinc-700 text-zinc-400">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Characters */}
        {relatedCharacters.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold mb-6">Autres {character.type === "moostik" ? "Moostiks" : "Humains"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedCharacters.map(char => (
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
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl opacity-30">
                          {char.type === "moostik" ? "🦟" : "👤"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-white">{char.name}</h3>
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
