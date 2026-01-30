"use client";

import { Badge } from "@/components/ui/badge";
import type { Character } from "@/types";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  const hasImages = character.referenceImages && character.referenceImages.length > 0;
  
  const roleColors = {
    protagonist: "bg-blood-900/60 text-blood-300 border-blood-700/50",
    antagonist: "bg-amber-900/60 text-amber-300 border-amber-700/50",
    supporting: "bg-purple-900/60 text-purple-300 border-purple-700/50",
    background: "bg-zinc-900/60 text-zinc-300 border-zinc-700/50"
  };
  
  const roleLabels = {
    protagonist: "Protagoniste",
    antagonist: "Antagoniste",
    supporting: "Second rôle",
    background: "Figurant"
  };
  
  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border border-blood-900/30 hover:border-blood-600/50 moostik-card-hover"
    >
      {/* Image */}
      <div className="aspect-square relative bg-[#14131a]">
        {hasImages ? (
          <img
            src={character.referenceImages[0]}
            alt={character.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-20">
              {character.type === "moostik" ? "🦟" : "👤"}
            </span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-transparent" />
        
        {/* Role badge */}
        <Badge className={`absolute top-3 right-3 ${roleColors[character.role]}`}>
          {roleLabels[character.role]}
        </Badge>
        
        {/* Type indicator */}
        <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-blood-900/60 flex items-center justify-center">
          {character.type === "moostik" ? "🦟" : "👤"}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 bg-gradient-to-b from-blood-950/30 to-[#14131a]">
        <h3 className="font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">
          {character.name}
        </h3>
        
        {character.title && (
          <p className="text-xs text-crimson-400 mb-2 italic">
            {character.title}
          </p>
        )}
        
        <p className="text-xs text-zinc-500 line-clamp-2">
          {character.description}
        </p>
        
        {/* Personality traits */}
        <div className="flex flex-wrap gap-1 mt-3">
          {character.personality.slice(0, 3).map((trait, i) => (
            <Badge 
              key={i} 
              variant="outline" 
              className="text-[10px] border-blood-900/30 text-blood-400/60"
            >
              {trait}
            </Badge>
          ))}
          {character.personality.length > 3 && (
            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-600">
              +{character.personality.length - 3}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 ring-1 ring-blood-500/30" />
    </div>
  );
}
