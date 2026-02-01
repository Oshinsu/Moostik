"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ============================================================================
// ENCYCLOPEDIE DATA
// ============================================================================

interface LoreEntry {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  relatedEntries?: string[];
  images?: string[];
  characterIds?: string[];
  locationIds?: string[];
}

const LORE_CATEGORIES = [
  {
    id: "history",
    name: "Histoire",
    icon: "📜",
    color: "blood",
    subcategories: ["Avant le Génocide", "Le Génocide BYSS", "L'Après", "Prophéties"],
  },
  {
    id: "society",
    name: "Société Moostik",
    icon: "🏛️",
    color: "amber",
    subcategories: ["Clans", "Hiérarchie", "Traditions", "Art & Culture"],
  },
  {
    id: "biology",
    name: "Biologie",
    icon: "🧬",
    color: "emerald",
    subcategories: ["Anatomie", "Cycle de vie", "Alimentation", "Reproduction"],
  },
  {
    id: "technology",
    name: "Technologie",
    icon: "⚙️",
    color: "purple",
    subcategories: ["Architecture", "Outils", "Médecine", "Armes"],
  },
  {
    id: "religion",
    name: "Croyances",
    icon: "🌙",
    color: "blue",
    subcategories: ["L'Eminence", "Rituels", "Mythes", "Tabous"],
  },
  {
    id: "glossary",
    name: "Glossaire",
    icon: "📖",
    color: "zinc",
    subcategories: ["Termes Moostik", "Créole", "Noms propres"],
  },
];

