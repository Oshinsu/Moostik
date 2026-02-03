"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Film, MapPin, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

// ============================================================================
// GLOBAL SEARCH - Netflix-style search with live results
// ============================================================================

interface SearchResult {
  id: string;
  type: "character" | "location" | "episode" | "shot";
  title: string;
  subtitle?: string;
  imageUrl?: string;
  url: string;
}

interface GlobalSearchProps {
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show the search as an icon button that expands */
  expandable?: boolean;
  /** ClassName for container */
  className?: string;
  /** Callback when a result is selected */
  onSelect?: (result: SearchResult) => void;
}

export function GlobalSearch({
  placeholder = "Rechercher...",
  expandable = false,
  className,
  onSelect,
}: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(!expandable);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Parallel fetch from multiple endpoints
      const [characters, locations, episodes] = await Promise.all([
        fetch(`/api/characters?search=${encodeURIComponent(searchQuery)}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/locations?search=${encodeURIComponent(searchQuery)}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/episodes?search=${encodeURIComponent(searchQuery)}`).then(r => r.ok ? r.json() : []),
      ]);

      const searchResults: SearchResult[] = [
        // Characters
        ...(Array.isArray(characters) ? characters : []).slice(0, 3).map((c: { id: string; name: string; description?: string; referenceImages?: string[] }) => ({
          id: c.id,
          type: "character" as const,
          title: c.name,
          subtitle: c.description?.slice(0, 50),
          imageUrl: c.referenceImages?.[0],
          url: `/series/characters/${c.id}`,
        })),
        // Locations
        ...(Array.isArray(locations) ? locations : []).slice(0, 3).map((l: { id: string; name: string; description?: string; referenceImages?: string[] }) => ({
          id: l.id,
          type: "location" as const,
          title: l.name,
          subtitle: l.description?.slice(0, 50),
          imageUrl: l.referenceImages?.[0],
          url: `/series/locations/${l.id}`,
        })),
        // Episodes
        ...(Array.isArray(episodes) ? episodes : []).slice(0, 2).map((e: { id: string; title: string; number?: number; description?: string }) => ({
          id: e.id,
          type: "episode" as const,
          title: e.title,
          subtitle: e.number ? `Épisode ${e.number}` : e.description?.slice(0, 50),
          url: `/series/${e.id}`,
        })),
      ];

      setResults(searchResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search on debounced query change
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    onSelect?.(result);
    router.push(result.url);
    setQuery("");
    setResults([]);
    setIsOpen(expandable ? false : true);
    inputRef.current?.blur();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setQuery("");
        setResults([]);
        if (expandable) setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        if (expandable && !query) setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandable, query]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const showResults = isFocused && (results.length > 0 || isLoading);

  // Icon for result type
  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "character":
        return <User className="w-4 h-4 text-purple-400" />;
      case "location":
        return <MapPin className="w-4 h-4 text-emerald-400" />;
      case "episode":
        return <Film className="w-4 h-4 text-blood-400" />;
      default:
        return <Search className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Expandable button (when closed) */}
      {expandable && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      )}

      {/* Search input */}
      {isOpen && (
        <div
          className={cn(
            "relative flex items-center",
            "bg-zinc-900/90 backdrop-blur-sm",
            "border rounded-xl transition-all duration-200",
            isFocused ? "border-blood-500/50 ring-1 ring-blood-500/20" : "border-zinc-700/50",
            expandable ? "w-64" : "w-full"
          )}
        >
          <Search className="w-4 h-4 text-zinc-500 ml-3 flex-shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent py-2 px-3 text-sm text-white",
              "placeholder:text-zinc-500 focus:outline-none"
            )}
          />

          {/* Loading indicator */}
          {isLoading && (
            <Loader2 className="w-4 h-4 text-zinc-500 mr-2 animate-spin" />
          )}

          {/* Clear button */}
          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 mr-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Close button (expandable mode) */}
          {expandable && (
            <button
              onClick={() => {
                setIsOpen(false);
                setQuery("");
                setResults([]);
              }}
              className="p-1 mr-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Results dropdown */}
      {showResults && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-2 z-50",
            "bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-xl",
            "shadow-xl shadow-black/50 overflow-hidden"
          )}
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-5 h-5 text-blood-500 mx-auto animate-spin" />
              <p className="text-xs text-zinc-500 mt-2">Recherche...</p>
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((result, index) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "w-full px-3 py-2 flex items-center gap-3 text-left",
                      "transition-colors",
                      selectedIndex === index
                        ? "bg-blood-900/30"
                        : "hover:bg-zinc-800/50"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getTypeIcon(result.type)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-zinc-500 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Type badge */}
                    <span className="text-xs text-zinc-600 capitalize flex-shrink-0">
                      {result.type === "character" && "Personnage"}
                      {result.type === "location" && "Lieu"}
                      {result.type === "episode" && "Épisode"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() && !isLoading ? (
            <div className="p-4 text-center">
              <p className="text-sm text-zinc-500">
                Aucun résultat pour &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : null}

          {/* Keyboard hints */}
          {results.length > 0 && (
            <div className="px-3 py-2 border-t border-zinc-800 flex items-center gap-4 text-xs text-zinc-600">
              <span>↑↓ naviguer</span>
              <span>↵ sélectionner</span>
              <span>esc fermer</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SEARCH TRIGGER BUTTON - Compact button that opens a modal search
// ============================================================================

interface SearchTriggerProps {
  className?: string;
}

export function SearchTrigger({ className }: SearchTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg",
          "bg-zinc-800/50 border border-zinc-700/50",
          "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
          "transition-colors text-sm",
          className
        )}
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Rechercher</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-700/50 text-xs text-zinc-500">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="w-full max-w-xl">
            <GlobalSearch
              placeholder="Rechercher personnages, lieux, épisodes..."
              onSelect={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
