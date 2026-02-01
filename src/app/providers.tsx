"use client";

import { MoostikProvider } from "@/contexts/MoostikContext";
import { AuthProvider } from "@/lib/auth";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <MoostikProvider>
        {children}
      </MoostikProvider>
    </AuthProvider>
  );
}
