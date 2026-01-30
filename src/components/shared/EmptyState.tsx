"use client";

interface EmptyStateProps {
  icon?: string;
  message?: string;
  description?: string;
}

export function EmptyState({ 
  icon = "📭", 
  message = "Aucun élément trouvé",
  description
}: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4 opacity-30">{icon}</div>
      <p className="text-zinc-400 font-medium">{message}</p>
      {description && (
        <p className="text-zinc-600 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}
