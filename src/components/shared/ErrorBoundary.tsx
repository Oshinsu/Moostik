"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================================
// ERROR BOUNDARY - Catches and displays errors gracefully
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Une erreur est survenue
          </h3>
          <p className="text-zinc-400 mb-4 max-w-md">
            {this.state.error?.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
          </p>
          <Button
            onClick={this.handleRetry}
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// SECTION ERROR BOUNDARY - Compact version for sections
// ============================================================================

interface SectionErrorFallbackProps {
  title?: string;
  onRetry?: () => void;
}

export function SectionErrorFallback({ title, onRetry }: SectionErrorFallbackProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-red-900/30">
      <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">
          {title || "Erreur de chargement"}
        </p>
        <p className="text-xs text-zinc-500">
          Cette section n&apos;a pas pu être chargée
        </p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="ghost"
          className="text-zinc-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// ASYNC BOUNDARY - Wrapper for async components with loading/error states
// ============================================================================

interface AsyncBoundaryProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  onRetry?: () => void;
}

export function AsyncBoundary({
  children,
  isLoading,
  error,
  loadingFallback,
  errorFallback,
  onRetry,
}: AsyncBoundaryProps) {
  if (isLoading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )
    );
  }

  if (error) {
    return (
      errorFallback || (
        <SectionErrorFallback
          title={error.message}
          onRetry={onRetry}
        />
      )
    );
  }

  return <>{children}</>;
}
