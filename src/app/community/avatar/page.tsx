"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PublicNav } from "@/components/bloodwings";
import { ROUTES, MOOSTIK_CLANS, type MoostikClan, type MoostikAvatar } from "@/types/bloodwings";
import {
  Upload,
  Sparkles,
  ChevronRight,
  Check,
  Loader2,
  Download,
  Share2,
  Eye,
} from "lucide-react";

// ============================================================================
// AVATAR CREATOR PAGE
// ============================================================================

type Step = "upload" | "clan" | "identity" | "generate" | "complete";

export default function AvatarCreatorPage() {
  const [step, setStep] = useState<Step>("upload");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedClan, setSelectedClan] = useState<MoostikClan | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [backstory, setBackstory] = useState("");
  const [abilities, setAbilities] = useState<string[]>([]);
  
  // Result
  const [generatedAvatar, setGeneratedAvatar] = useState<Partial<MoostikAvatar> | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setStep("clan");
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simuler la génération
    await new Promise(r => setTimeout(r, 3000));
    
    const clan = MOOSTIK_CLANS[selectedClan!];
    setGeneratedAvatar({
      name,
      clan: selectedClan!,
      title,
      basePhotoUrl: photoUrl!,
      referenceImageUrl: photoUrl!, // En prod: URL de l'image générée
      backstory,
      abilities,
      jsonMoostik: {
        version: "1.0",
        character: {
          name,
          clan: selectedClan!,
          visualDescription: `${name}, membre du clan ${clan.nameFr}. ${title}. ${backstory}`,
          colorPalette: [clan.color],
          distinguishingFeatures: abilities,
        },
        promptTemplate: `${name}, ${clan.nameFr} clan warrior, ${abilities.join(", ")}, dark fantasy style, dramatic lighting`,
        negativePrompt: "cartoon, anime, deformed, ugly, blurry",
      },
    });
    
    setIsGenerating(false);
    setStep("complete");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e]">
      <PublicNav />
      
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blood-900/50 text-blood-400 border-blood-700/30">
              Créateur d&apos;Avatar
            </Badge>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              Créez votre Avatar Moostik
            </h1>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Transformez votre photo en personnage Moostik unique.
              Choisissez votre clan, définissez votre histoire.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {(["upload", "clan", "identity", "generate", "complete"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s 
                    ? "bg-blood-600 text-white" 
                    : (["upload", "clan", "identity", "generate", "complete"].indexOf(step) > i)
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-500"
                }`}>
                  {(["upload", "clan", "identity", "generate", "complete"].indexOf(step) > i) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 4 && (
                  <div className={`w-8 h-0.5 ${
                    (["upload", "clan", "identity", "generate", "complete"].indexOf(step) > i)
                      ? "bg-emerald-600"
                      : "bg-zinc-800"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Steps */}
          {step === "upload" && (
            <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 text-center">
              <div className="w-20 h-20 rounded-full bg-blood-900/30 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-blood-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Uploadez votre photo</h2>
              <p className="text-zinc-400 mb-6">
                Une photo de face, bien éclairée, pour de meilleurs résultats
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button className="bg-blood-600 hover:bg-blood-500">
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir une photo
                </Button>
              </label>
            </Card>
          )}

          {step === "clan" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 text-center">
                Choisissez votre clan
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(MOOSTIK_CLANS) as MoostikClan[]).map((clanId) => {
                  const clan = MOOSTIK_CLANS[clanId];
                  const isSelected = selectedClan === clanId;
                  
                  return (
                    <Card
                      key={clanId}
                      onClick={() => setSelectedClan(clanId)}
                      className={`p-4 cursor-pointer transition-all text-center ${
                        isSelected
                          ? "ring-2 ring-blood-500 bg-blood-900/20"
                          : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-4xl block mb-2">{clan.icon}</span>
                      <h3 className="font-bold text-white mb-1">{clan.nameFr}</h3>
                      <p className="text-xs text-zinc-500 mb-2">{clan.description}</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {clan.abilities.slice(0, 2).map((ability) => (
                          <Badge key={ability} className="text-[9px] bg-zinc-800 border-0">
                            {ability}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setStep("identity")}
                  disabled={!selectedClan}
                  className="bg-blood-600 hover:bg-blood-500"
                >
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === "identity" && selectedClan && (
            <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{MOOSTIK_CLANS[selectedClan].icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">Définissez votre identité</h2>
                  <p className="text-zinc-500 text-sm">Clan {MOOSTIK_CLANS[selectedClan].nameFr}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-400">Nom du personnage</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Kira Shadowblade"
                      className="bg-zinc-800/50 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400">Titre (optionnel)</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: La Lame de l'Ombre"
                      className="bg-zinc-800/50 border-zinc-700"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-zinc-400">Histoire / Backstory</Label>
                  <Textarea
                    value={backstory}
                    onChange={(e) => setBackstory(e.target.value)}
                    placeholder="Décrivez l'histoire de votre personnage, son passé, ses motivations..."
                    className="bg-zinc-800/50 border-zinc-700 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label className="text-zinc-400">Capacités (choisissez jusqu&apos;à 3)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MOOSTIK_CLANS[selectedClan].abilities.map((ability) => (
                      <Badge
                        key={ability}
                        onClick={() => {
                          if (abilities.includes(ability)) {
                            setAbilities(abilities.filter(a => a !== ability));
                          } else if (abilities.length < 3) {
                            setAbilities([...abilities, ability]);
                          }
                        }}
                        className={`cursor-pointer transition-all ${
                          abilities.includes(ability)
                            ? "bg-blood-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep("clan")}>
                  Retour
                </Button>
                <Button
                  onClick={() => setStep("generate")}
                  disabled={!name}
                  className="bg-blood-600 hover:bg-blood-500"
                >
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {step === "generate" && selectedClan && (
            <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 text-center">
              <div className="max-w-md mx-auto">
                {/* Preview */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  {photoUrl && (
                    <img
                      src={photoUrl}
                      alt="Your photo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                  <div 
                    className="absolute inset-0 rounded-full border-4 opacity-50"
                    style={{ borderColor: MOOSTIK_CLANS[selectedClan].color }}
                  />
                  <div 
                    className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: MOOSTIK_CLANS[selectedClan].color }}
                  >
                    {MOOSTIK_CLANS[selectedClan].icon}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-1">{name}</h2>
                {title && <p className="text-zinc-500 mb-4">{title}</p>}
                
                <div className="flex justify-center gap-2 mb-6">
                  {abilities.map((ability) => (
                    <Badge 
                      key={ability} 
                      style={{ backgroundColor: MOOSTIK_CLANS[selectedClan].color + "30" }}
                    >
                      {ability}
                    </Badge>
                  ))}
                </div>
                
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 text-lg px-8 py-6"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Générer mon Avatar
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-zinc-600 mt-4">
                  La génération utilise 5 crédits
                </p>
              </div>
            </Card>
          )}

          {step === "complete" && generatedAvatar && selectedClan && (
            <Card className="p-8 bg-gradient-to-b from-blood-900/20 to-zinc-900/50 border-blood-700/30">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-emerald-900/50 text-emerald-400 border-emerald-700/30">
                  Avatar créé !
                </Badge>
                <h2 className="text-2xl font-bold text-white">
                  Bienvenue dans le clan {MOOSTIK_CLANS[selectedClan].nameFr}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Avatar Preview */}
                <div className="text-center">
                  <div className="relative w-64 h-64 mx-auto mb-4">
                    <img
                      src={generatedAvatar.basePhotoUrl}
                      alt={generatedAvatar.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div 
                      className="absolute inset-0 rounded-2xl border-4"
                      style={{ borderColor: MOOSTIK_CLANS[selectedClan].color }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white">{generatedAvatar.name}</h3>
                  {generatedAvatar.title && (
                    <p className="text-zinc-500">{generatedAvatar.title}</p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="space-y-4">
                  <Button className="w-full bg-blood-600 hover:bg-blood-500">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger l&apos;image HD
                  </Button>
                  <Button variant="outline" className="w-full border-zinc-700">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter JSON Moostik
                  </Button>
                  <Button variant="outline" className="w-full border-zinc-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager sur la communauté
                  </Button>
                  <Button variant="outline" className="w-full border-zinc-700">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir dans la galerie
                  </Button>
                  
                  <div className="pt-4 border-t border-zinc-800">
                    <p className="text-sm text-zinc-500 mb-2">JSON Moostik généré :</p>
                    <pre className="text-xs bg-zinc-900 p-3 rounded-lg overflow-auto max-h-40 text-zinc-400">
                      {JSON.stringify(generatedAvatar.jsonMoostik, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-8">
                <Link href={ROUTES.community}>
                  <Button variant="outline" className="border-zinc-700">
                    Retour à la communauté
                  </Button>
                </Link>
                <Button 
                  onClick={() => {
                    setStep("upload");
                    setPhotoUrl(null);
                    setSelectedClan(null);
                    setName("");
                    setTitle("");
                    setBackstory("");
                    setAbilities([]);
                    setGeneratedAvatar(null);
                  }}
                  className="bg-blood-600 hover:bg-blood-500"
                >
                  Créer un autre avatar
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
