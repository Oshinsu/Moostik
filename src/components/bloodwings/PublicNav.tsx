"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BloodwingsLogo } from "./BloodwingsLogo";
import { ROUTES } from "@/types/bloodwings";
import {
  Menu,
  X,
  Play,
  Users,
  Sparkles,
  CreditCard,
  MessageSquare,
  LogIn,
  Brain,
  Network,
} from "lucide-react";

const NAV_ITEMS = [
  { href: ROUTES.moostik, label: "La Série", icon: Play },
  { href: ROUTES.studio, label: "Le Studio", icon: Sparkles },
  { href: "/emergent-ai", label: "Emergent AI", icon: Brain, badge: "NEW" },
  { href: ROUTES.pricing, label: "Tarifs", icon: CreditCard },
  { href: ROUTES.community, label: "Communauté", icon: MessageSquare },
];

export function PublicNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0b0e]/90 backdrop-blur-xl border-b border-blood-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <BloodwingsLogo size="md" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    isActive
                      ? "bg-blood-900/30 text-blood-400"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                    item.badge && "bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-800/30"
                  )}
                >
                  {item.label}
                  {item.badge && (
                    <Badge className="bg-purple-900/50 text-purple-400 border-0 text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href={ROUTES.login}>
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                <LogIn className="w-4 h-4 mr-2" />
                Connexion
              </Button>
            </Link>
            <Link href={ROUTES.signup}>
              <Button className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 text-white font-semibold">
                Commencer
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-zinc-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0b0b0e] border-t border-blood-900/20">
          <div className="px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-blood-900/30 text-blood-400"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <Link href={ROUTES.login} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-zinc-700">
                  Connexion
                </Button>
              </Link>
              <Link href={ROUTES.signup} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blood-600 to-crimson-600">
                  Commencer gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
