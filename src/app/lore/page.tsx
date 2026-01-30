"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/Sidebar";
import type { Episode } from "@/types/moostik";
import { MOOSTIK_INVARIANTS, MOOSTIK_NEGATIVE_PROMPT, CAMERA_ANGLES } from "@/types/moostik";

export default function LorePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const fetchEpisodes = useCallback(async () => {
    try {
      const res = await fetch("/api/episodes");
      const data = await res.json();
      setEpisodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch episodes:", error);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      <Sidebar episodes={episodes} onCreateEpisode={() => {}} />

      <main className="flex-1 overflow-auto">
        {/* Header - MOOSTIK Bloodwings Style */}
        <header className="sticky top-0 z-40 relative border-b border-blood-900/30 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blood-900/20 via-[#0b0b0e] to-crimson-900/10" />

          {/* Animated blood veins */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blood-700/50 via-crimson-600/30 to-transparent animate-pulse" />
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blood-600/30 to-crimson-700/50 animate-pulse" style={{ animationDelay: '0.7s' }} />
            <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-blood-600/40 via-transparent to-crimson-600/30 animate-pulse" style={{ animationDelay: '1.2s' }} />
          </div>

          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blood-500 animate-pulse" />
                  <span className="text-xs text-blood-400 uppercase tracking-widest font-medium">Grimoire Sacré</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-blood-400 via-crimson-500 to-blood-500 bg-clip-text text-transparent">
                    Bible Moostik
                  </span>
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Guide de style, lore et règles de l&apos;univers
                </p>
              </div>
              <Badge className="bg-blood-900/50 text-blood-200 border border-blood-700/30">
                Version 1.0
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <ScrollArea className="flex-1" style={{ height: "calc(100vh - 80px)" }}>
          <div className="p-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-[#14131a] border border-blood-900/30 flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blood-900/50 data-[state=active]:text-blood-200">
                  Vue d&apos;ensemble
                </TabsTrigger>
                <TabsTrigger value="style" className="data-[state=active]:bg-blood-900/50 data-[state=active]:text-blood-200">
                  Guide de Style
                </TabsTrigger>
                <TabsTrigger value="moostik" className="data-[state=active]:bg-blood-900/50 data-[state=active]:text-blood-200">
                  Les Moostik
                </TabsTrigger>
                <TabsTrigger value="humans" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-200">
                  Les Humains
                </TabsTrigger>
                <TabsTrigger value="world" className="data-[state=active]:bg-crimson-900/50 data-[state=active]:text-crimson-200">
                  Le Monde
                </TabsTrigger>
                <TabsTrigger value="technical" className="data-[state=active]:bg-blood-900/50 data-[state=active]:text-blood-200">
                  Technique
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle className="text-blood-400">MOOSTIK - Présentation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-zinc-300">
                      <strong>MOOSTIK</strong> est une série d&apos;animation 3D dark-Pixar se déroulant en Martinique. 
                      Elle raconte l&apos;histoire d&apos;une civilisation microscopique de moustiques anthropomorphes 
                      qui survit à un génocide perpétré par un enfant humain, et prépare sa vengeance.
                    </p>
                    
                    <Separator className="bg-blood-900/30" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-2">Références visuelles</h4>
                        <ul className="text-sm text-zinc-300 space-y-1">
                          <li>• Pixar (style 3D, expressivité)</li>
                          <li>• ILM (VFX, volumétriques)</li>
                          <li>• Attack on Titan (échelle, tension)</li>
                          <li>• Toy Story / Sid (cruauté innocente)</li>
                          <li>• Terminator (poursuite implacable)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-2">Références culturelles</h4>
                        <ul className="text-sm text-zinc-300 space-y-1">
                          <li>• Martinique / Fort-de-France</li>
                          <li>• Architecture créole</li>
                          <li>• Textiles madras</li>
                          <li>• Musique shatta / dancehall</li>
                          <li>• Atmosphère tropicale caribéenne</li>
                        </ul>
                      </div>
                    </div>
                    
                    <Separator className="bg-blood-900/30" />
                    
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Thèmes centraux</h4>
                      <div className="flex flex-wrap gap-2">
                        {["Génocide", "Survie", "Vengeance", "Famille", "Sacrifice", "Reconstruction", "Identité", "Échelle"].map(theme => (
                          <Badge key={theme} variant="outline" className="border-blood-800 text-blood-400">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle>Synopsis EP0 - Le Génocide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-zinc-300">
                    <p>
                      Dans les fibres d&apos;un rideau martiniquais, la civilisation Moostik prospère - 
                      une société microscopique de moustiques anthropomorphes avec leur propre architecture, 
                      culture et traditions.
                    </p>
                    <p>
                      Un soir, un enfant antillais de 5 ans décide de « jouer » avec un aérosol BYSS. 
                      Pour lui, c&apos;est un jeu. Pour les Moostik, c&apos;est l&apos;apocalypse.
                    </p>
                    <p>
                      Le spray déferle comme un mur de feu, transformant les citoyens en taches d&apos;encre. 
                      Les mains de l&apos;enfant chassent les survivants comme un Terminator, bondissant 
                      de surface en surface.
                    </p>
                    <p>
                      Un bébé survit, protégé par le sacrifice de sa mère. Ce bébé deviendra le 
                      Papy Moostik - le patriarche qui reconstruira son peuple et préparera la revanche.
                    </p>
                    <p>
                      Années plus tard : entraînement militaire, étude des faiblesses humaines, 
                      et dans le bar Ti Sang, la déclaration de guerre.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Style Guide Tab */}
              <TabsContent value="style" className="space-y-6">
                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle className="text-blood-400">Invariants de Style</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {MOOSTIK_INVARIANTS.map((invariant, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="text-blood-500 font-mono text-xs bg-blood-900/20 px-2 py-0.5 rounded">
                            {(i + 1).toString().padStart(2, "0")}
                          </span>
                          <span className="text-zinc-300">{invariant}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle>Palette de Couleurs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="h-20 rounded-lg bg-black border border-zinc-800" />
                        <p className="text-xs text-zinc-400">Noir velours - Dominante</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-20 rounded-lg bg-red-900" />
                        <p className="text-xs text-zinc-400">Rouge profond - Accent principal</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-20 rounded-lg bg-amber-700" />
                        <p className="text-xs text-zinc-400">Ambre chaud - Éclairage pratique</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-20 rounded-lg bg-blue-900" />
                        <p className="text-xs text-zinc-400">Bleu tropical - Clair de lune</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle>Negative Prompts (À éviter)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {MOOSTIK_NEGATIVE_PROMPT.map((neg, i) => (
                        <Badge key={i} variant="outline" className="border-blood-900 text-blood-400 text-xs">
                          ✕ {neg}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Moostik Tab */}
              <TabsContent value="moostik" className="space-y-6">
                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle className="text-blood-400">Design des Moostik</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-3">Anatomie</h4>
                        <ul className="text-sm text-zinc-400 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-blood-500">•</span>
                            Corps anthropomorphe élancé (pas d&apos;insecte réaliste)
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blood-500">•</span>
                            Grands yeux expressifs style Pixar
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blood-500">•</span>
                            Proboscis fin comme une aiguille
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blood-500">•</span>
                            Ailes translucides avec veines rouges
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blood-500">•</span>
                            Petite crête rouge sur la tête
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-3">Échelle</h4>
                        <div className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-4 text-center">
                          <p className="text-4xl mb-2">🦟</p>
                          <p className="text-xs text-zinc-500">MICROSCOPIQUE</p>
                          <p className="text-sm text-zinc-400 mt-2">
                            Les Moostik sont de la taille de grains de poussière. 
                            Une fibre de tissu = un tronc d&apos;arbre.
                            Une goutte de rosée = un lac.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="bg-blood-900/30" />
                    
                    <div>
                      <h4 className="text-sm font-medium text-zinc-300 mb-3">Règle d&apos;échelle absolue</h4>
                      <div className="bg-blood-900/20 border border-blood-900/50 rounded-lg p-4">
                        <p className="text-sm text-blood-300">
                          <strong>CRITIQUE :</strong> Les Moostik doivent TOUJOURS apparaître microscopiques 
                          par rapport à leur environnement. Jamais à taille d&apos;insecte normale. 
                          Les humains sont des colosses titanesques vus d&apos;en bas.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle>Société Moostik</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-zinc-300">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-zinc-200 mb-2">Structure sociale</h4>
                        <ul className="space-y-1 text-zinc-400">
                          <li>• Société tribale organisée</li>
                          <li>• Conseil des anciens</li>
                          <li>• Caste militaire (après le génocide)</li>
                          <li>• Érudits et scientifiques</li>
                          <li>• Artisans et bâtisseurs</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-200 mb-2">Culture</h4>
                        <ul className="space-y-1 text-zinc-400">
                          <li>• Influence caribéenne/créole</li>
                          <li>• Bars à nectar (Ti Sang)</li>
                          <li>• Musique et danse</li>
                          <li>• Cérémonies du souvenir</li>
                          <li>• Traditions orales</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Humans Tab */}
              <TabsContent value="humans" className="space-y-6">
                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle className="text-amber-400">Design des Humains</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-amber-900/20 border border-amber-900/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-amber-300">
                        <strong>IMPORTANT :</strong> Tous les humains sont Antillais/Caribéens avec 
                        une peau ébène. Jamais de personnages caucasiens. Style Pixar avec 
                        proportions arrondies et douces.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-3">Caractéristiques</h4>
                        <ul className="text-sm text-zinc-400 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            Peau ébène avec subsurface scattering chaud
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            Proportions Pixar (mains arrondies, doigts doux)
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            Détails réalistes (plis des articulations)
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            Souvent partiels (mains seules, pas de visage)
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-3">Du point de vue Moostik</h4>
                        <ul className="text-sm text-zinc-400 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            Titans colossaux, échelle terrifiante
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            Mouvements = tremblements de terre
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            Mains = armes de destruction massive
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            Cruauté innocente, pas de malice
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle>L&apos;Enfant au BYSS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-zinc-300">
                      L&apos;antagoniste principal de l&apos;EP0. Un enfant martiniquais de 5 ans qui, 
                      sans malice, déclenche le génocide. Référence directe à Sid de Toy Story - 
                      la cruauté innocente de l&apos;enfance.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-3">
                        <p className="text-amber-400 font-medium mb-1">Âge</p>
                        <p className="text-zinc-400">5 ans</p>
                      </div>
                      <div className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-3">
                        <p className="text-amber-400 font-medium mb-1">Ethnicité</p>
                        <p className="text-zinc-400">Antillais/Caribéen</p>
                      </div>
                      <div className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-3">
                        <p className="text-amber-400 font-medium mb-1">Visibilité</p>
                        <p className="text-zinc-400">Mains uniquement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* World Tab */}
              <TabsContent value="world" className="space-y-6">
                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle className="text-blood-400">Architecture Moostik</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-zinc-300 mb-4">
                      L&apos;architecture Moostik est unique et innovante, inspirée de l&apos;anatomie 
                      des moustiques et adaptée à leur échelle microscopique.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-4">
                        <h4 className="font-medium text-blood-400 mb-2">Éléments structurels</h4>
                        <ul className="text-sm text-zinc-400 space-y-1">
                          <li>• Dômes en membrane d&apos;aile (filtrent la lumière)</li>
                          <li>• Flèches en forme de proboscis (collectent la rosée)</li>
                          <li>• Pods en grappes d&apos;œufs (nurseries)</li>
                          <li>• Tours-antennes (communication)</li>
                          <li>• Fenêtres hexagonales (œil composé)</li>
                        </ul>
                      </div>
                      <div className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-4">
                        <h4 className="font-medium text-blood-400 mb-2">Matériaux</h4>
                        <ul className="text-sm text-zinc-400 space-y-1">
                          <li>• Fibres de tissu (poutres, fondations)</li>
                          <li>• Fils de soie (ponts, escaliers)</li>
                          <li>• Cristaux de sucre (décoration, bar)</li>
                          <li>• Coquillages sculptés (signalétique)</li>
                          <li>• Résine/nectar (éclairage bioluminescent)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle>Martinique - Contexte</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-zinc-300">
                    <p>
                      L&apos;histoire se déroule en Martinique, île française des Antilles. 
                      L&apos;atmosphère caribéenne imprègne chaque aspect visuel.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-zinc-200 mb-2">Éléments visuels</h4>
                        <ul className="space-y-1 text-zinc-400">
                          <li>• Architecture créole (jalousies, vérandas)</li>
                          <li>• Textiles madras (motifs colorés)</li>
                          <li>• Végétation tropicale (palmiers)</li>
                          <li>• Fort-de-France en arrière-plan</li>
                          <li>• Montagne Pelée à l&apos;horizon</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-200 mb-2">Atmosphère</h4>
                        <ul className="space-y-1 text-zinc-400">
                          <li>• Humidité tropicale visible</li>
                          <li>• Nuits chaudes et moites</li>
                          <li>• Sons de musique au loin</li>
                          <li>• Lumières de la ville</li>
                          <li>• Clair de lune caribéen</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Technical Tab */}
              <TabsContent value="technical" className="space-y-6">
                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle className="text-blood-400">Angles de Caméra</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {CAMERA_ANGLES.map((angle) => (
                        <div key={angle.angle} className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="border-blood-800 text-blood-400 text-xs">
                              {angle.angle}
                            </Badge>
                            <span className="text-sm font-medium text-zinc-200">
                              {angle.description}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">{angle.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#14131a]/80 border-blood-900/30">
                  <CardHeader>
                    <CardTitle>Spécifications Techniques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-4 text-center">
                        <p className="text-2xl font-bold text-blood-400">4K</p>
                        <p className="text-xs text-zinc-500">Résolution</p>
                      </div>
                      <div className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-4 text-center">
                        <p className="text-2xl font-bold text-blood-400">16:9</p>
                        <p className="text-xs text-zinc-500">Aspect Ratio</p>
                      </div>
                      <div className="bg-[#0b0b0e] rounded-lg border border-blood-900/20 p-4 text-center">
                        <p className="text-2xl font-bold text-blood-400">PNG</p>
                        <p className="text-xs text-zinc-500">Format</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-zinc-800 my-4" />
                    
                    <div className="text-sm text-zinc-400">
                      <h4 className="font-medium text-zinc-200 mb-2">Modèle de génération</h4>
                      <p>
                        <code className="bg-[#0b0b0e] px-2 py-1 rounded border border-blood-900/30 text-blood-400">
                          google/nano-banana-pro
                        </code>
                        {" "}via Replicate API
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Génération parallèle avec jusqu&apos;à 5 images simultanées. 
                        6 variations par shot (angles différents).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