const LORE_ENTRIES: LoreEntry[] = [
  // HISTORY
  {
    id: "age-of-blood",
    title: "L'Âge du Sang",
    category: "history",
    subcategory: "Avant le Génocide",
    content: `Pendant des millénaires, les Moostiks ont prospéré dans l'ombre des humains. Le Clan Cooltik, basé en Martinique, était l'une des civilisations les plus avancées de leur espèce.

Les Moostiks ne se considéraient pas comme des parasites, mais comme des "récolteurs sacrés". Le sang humain n'était pas simplement de la nourriture - c'était une connexion spirituelle, un échange d'essence vitale.

Durant cette ère, les Moostiks développèrent une société sophistiquée :
- Une architecture micro-organique utilisant les matériaux naturels
- Un système de castes basé sur les compétences de vol et de chasse
- Une tradition orale riche transmettant l'histoire du clan
- Des bars clandestins comme le Ti-Sang servant de centres culturels

Cette période est connue dans la tradition Moostik comme "Le Temps où le Sang Coulait Libre".`,
    relatedEntries: ["clan-cooltik", "bar-ti-sang", "blood-ritual"],
  },
  {
    id: "operation-byss",
    title: "Opération BYSS",
    category: "history",
    subcategory: "Le Génocide BYSS",
    content: `L'Opération BYSS (Biological Yield Suppression System) fut déclenchée le 15 août 2047 par une coalition internationale de gouvernements.

Face aux maladies transmises par les moustiques (dengue, chikungunya, zika), les humains décidèrent d'une "solution finale" : l'éradication totale de l'espèce.

Le nuage BYSS était un cocktail chimique et biologique conçu pour :
- Cibler spécifiquement le système nerveux des Culicidae
- Se propager via les courants atmosphériques
- Persister dans l'environnement pendant des semaines

En Martinique, le nuage arriva au crépuscule. Les témoins survivants décrivent :
- Un ciel passant du orange au vert maladif
- Une odeur de soufre et de métal
- Le silence soudain des millions de Moostiks mourant en vol

On estime que 99.7% de la population Moostik mondiale périt en moins de 72 heures. Le Clan Cooltik perdit 98% de ses membres.

C'est l'événement que les survivants appellent simplement "La Chute".`,
    relatedEntries: ["byss-composition", "survivors", "trauma-collective"],
  },
  {
    id: "survivors",
    title: "Les Survivants",
    category: "history",
    subcategory: "L'Après",
    content: `Les rares Moostiks qui survécurent au génocide partagent certaines caractéristiques :
- Ils se trouvaient dans des environnements clos ou souterrains
- Certains présentaient des mutations génétiques offrant une résistance partielle
- D'autres bénéficièrent simplement de la chance

Le groupe de survivants le plus significatif fut celui mené par Papy Tik, l'ancien du Clan Cooltik. Environ 200 individus trouvèrent refuge dans les profondeurs de la jungle martiniquaise.

Ces survivants font face à plusieurs défis :
- Le trauma collectif (syndrome post-génocide)
- La reconstruction génétique (consanguinité)
- La peur permanente d'une nouvelle attaque
- Le désir de vengeance contre l'humanité

La génération née après La Chute est appelée "Les Enfants de la Brume" - ils n'ont jamais connu l'Âge du Sang mais portent le fardeau de la mémoire transmise.`,
    relatedEntries: ["papy-tik", "cooltik-village", "children-of-mist"],
    characterIds: ["papy-tik"],
  },
  
  // SOCIETY
  {
    id: "clan-cooltik",
    title: "Clan Cooltik",
    category: "society",
    subcategory: "Clans",
    content: `Le Clan Cooltik (du créole "kool" + "tik" - les tiques/moustiques cool) est le clan dominant de Martinique depuis plus de 10,000 générations.

STRUCTURE SOCIALE:
- Le Patriarche : Leader spirituel et politique (actuellement Papy Tik)
- Le Conseil des Anciens : 7 membres les plus âgés
- Les Chasseurs d'Élite : Groupe de reconnaissance et d'attaque
- Les Gardiens du Sang : Responsables de la préservation des traditions
- Les Artisans : Constructeurs et inventeurs
- Les Nouvelles Ailes : Jeunes en formation

VALEURS FONDAMENTALES:
1. "Le Sang unit" - Solidarité clanique absolue
2. "Vol libre" - Liberté individuelle de mouvement
3. "Mémoire éternelle" - Transmission des traditions
4. "Justice du Sang" - Vengeance légitimée pour les offenses

RELATIONS AVEC LES HUMAINS (avant BYSS):
Les Cooltik avaient développé une philosophie unique : ils considéraient les humains comme des "hôtes inconscients" plutôt que des proies. Le prélèvement de sang était ritualisé et respectueux.

Après le génocide, cette philosophie a radicalement changé. Les humains sont désormais considérés comme "l'Ennemi Éternel".`,
    relatedEntries: ["papy-tik", "blood-ritual", "vengeance-code"],
    characterIds: ["papy-tik"],
    locationIds: ["cooltik-village"],
  },
  {
    id: "bar-ti-sang",
    title: "Le Bar Ti-Sang",
    category: "society",
    subcategory: "Art & Culture",
    content: `Le Ti-Sang (créole : "Petit Sang") est le bar clandestin légendaire du Clan Cooltik, construit à l'intérieur d'un vieux pneu abandonné.

HISTOIRE:
Fondé il y a environ 500 générations, le Ti-Sang servait initialement de point de rassemblement pour les chasseurs revenant de leurs expéditions. Il est devenu le cœur culturel du clan.

ARCHITECTURE:
- Structure principale dans la chambre à air du pneu
- Décor en cuivre récupéré (fils électriques fondus)
- Éclairage à base de lucioles domestiquées
- Bar principal fait de capsules de bouteilles empilées
- Alcôves privées dans les sculptures du caoutchouc

SPÉCIALITÉS:
- "Sang de Lune" : Cocktail de sang fermenté
- "L'Amber Noir" : Nectar de fleurs tropicales alcoolisé
- "Larme de Titan" : Condensation de sueur humaine (délicatesse rare)

FONCTION ACTUELLE:
Après le génocide, le Ti-Sang est devenu :
- Centre de commandement de la résistance
- Lieu de mémoire pour les morts
- Sanctuaire de préservation culturelle
- Point de planification de la vengeance`,
    relatedEntries: ["clan-cooltik", "cuisine-moostik", "stegomyia"],
    locationIds: ["bar-ti-sang"],
  },
  
  // BIOLOGY
  {
    id: "moostik-anatomy",
    title: "Anatomie Moostik",
    category: "biology",
    subcategory: "Anatomie",
    content: `Les Moostiks du Clan Cooltik appartiennent à l'espèce Aedes aegypti, mais ont développé des caractéristiques uniques sur des millénaires d'évolution.

DIFFÉRENCES AVEC LES MOUSTIQUES COMMUNS:

1. CERVEAU ÉLARGI
- Ratio cerveau/corps 3x supérieur
- Capacités cognitives comparables aux primates
- Mémoire à long terme exceptionnelle

2. SYSTÈME DE COMMUNICATION
- Modulation complexe du bourdonnement (langage)
- Antennes hypersensibles (émotions des autres)
- Phéromones spécialisées (messages chimiques)

3. AILES MODIFIÉES
- Contrôle de vol supérieur
- Capacité de vol stationnaire prolongé
- Battements jusqu'à 800/seconde (vs 500 standard)

4. TROMPE ÉVOLUÉE
- Injection d'anesthésique plus puissant
- Anticoagulant modifié (traces invisibles)
- Capteurs thermiques intégrés

5. VISION
- Vision infrarouge (détection de chaleur)
- Perception du mouvement à 300 Hz
- Vision nocturne améliorée

DURÉE DE VIE:
Les Moostiks Cooltik vivent environ 3-5 ans (vs quelques semaines pour les moustiques communs). Les anciens comme Papy Tik peuvent atteindre 15-20 ans.`,
    relatedEntries: ["feeding-behavior", "reproduction", "genetics"],
  },
  {
    id: "blood-feeding",
    title: "Alimentation Sanguine",
    category: "biology",
    subcategory: "Alimentation",
    content: `Contrairement à la croyance populaire, seules les femelles Moostik se nourrissent de sang, et uniquement pour la reproduction.

LE PROCESSUS DE PRÉLÈVEMENT:

1. DÉTECTION (Phase "Chasse")
- Détection du CO2 expiré jusqu'à 50 mètres
- Localisation thermique du vaisseau sanguin
- Évaluation de la "qualité" du sang

2. APPROCHE (Phase "Danse")
- Vol en spirale caractéristique
- Synchronisation avec la respiration de l'hôte
- Atterrissage sur une zone de peau fine

3. PERFORATION (Phase "Baiser")
- Injection d'anesthésique (indolore)
- Insertion de la trompe (fascicule)
- Anticoagulant pour maintenir le flux

4. ALIMENTATION (Phase "Communion")
- Prélèvement d'environ 3 microlitres
- Durée moyenne : 2-3 minutes
- Retrait propre sans trace

ASPECT CULTUREL:
Pour les Moostiks, ce processus n'est pas une simple alimentation - c'est un acte sacré. Ils croient absorber une partie de l'essence de l'hôte, créant un lien spirituel.

Les "Grands Chasseurs" sont capables de prélever du sang sans jamais éveiller l'humain endormi - c'est considéré comme le summum de l'art.`,
    relatedEntries: ["blood-ritual", "hunters-elite", "human-relations"],
  },
  
  // RELIGION
  {
    id: "the-eminence",
    title: "L'Éminence",
    category: "religion",
    subcategory: "L'Eminence",
    content: `L'Éminence est la figure mystérieuse au cœur de la spiritualité Moostik. Son identité réelle reste un mystère absolu.

CE QU'ON SAIT:
- Apparaît uniquement dans les moments de crise absolue
- Communique par visions et présages
- Possède apparemment une connaissance du futur
- Ne se montre jamais physiquement à plus d'un témoin

INTERPRÉTATIONS:
1. Le Premier Moostik : Certains croient que l'Éminence est l'ancêtre originel de l'espèce
2. Un Esprit Collectif : D'autres pensent qu'il s'agit de la conscience combinée de tous les Moostiks morts
3. Un Mutant : Certains sceptiques suggèrent un Moostik ayant développé des capacités psychiques
4. Une Invention : Les plus pragmatiques voient l'Éminence comme un mythe utile au contrôle social

SON RÔLE ACTUEL:
Depuis le génocide, les apparitions de l'Éminence se sont intensifiées. Plusieurs témoins rapportent des messages cryptiques concernant :
- Une "grande vengeance à venir"
- Un "enfant entre deux mondes" (possiblement Baby Dorval)
- La "résurrection du clan par le sang des coupables"

Papy Tik maintient une relation privilégiée avec l'Éminence, ayant reçu des visions directes.`,
    relatedEntries: ["papy-tik", "prophecies", "rituals"],
    characterIds: ["eminence"],
  },
  {
    id: "blood-ritual",
    title: "Le Rituel du Sang",
    category: "religion",
    subcategory: "Rituels",
    content: `Le Rituel du Sang est la cérémonie la plus sacrée de la culture Moostik, pratiquée lors d'événements majeurs.

OCCASIONS:
- Naissance d'un nouveau membre
- Passage à l'âge adulte
- Mariage (union des sangs)
- Funérailles
- Déclarations de guerre
- Acceptation d'un allié non-Moostik

DÉROULEMENT:
1. Rassemblement au cœur du Ti-Sang
2. Incantation par le Patriarche
3. Offrande d'une goutte de sang par chaque participant
4. Mélange cérémoniel dans la Coupe Ancestrale
5. Partage symbolique du sang mélangé
6. Scellement par le bourdonnement collectif

SIGNIFICATION:
Le sang représente l'essence vitale, la connexion à tous les ancêtres. En mélangeant leurs sangs, les participants affirment leur unité absolue.

VARIANTE POST-GÉNOCIDE:
Un nouveau rituel a émergé : le "Serment de Vengeance". Chaque survivant adulte a juré sur son sang de ne jamais pardonner aux humains. Ce serment est renouvelé chaque anniversaire de La Chute.`,
    relatedEntries: ["clan-cooltik", "papy-tik", "the-eminence"],
  },

  // GLOSSARY
  {
    id: "glossary-moostik",
    title: "Termes Moostik Essentiels",
    category: "glossary",
    subcategory: "Termes Moostik",
    content: `LEXIQUE MOOSTIK-FRANÇAIS:

SOCIÉTÉ:
- Cooltik : Le clan (littéralement "les cools")
- Zzzann : Ancien/Sage (du bourdonnement lent des vieux)
- Pikeur : Chasseur d'élite (de "piquer")
- Sanwé : Cérémonie du sang ("sang-way")
- Ti-Sang : Petit sang (nom du bar)

BIOLOGIE:
- Twomp : Trompe/proboscis
- Zelzél : Ailes (onomatopée du vol)
- Lanmò Dous : "La douce mort" - référence à l'anesthésique
- Cho-san : Sang chaud (sang humain frais)

EXPRESSIONS:
- "Vol haut!" : Salutation/Au revoir
- "Que ton sang reste fort" : Bénédiction
- "Il a le sang lourd" : Personne de confiance
- "Ailes cassées" : Traître au clan

TABOUS LINGUISTIQUES:
- Ne jamais dire "moustique" (terme humain méprisant)
- Éviter de nommer les morts récents directement
- Le vrai nom de l'Éminence ne doit jamais être prononcé`,
    relatedEntries: ["clan-cooltik", "creole-influences"],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function LorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["history"]);

  // Filter entries
  const filteredEntries = LORE_ENTRIES.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const entriesByCategory = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<string, LoreEntry[]>);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    blood: { bg: "bg-blood-900/50", border: "border-blood-700/50", text: "text-blood-300" },
    amber: { bg: "bg-amber-900/50", border: "border-amber-700/50", text: "text-amber-300" },
    emerald: { bg: "bg-emerald-900/50", border: "border-emerald-700/50", text: "text-emerald-300" },
    purple: { bg: "bg-purple-900/50", border: "border-purple-700/50", text: "text-purple-300" },
    blue: { bg: "bg-blue-900/50", border: "border-blue-700/50", text: "text-blue-300" },
    zinc: { bg: "bg-zinc-800/50", border: "border-zinc-700/50", text: "text-zinc-300" },
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-4 mb-6">
            <Link href="/series" className="text-zinc-500 hover:text-white text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </Link>
          </nav>

          <Badge className="bg-purple-900/50 text-purple-300 border-purple-700/50 mb-4">ENCYCLOPÉDIE</Badge>
          <h1 className="text-4xl md:text-5xl font-black">
            <span className="text-blood-500">Lore</span> Moostik
          </h1>
          <p className="text-zinc-500 mt-2">
            {LORE_ENTRIES.length} entrées • {LORE_CATEGORIES.length} catégories
          </p>

          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder="Rechercher dans le lore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar - Categories */}
          <aside className="space-y-2">
            <h2 className="text-sm font-bold text-zinc-500 uppercase mb-4">Catégories</h2>
            {LORE_CATEGORIES.map((category) => {
              const colors = colorClasses[category.color];
              const entries = entriesByCategory[category.id] || [];
              const isExpanded = expandedCategories.includes(category.id);

              return (
                <Collapsible key={category.id} open={isExpanded}>
                  <CollapsibleTrigger
                    onClick={() => toggleCategory(category.id)}
                    className={`
                      w-full p-3 rounded-lg flex items-center justify-between
                      transition-colors ${colors.bg} ${colors.border} border
                      ${selectedCategory === category.id ? "ring-2 ring-blood-500" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <span className={`font-medium ${colors.text}`}>{category.name}</span>
                      <Badge className="bg-zinc-800 text-zinc-400 text-[10px]">
                        {entries.length}
                      </Badge>
                    </div>
                    <svg
                      className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 ml-6 space-y-1">
                    {category.subcategories.map((sub) => {
                      const subEntries = entries.filter((e) => e.subcategory === sub);
                      return (
                        <button
                          key={sub}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            const firstEntry = subEntries[0];
                            if (firstEntry) setSelectedEntry(firstEntry);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded transition-colors flex justify-between"
                        >
                          <span>{sub}</span>
                          {subEntries.length > 0 && (
                            <span className="text-zinc-600">{subEntries.length}</span>
                          )}
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </aside>

          {/* Content */}
          <main>
            {selectedEntry ? (
              // Single Entry View
              <div>
                <Button
                  variant="ghost"
                  className="text-zinc-500 mb-4"
                  onClick={() => setSelectedEntry(null)}
                >
                  ← Retour à la liste
                </Button>
                <article className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8">
                  <Badge className={`${colorClasses[LORE_CATEGORIES.find(c => c.id === selectedEntry.category)?.color || "zinc"].bg} mb-4`}>
                    {LORE_CATEGORIES.find(c => c.id === selectedEntry.category)?.name}
                    {selectedEntry.subcategory && ` • ${selectedEntry.subcategory}`}
                  </Badge>
                  <h1 className="text-3xl font-black text-blood-500 mb-6">{selectedEntry.title}</h1>
                  <div className="prose prose-invert max-w-none">
                    {selectedEntry.content.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="text-zinc-300 leading-relaxed mb-4 whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Related Entries */}
                  {selectedEntry.relatedEntries && selectedEntry.relatedEntries.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-zinc-800">
                      <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3">Articles liés</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.relatedEntries.map((relId) => {
                          const related = LORE_ENTRIES.find((e) => e.id === relId);
                          if (!related) return null;
                          return (
                            <Button
                              key={relId}
                              variant="outline"
                              size="sm"
                              className="border-zinc-700 text-zinc-400"
                              onClick={() => setSelectedEntry(related)}
                            >
                              {related.title}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              </div>
            ) : (
              // Entry List View
              <div className="space-y-6">
                {Object.entries(entriesByCategory).map(([categoryId, entries]) => {
                  const category = LORE_CATEGORIES.find((c) => c.id === categoryId);
                  if (!category) return null;
                  const colors = colorClasses[category.color];

                  return (
                    <div key={categoryId}>
                      <h2 className={`text-xl font-bold ${colors.text} mb-4 flex items-center gap-2`}>
                        <span>{category.icon}</span>
                        {category.name}
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {entries.map((entry) => (
                          <Card
                            key={entry.id}
                            className={`${colors.bg} ${colors.border} border p-4 cursor-pointer hover:scale-[1.02] transition-transform`}
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <h3 className="font-bold text-white mb-1">{entry.title}</h3>
                            {entry.subcategory && (
                              <Badge className="bg-zinc-800/50 text-zinc-400 text-[9px] mb-2">
                                {entry.subcategory}
                              </Badge>
                            )}
                            <p className="text-zinc-400 text-sm line-clamp-2">
                              {entry.content.slice(0, 150)}...
                            </p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
