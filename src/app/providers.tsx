"use client";

import { MoostikProvider } from "@/contexts/MoostikContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MoostikProvider>
      {children}
    </MoostikProvider>
  );
}
