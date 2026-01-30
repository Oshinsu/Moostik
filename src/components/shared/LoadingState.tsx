"use client";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Chargement en cours..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-2 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
      <p className="text-zinc-500 text-sm">{message}</p>
    </div>
  );
}
