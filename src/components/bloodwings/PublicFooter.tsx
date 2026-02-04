"use client";

import Link from "next/link";
import { BloodwingsLogo } from "./BloodwingsLogo";
import { ROUTES } from "@/types/bloodwings";
import {
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  MapPin,
  Building2,
} from "lucide-react";

// ============================================================================
// FOOTER LINKS
// ============================================================================

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const FOOTER_LINKS: Record<string, FooterSection> = {
  product: {
    title: "Infrastructure",
    links: [
      { label: "Studio", href: ROUTES.studio },
      { label: "Tarifs", href: ROUTES.pricing },
      { label: "Éditeur", href: ROUTES.editor },
      { label: "Génération Vidéo", href: ROUTES.video },
      { label: "Cinéma IA", href: ROUTES.cinema },
      { label: "Systèmes d'émergence", href: ROUTES.emergentAi },
      { label: "Tarification", href: ROUTES.pricing },
      { label: "Documentation", href: "/docs" },
    ],
  },
  series: {
    title: "Corpus MOOSTIK",
    links: [
      { label: "Regarder", href: ROUTES.series },
      { label: "Personnages", href: ROUTES.seriesCharacters },
      { label: "Territoires", href: ROUTES.seriesLocations },
      { label: "L'Univers", href: ROUTES.seriesLore },
      { label: "Chronologie", href: ROUTES.seriesTimeline },
      { label: "Visionner", href: ROUTES.series },
      { label: "Personnages", href: ROUTES.seriesCharacters },
      { label: "Lieux", href: ROUTES.seriesLocations },
      { label: "Lore", href: ROUTES.seriesLore },
    ],
  },
  community: {
    title: "Communauté",
    links: [
      { label: "Galerie", href: ROUTES.communityGallery },
      { label: "Soumettre", href: ROUTES.communitySubmit },
      { label: "Avatar", href: ROUTES.communityAvatar },
    ],
  },
  legal: {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: ROUTES.legal },
      { label: "Confidentialité", href: ROUTES.privacy },
      { label: "CGU", href: ROUTES.terms },
      { label: "Cookies", href: ROUTES.cookies },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Contact", href: ROUTES.contact },
      { label: "IA Émergente", href: ROUTES.emergentAi },
      { label: "Status", href: "https://status.bloodwings.studio", external: true },
      { label: "Contact", href: "/contact" },
    ],
  },
};

const SOCIAL_LINKS = [
  { icon: Twitter, href: "https://twitter.com/bloodwingsstudio", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/bloodwingsstudio", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com/@bloodwingsstudio", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com/company/bloodwings-studio", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/bloodwings-studio", label: "GitHub" },
];

// ============================================================================
// FOOTER COMPONENT
// ============================================================================

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#08080a] border-t border-blood-900/20">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <BloodwingsLogo size="sm" />
            </Link>
            <p className="text-sm text-zinc-500 mb-4 max-w-xs">
              Infrastructure de production narrative émergente.
              Morphogenèse computationnelle autonome.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-blood-400 hover:bg-blood-900/30 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-500 hover:text-blood-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-500 hover:text-blood-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Company Info */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-3 h-3" />
                <span>© {currentYear} Bloodwings Studio</span>
              </div>
              <div className="hidden md:block w-px h-3 bg-zinc-800" />
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Fort-de-France, Martinique</span>
              </div>
            </div>

            {/* Powered By */}
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span>Powered by</span>
              <a
                href="https://byss.group"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blood-500 hover:text-blood-400 font-medium"
              >
                Byss Group
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
