"use client";

import { ShotCard } from "./ShotCard";
import type { Shot } from "@/types/moostik";

interface GalleryProps {
  shots: Shot[];
  onEdit: (shot: Shot) => void;
  onGenerateAll: (shot: Shot) => void;
  onDelete: (shot: Shot) => void;
  onDuplicate: (shot: Shot) => void;
  onViewDetails: (shot: Shot) => void;
  isGenerating?: boolean;
}

export function Gallery({
  shots,
  onEdit,
  onGenerateAll,
  onDelete,
  onDuplicate,
  onViewDetails,
  isGenerating,
}: GalleryProps) {
  if (shots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-lg">Aucun shot dans cet épisode</p>
        <p className="text-sm">Ajoute ton premier shot pour commencer</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {shots.map((shot) => (
        <ShotCard
          key={shot.id}
          shot={shot}
          onEdit={onEdit}
          onGenerateAll={onGenerateAll}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onViewDetails={onViewDetails}
          isGenerating={isGenerating}
        />
      ))}
    </div>
  );
}
