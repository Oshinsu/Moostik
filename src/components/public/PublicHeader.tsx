"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Users,
  MapPin,
  Book,
  Film,
  Menu,
  X,
  Clapperboard,
} from "lucide-react";

// ============================================================================
// PUBLIC HEADER - Navigation pour les pages spectateur
// ============================================================================

const NAV_ITEMS = [
  { href: "/series", label: "Accueil", icon: Film },
  { href: "/watch/ep0", label: "Regarder", icon: Play, highlight: true },
  { href: "/series/characters", label: "Personnages", icon: Users },
  { href: "/series/locations", label: "Lieux", icon: MapPin },
  { href: "/series/lore", label: "Lore", icon: Book },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if current path matches
  const isActive = (href: string) => {
    if (href === "/series") return pathname === "/series";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0b0b0e]/95 backdrop-blur-lg border-b border-blood-900/30 shadow-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/series" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blood-600 to-blood-800 flex items-center justify-center shadow-lg group-hover:shadow-blood-500/30 transition-shadow">
                <span className="text-xl">🩸</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-blood-500 font-black text-xl tracking-tight">MOOSTIK</span>
                <span className="text-zinc-600 text-xs block -mt-1">Rise of Bloodwings</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`
                      transition-all
                      ${item.highlight
                        ? "bg-blood-600 hover:bg-blood-500 text-white"
                        : isActive(item.href)
                        ? "bg-blood-900/30 text-blood-400"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Studio Access */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800/50 hover:border-zinc-600"
                >
                  <Clapperboard className="w-4 h-4 mr-2" />
                  Studio
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-[#0b0b0e] border-b border-blood-900/30 p-4 shadow-2xl">
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`
                      w-full justify-start
                      ${item.highlight
                        ? "bg-blood-600 hover:bg-blood-500 text-white"
                        : isActive(item.href)
                        ? "bg-blood-900/30 text-blood-400"
                        : "text-zinc-400 hover:text-white"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              ))}

              <div className="border-t border-zinc-800 my-2" />

              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-700 text-zinc-400"
                >
                  <Clapperboard className="w-5 h-5 mr-3" />
                  Accéder au Studio
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
