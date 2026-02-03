"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PublicHeader } from "@/components/public";
import { HorizontalCarousel, CarouselItem, CharacterCard, LocationCard } from "@/components/shared/HorizontalCarousel";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

// ============================================================================
// TYPES
// ============================================================================

interface Character {
  id: string;
  name: string;
  type: "moostik" | "human";
  description: string;
  referenceImages?: string[];
}

interface Location {
  id: string;
  name: string;
  description: string;
  referenceImages?: string[];
}

interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
}

// ============================================================================
// SERIES LANDING PAGE
// ============================================================================

export default function SeriesLandingPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay video preview after 3 seconds (Netflix pattern)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Load data
  useEffect(() => {
    Promise.all([
      fetch("/api/characters").then(r => r.json()),
      fetch("/api/locations").then(r => r.json()),
      fetch("/api/episodes").then(r => r.json()),
    ]).then(([chars, locs, eps]) => {
      setCharacters(chars || []);
      setLocations(locs || []);
      setEpisodes(eps || []);
    }).catch(console.error);
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const moostikCharacters = characters.filter(c => c.type === "moostik");
  const humanCharacters = characters.filter(c => c.type === "human");

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white overflow-x-hidden">
      {/* Public Navigation */}
      <PublicHeader />

      {/* ================================================================ */}
      {/* HERO SECTION - Netflix Style with Video Autoplay */}
      {/* ================================================================ */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden -mt-16"
      >
        {/* Video Background (Netflix-style autoplay after 3s) */}
        {showVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000"
            style={{ opacity: showVideo ? 0.4 : 0 }}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.style.opacity = "0.4";
              }
            }}
          >
            {/* Add video source when available */}
            {/* <source src="/videos/moostik-trailer.mp4" type="video/mp4" /> */}
          </video>
        )}

        {/* Background Layers (Parallax) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-blood-900/30 via-[#0b0b0e] to-[#0b0b0e]"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />

        {/* Animated Blood Veins */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blood-600 via-blood-800 to-transparent animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          />
          <div
            className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blood-700 to-blood-900 animate-pulse"
            style={{ animationDelay: "0.5s", transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div
            className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-blood-700 via-transparent to-blood-800 animate-pulse"
            style={{ animationDelay: "1s", transform: `translateY(${scrollY * 0.15}px)` }}
          />
        </div>

        {/* Bottom gradient overlay for video */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-[#0b0b0e]/50 z-[1]" />

        {/* Hero Content */}
        <div
          className="relative z-20 text-center px-4 max-w-5xl mx-auto"
          style={{ transform: `translateY(${scrollY * -0.3}px)`, opacity: Math.max(0, 1 - scrollY / 500) }}
        >
          {/* Badge */}
          <Badge className="bg-blood-900/50 text-blood-300 border-blood-700/50 mb-6 text-sm">
            ÉPISODE 0 — GENÈSE
          </Badge>

          {/* Title */}
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase mb-4">
            <span className="block text-blood-500 moostik-text-glow">MOOSTIK</span>
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-zinc-300 font-light tracking-wide mb-8">
            &ldquo;Nous sommes les vrais vampires.&rdquo;
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/watch/t05">
              <Button size="lg" className="moostik-btn-blood text-white font-bold px-8 py-6 text-lg group">
                <span className="mr-2 group-hover:scale-110 transition-transform">▶</span>
                Regarder l&apos;Épisode 0
              </Button>
            </Link>
            <Link href="/library">
              <Button size="lg" variant="outline" className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20 px-8 py-6 text-lg">
                Explorer la galerie
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
          style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
        >
          <svg className="w-8 h-8 text-blood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SYNOPSIS - L'HISTOIRE COMPLÈTE */}
      {/* ================================================================ */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <Badge className="bg-blood-900/50 text-blood-300 border-blood-700/50 mb-6">L&apos;UNIVERS</Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            <span className="text-blood-500">Il était une fois...</span> dans l&apos;ombre
          </h2>

          {/* CHAPITRE 1: LE MONDE CACHÉ */}
          <div className="prose prose-invert prose-lg max-w-none mb-20">
            <p className="text-zinc-300 text-xl leading-relaxed mb-8 first-letter:text-6xl first-letter:font-black first-letter:text-blood-500 first-letter:float-left first-letter:mr-3">
              Il existe, dans les replis du monde que vous connaissez, des civilisations que vos yeux
              ne verront jamais. Des empires bâtis dans l&apos;épaisseur d&apos;un mur. Des cathédrales
              sculptées dans le creux d&apos;un pneu abandonné. Des dynasties entières qui naissent,
              règnent et s&apos;éteignent entre le lever et le coucher du soleil — à l&apos;échelle d&apos;une
              vie humaine, du moins.
            </p>

            <p className="text-zinc-400 leading-relaxed mb-6">
              Car pour ceux qui vivent dans l&apos;ombre de vos pas, le temps coule différemment.
              Une génération peut tenir dans une saison. Un siècle d&apos;histoire peut s&apos;écrire
              entre deux coups de balai. Et un génocide — un véritable génocide, avec ses héros,
              ses martyrs et ses survivants hantés — peut se jouer en quelques secondes de votre
              existence distraite.
            </p>

            <p className="text-zinc-400 leading-relaxed mb-6">
              Les humains appellent cela &ldquo;désinsectisation&rdquo;.
            </p>

            <p className="text-zinc-500 leading-relaxed mb-8">
              Les <span className="text-amber-400 font-semibold">Moostik</span> appellent cela
              &ldquo;l&apos;Apocalypse BYSS&rdquo;.
            </p>
          </div>

          {/* CHAPITRE 2: LES MOOSTIK */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-amber-900/30 flex items-center justify-center">
                <span className="text-3xl">🦟</span>
              </div>
              <div>
                <p className="text-amber-400 text-sm font-medium tracking-wider">CHAPITRE I</p>
                <h3 className="text-3xl font-black text-white">Les Enfants du Crépuscule</h3>
              </div>
            </div>

            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <p>
                Avant de vous raconter comment tout a basculé, laissez-moi vous parler de ceux
                qui ont tout perdu.
              </p>

              <p>
                Les Moostik ne sont pas ce que vous croyez. Oh, bien sûr, ils ont six pattes,
                des ailes translucides et cette trompe qui vous fait frissonner quand elle
                s&apos;approche de votre peau. Mais derrière ces yeux d&apos;ambre — ces grands yeux
                expressifs que vous n&apos;avez jamais pris le temps de regarder vraiment —
                se cache une intelligence millénaire.
              </p>

              <p>
                Ils ont des noms. <span className="text-pink-400">Mama Dorval</span>, qui berce
                son nouveau-né chaque soir en lui chantant des berceuses dans une langue que
                vos oreilles ne peuvent pas percevoir. <span className="text-amber-400">Koko</span>,
                le guerrier aux mille cicatrices, dont la trompe affûtée a percé plus d&apos;ennemis
                qu&apos;il ne peut en compter. <span className="text-purple-400">Mila</span>,
                la sage, gardienne des récits anciens, celle qui se souvient de tout — même
                de ce que les autres préfèrent oublier. Et <span className="text-blue-400">Trez</span>,
                le conteur, celui dont la voix résonne dans les nuits tranquilles du village
                pour captiver les plus jeunes avec des histoires de héros et de monstres.
              </p>

              <p>
                Ils ont une culture. Des fêtes où le nectar coule à flots. Des rituels de
                passage à l&apos;âge adulte. Des mariages célébrés sous la lumière des étoiles
                filtrée par les persiennes. Des funérailles où l&apos;on chante pour guider
                les âmes vers le Grand Essaim d&apos;où tout vient et où tout retourne.
              </p>

              <p>
                Ils ont des rêves. Des ambitions. Des amours impossibles. Des regrets qui
                rongent les nuits. Des espoirs fous murmurés à l&apos;aube.
              </p>

              <p className="text-zinc-300 font-medium">
                Ils ont tout ce qui fait de vous des êtres vivants.
              </p>

              <p className="text-zinc-500 italic">
                Et vous ne les avez jamais vus autrement que comme des nuisibles.
              </p>
            </div>
          </div>

          {/* CHAPITRE 3: LE VILLAGE COOLTIK */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-900/30 flex items-center justify-center">
                <span className="text-3xl">🏘️</span>
              </div>
              <div>
                <p className="text-emerald-400 text-sm font-medium tracking-wider">CHAPITRE II</p>
                <h3 className="text-3xl font-black text-white">Le Village entre les Murs</h3>
              </div>
            </div>

            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <p>
                Dans les entrailles d&apos;une vieille maison créole de Martinique — une de ces
                bâtisses aux volets colorés et aux persiennes fatiguées par des décennies
                de soleil tropical — prospérait le village de <span className="text-emerald-400 font-semibold">Cooltik</span>.
              </p>

              <p>
                Imaginez une cité entière nichée dans l&apos;épaisseur d&apos;un mur. Des ruelles
                pavées de poussière compactée. Des maisons sculptées dans des fibres de bois.
                Des ponts suspendus entre les lattes du parquet. Une place centrale où les
                anciens se réunissent chaque soir pour débattre des affaires du clan. Une
                nurserie où les œufs sont gardés précieusement, surveillés jour et nuit par
                des gardiennes dévouées.
              </p>

              <p>
                Le village Cooltik était un miracle d&apos;ingéniosité. Ses architectes avaient
                appris à utiliser chaque recoin, chaque fissure, chaque espace oublié par
                les géants qui vivaient au-dessus. Les conduits d&apos;aération devenaient des
                autoroutes. Les gouttes de condensation, des réservoirs d&apos;eau. La chaleur
                des ampoules électriques, un système de chauffage gratuit pendant les nuits
                plus fraîches.
              </p>

              <p>
                C&apos;était un monde complet. Autonome. Invisible.
              </p>

              <p>
                Un monde où Mama Dorval venait de donner naissance à son premier enfant —
                un petit mâle aux yeux déjà trop grands pour son visage, aux ailes encore
                froissées, qui regardait le monde avec une curiosité dévorante.
              </p>

              <p className="text-zinc-300">
                Elle ne savait pas encore que ce bébé serait le dernier à naître dans le
                village Cooltik.
              </p>

              <p className="text-zinc-500 italic">
                Elle ne savait pas que cette nuit serait la dernière nuit de paix.
              </p>
            </div>
          </div>

          {/* CHAPITRE 4: LES GÉANTS */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <p className="text-blue-400 text-sm font-medium tracking-wider">CHAPITRE III</p>
                <h3 className="text-3xl font-black text-white">Ceux d&apos;En Haut</h3>
              </div>
            </div>

            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <p>
                Pour comprendre ce qui s&apos;est passé cette nuit-là, il faut d&apos;abord comprendre
                comment les Moostik voient les humains.
              </p>

              <p>
                Vous n&apos;êtes pas des personnes pour eux. Vous êtes des <span className="text-blue-400 font-bold">titans</span>.
                Des montagnes de chair qui se déplacent avec une lenteur terrifiante. Chacun
                de vos pas fait trembler leur monde. Chacun de vos gestes peut effacer une
                vie — ou cent. Vos doigts sont des colonnes capables de réduire en poussière
                des bâtiments entiers. Votre souffle est un ouragan. Votre voix, un grondement
                de tonnerre.
              </p>

              <p>
                Les Moostik ont appris à vivre avec vous. À vous éviter. À se nourrir de vous
                sans jamais vous réveiller. À construire leurs vies dans les marges de la vôtre.
              </p>

              <p>
                Mais cette cohabitation silencieuse reposait sur un équilibre fragile.
                Un équilibre que l&apos;innocence d&apos;un enfant allait briser.
              </p>

              <p className="text-zinc-300">
                Un petit garçon de cinq ans. Des yeux curieux. Des mains qui explorent.
                Et dans ces mains, un cylindre rouge et noir trouvé sous l&apos;évier de la cuisine.
              </p>

              <p className="text-red-400 font-semibold text-lg">
                BYSS. Insecticide foudroyant. Efficacité garantie.
              </p>

              <p className="text-zinc-500 italic">
                L&apos;enfant ne savait pas lire. Il ne savait pas ce que signifiaient ces lettres.
                Il voulait juste voir ce qui se passerait s&apos;il appuyait sur le bouton.
              </p>
            </div>
          </div>

          {/* CHAPITRE 5: LA NUIT */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
                <span className="text-3xl">🔥</span>
              </div>
              <div>
                <p className="text-red-400 text-sm font-medium tracking-wider">CHAPITRE IV</p>
                <h3 className="text-3xl font-black text-white">Cette Nuit-Là</h3>
              </div>
            </div>

            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <p>
                Il y a des nuits qui changent tout. Des nuits après lesquelles plus rien
                n&apos;est jamais pareil. Des nuits qui divisent l&apos;histoire en deux parties
                irréconciliables : l&apos;avant et l&apos;après.
              </p>

              <p>
                Pour le peuple Moostik, cette nuit porte un nom.
              </p>

              <p className="text-red-500 font-black text-2xl text-center my-8">
                L&apos;APOCALYPSE BYSS
              </p>

              <p>
                Je ne vous raconterai pas les détails. Pas encore. Certaines horreurs méritent
                d&apos;être découvertes lentement, image par image, souffle par souffle. Certaines
                douleurs ne peuvent pas être résumées en quelques phrases.
              </p>

              <p>
                Ce que je peux vous dire, c&apos;est qu&apos;à l&apos;aube, le village Cooltik n&apos;existait plus.
              </p>

              <p>
                Ce que je peux vous dire, c&apos;est que des milliers de vies se sont éteintes
                en quelques minutes de votre temps — une éternité du leur.
              </p>

              <p>
                Ce que je peux vous dire, c&apos;est qu&apos;au milieu des cendres et du poison,
                quelques silhouettes ont émergé. Brisées. Traumatisées. Mais vivantes.
              </p>

              <p className="text-zinc-300 font-medium">
                Des survivants.
              </p>

              <p className="text-zinc-500 italic">
                Et parmi eux, un bébé aux yeux trop grands, serré contre le corps encore
                chaud de celle qui avait tout donné pour le sauver.
              </p>
            </div>
          </div>

          {/* CHAPITRE 6: LA RENAISSANCE */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-amber-900/30 flex items-center justify-center">
                <span className="text-3xl">🌅</span>
              </div>
              <div>
                <p className="text-amber-400 text-sm font-medium tracking-wider">CHAPITRE V</p>
                <h3 className="text-3xl font-black text-white">Ce Qui Renaît des Cendres</h3>
              </div>
            </div>

            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <p>
                On dit que ce qui ne nous tue pas nous rend plus forts. C&apos;est un mensonge
                que se racontent ceux qui n&apos;ont jamais vraiment souffert.
              </p>

              <p>
                La vérité, c&apos;est que ce qui ne nous tue pas nous transforme. Et la nature
                de cette transformation — lumière ou ténèbres, pardon ou vengeance — dépend
                de choix que nous ne savons pas toujours que nous faisons.
              </p>

              <p>
                Les survivants de l&apos;Apocalypse BYSS ont trouvé refuge dans un vieux pneu
                abandonné, quelque part dans la végétation qui bordait la maison. Un cercle
                de caoutchouc noir, puant l&apos;huile et la décomposition — mais solide. Sûr.
                Invisible aux yeux des géants.
              </p>

              <p>
                C&apos;est là, dans cette carcasse industrielle reconvertie en sanctuaire, que
                tout a recommencé. Les premiers deuils. Les premières larmes partagées.
                Les premiers serments murmurés dans l&apos;obscurité.
              </p>

              <p>
                C&apos;est là que le bébé orphelin a grandi, nourri par une communauté de
                survivants qui voyait en lui l&apos;avenir de leur peuple.
              </p>

              <p>
                C&apos;est là que ce bébé est devenu enfant. Que cet enfant est devenu adolescent.
                Que cet adolescent est devenu quelqu&apos;un d&apos;autre — quelqu&apos;un de plus dur,
                de plus froid, de plus déterminé que tout ce que le monde Moostik avait jamais connu.
              </p>

              <p className="text-zinc-300 font-medium">
                C&apos;est là qu&apos;est née la légende de celui qu&apos;on appellera un jour <span className="text-blood-400">Papy Tik</span>.
              </p>

              <p className="text-zinc-500 italic">
                Et c&apos;est là qu&apos;a été fondée la secte des <span className="text-blood-400 font-bold">Bloodwings</span> —
                ceux qui ont juré de ne jamais oublier, et de ne jamais pardonner.
              </p>
            </div>
          </div>

          {/* CHAPITRE 7: AUJOURD'HUI */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-blood-900/30 flex items-center justify-center">
                <span className="text-3xl">🍷</span>
              </div>
              <div>
                <p className="text-blood-400 text-sm font-medium tracking-wider">ÉPILOGUE</p>
                <h3 className="text-3xl font-black text-white">Vingt Ans Plus Tard</h3>
              </div>
            </div>

            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <p>
                Le pneu est devenu <span className="text-blood-400 font-bold">Tire City</span> —
                une métropole souterraine où vivent des milliers de Moostik, descendants
                des rescapés et des générations nées après le cataclysme.
              </p>

              <p>
                Il y a des forges où l&apos;on façonne des armes. Des académies où l&apos;on enseigne
                l&apos;art du combat. Des temples où l&apos;on honore les morts. Et au cœur de tout
                cela, le <span className="text-amber-400 font-bold">Bar Ti Sang</span> —
                un établissement aux lumières tamisées où le nectar coule et où les vétérans
                racontent les histoires d&apos;avant à ceux qui sont nés après.
              </p>

              <p>
                C&apos;est là que Papy Tik passe ses soirées, désormais. Assis dans l&apos;ombre,
                observant son peuple reconstruire ce qui a été détruit. Écoutant les rires
                d&apos;une jeunesse qui n&apos;a connu que les récits du génocide, jamais son horreur.
              </p>

              <p>
                Vingt ans de patience. Vingt ans de préparation. Vingt ans à forger une armée,
                à aiguiser des trompes, à distiller des venins, à tracer des plans.
              </p>

              <p className="text-zinc-300 font-medium text-lg">
                Et ce soir, pour la première fois depuis deux décennies, un sourire étrange
                se dessine sur le visage du patriarche.
              </p>

              <p className="text-zinc-300">
                Car ce soir, un messager est arrivé avec des nouvelles.
              </p>

              <p className="text-zinc-300">
                Ce soir, après vingt ans d&apos;attente...
              </p>

              <p className="text-blood-500 font-black text-3xl text-center my-8">
                La vengeance peut enfin commencer.
              </p>
            </div>
          </div>

          {/* INVITATION */}
          <div className="text-center py-12 border-t border-b border-zinc-800">
            <p className="text-zinc-500 text-lg mb-4">
              Ceci est le début de leur histoire.
            </p>
            <p className="text-zinc-400 text-xl mb-6">
              <span className="text-blood-400 font-semibold">MOOSTIK — Épisode 0</span> vous
              plongera dans la nuit qui a tout changé.
            </p>
            <p className="text-zinc-600 italic">
              Préparez-vous à voir le monde différemment.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="text-center">
              <p className="text-3xl font-black text-blood-500">5</p>
              <p className="text-zinc-500 text-sm">Parties</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blood-500">19</p>
              <p className="text-zinc-500 text-sm">Séquences</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blood-500">43</p>
              <p className="text-zinc-500 text-sm">Shots</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blood-500">~8</p>
              <p className="text-zinc-500 text-sm">Minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CHARACTERS CAROUSEL - Netflix Style */}
      {/* ================================================================ */}
      <section className="py-24 bg-gradient-to-b from-[#0b0b0e] via-blood-950/20 to-[#0b0b0e]">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-12 px-4">
            <Badge className="bg-purple-900/50 text-purple-300 border-purple-700/50 mb-4">PERSONNAGES</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Les <span className="text-blood-500">héros</span> de l&apos;ombre
            </h2>
          </div>

          <ErrorBoundary>
            {/* Moostik Characters - Horizontal Carousel */}
            <div className="mb-12">
              <HorizontalCarousel
                title="🦟 Les Moostiks"
                subtitle="Le peuple de l'ombre"
                gap="md"
              >
                {moostikCharacters.map((char) => (
                  <CarouselItem key={char.id} width="md" aspectRatio="portrait">
                    <Link href={`/series/characters/${char.id}`}>
                      <CharacterCard
                        name={char.name}
                        role={char.description?.slice(0, 40)}
                        imageUrl={char.referenceImages?.[0]}
                        color="amber"
                      />
                    </Link>
                  </CarouselItem>
                ))}
                {/* Placeholder if empty */}
                {moostikCharacters.length === 0 && (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <CarouselItem key={i} width="md" aspectRatio="portrait">
                        <div className="w-full h-full bg-zinc-900/50 rounded-xl animate-pulse" />
                      </CarouselItem>
                    ))}
                  </>
                )}
              </HorizontalCarousel>
            </div>

            {/* Human Characters - Horizontal Carousel */}
            <div className="mb-8">
              <HorizontalCarousel
                title="👤 Les Humains"
                subtitle="Ceux d'en haut"
                gap="md"
              >
                {humanCharacters.map((char) => (
                  <CarouselItem key={char.id} width="md" aspectRatio="portrait">
                    <Link href={`/series/characters/${char.id}`}>
                      <CharacterCard
                        name={char.name}
                        role={char.description?.slice(0, 40)}
                        imageUrl={char.referenceImages?.[0]}
                        color="blue"
                      />
                    </Link>
                  </CarouselItem>
                ))}
                {/* Placeholder if empty */}
                {humanCharacters.length === 0 && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <CarouselItem key={i} width="md" aspectRatio="portrait">
                        <div className="w-full h-full bg-zinc-900/50 rounded-xl animate-pulse" />
                      </CarouselItem>
                    ))}
                  </>
                )}
              </HorizontalCarousel>
            </div>
          </ErrorBoundary>

          <div className="text-center mt-10 px-4">
            <Link href="/series/characters">
              <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                Voir tous les personnages →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* LOCATIONS SECTION - Netflix Style */}
      {/* ================================================================ */}
      <section className="py-24">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-12 px-4">
            <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700/50 mb-4">LIEUX</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Le <span className="text-emerald-500">monde</span> Moostik
            </h2>
          </div>

          <ErrorBoundary>
            <HorizontalCarousel
              title="📍 Explorez l'univers"
              subtitle="Des murs de Cooltik aux ruelles de Tire City"
              gap="lg"
            >
              {locations.map((loc) => (
                <CarouselItem key={loc.id} width="lg" aspectRatio="video">
                  <Link href={`/series/locations/${loc.id}`}>
                    <LocationCard
                      name={loc.name}
                      description={loc.description}
                      imageUrl={loc.referenceImages?.[0]}
                    />
                  </Link>
                </CarouselItem>
              ))}
              {/* Placeholder if empty */}
              {locations.length === 0 && (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <CarouselItem key={i} width="lg" aspectRatio="video">
                      <div className="w-full h-full bg-zinc-900/50 rounded-xl animate-pulse" />
                    </CarouselItem>
                  ))}
                </>
              )}
            </HorizontalCarousel>
          </ErrorBoundary>

          <div className="text-center mt-10 px-4">
            <Link href="/series/locations">
              <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                Explorer tous les lieux →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* EPISODES SECTION */}
      {/* ================================================================ */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] via-zinc-950 to-[#0b0b0e]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-blood-900/50 text-blood-300 border-blood-700/50 mb-4">ÉPISODES</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              La <span className="text-blood-500">saga</span>
            </h2>
          </div>

          <div className="space-y-4">
            {episodes.map((ep) => (
              <Link key={ep.id} href={`/series/${ep.id}`}>
                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-blood-700/50 transition-all p-6 flex items-center gap-6 group">
                  <div className="w-20 h-20 rounded-xl bg-blood-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blood-900/50 transition-colors">
                    <span className="text-3xl font-black text-blood-400">
                      {ep.number.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1">{ep.title}</h3>
                    <p className="text-zinc-500 text-sm line-clamp-2">{ep.description}</p>
                  </div>
                  <svg className="w-6 h-6 text-blood-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CTA SECTION */}
      {/* ================================================================ */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blood-900/20 via-transparent to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="text-blood-500">Plonge</span> dans l&apos;univers
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Explore les personnages, les lieux, le lore complet.
            Ou regarde l&apos;épisode 0 maintenant.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/watch/t05">
              <Button size="lg" className="moostik-btn-blood text-white font-bold px-10 py-6 text-lg group">
                <span className="mr-2">▶</span>
                Regarder l&apos;Épisode 0
              </Button>
            </Link>
            <Link href="/series/lore">
              <Button size="lg" variant="outline" className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20 px-10 py-6 text-lg">
                Explorer le lore
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="py-12 px-4 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-blood-500 font-bold text-xl">MOOSTIK</p>
            <p className="text-zinc-600 text-sm">© 2026 Bloodwings Studio. All rights reserved.</p>
          </div>
          
          <nav className="flex gap-6">
            <Link href="/series/characters" className="text-zinc-500 hover:text-white text-sm">Personnages</Link>
            <Link href="/series/locations" className="text-zinc-500 hover:text-white text-sm">Lieux</Link>
            <Link href="/series/lore" className="text-zinc-500 hover:text-white text-sm">Lore</Link>
            <Link href="/promo" className="text-zinc-500 hover:text-white text-sm">Press Kit</Link>
          </nav>
          
          <p className="text-zinc-700 text-xs italic">"We are the real vampires."</p>
        </div>
      </footer>
    </div>
  );
}
