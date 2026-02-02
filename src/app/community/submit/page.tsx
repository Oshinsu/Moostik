"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicNav } from "@/components/bloodwings";
import { ROUTES } from "@/types/bloodwings";
import {
  Upload,
  Film,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Info,
  DollarSign,
} from "lucide-react";

// ============================================================================
// EPISODE SUBMISSION PAGE
// ============================================================================

type Step = "info" | "files" | "terms" | "review" | "submitted";

export default function SubmitEpisodePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [duration, setDuration] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedRevenue, setAcceptedRevenue] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 2000));
    setStep("submitted");
    setIsSubmitting(false);
  };

  const canProceedFromInfo = title && synopsis && duration;
  const canProceedFromFiles = videoFile || scriptFile;
  const canProceedFromTerms = acceptedTerms && acceptedRevenue;

  return (
    <div className="min-h-screen bg-[#0b0b0e]">
      <PublicNav />

      <main className="pt-16">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-emerald-900/50 text-emerald-400 border-emerald-700/30">
              Communauté
            </Badge>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              Soumettre un épisode
            </h1>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Proposez votre épisode Moostik et gagnez 15% des revenus générés s&apos;il est publié
            </p>
          </div>

          {/* Progress */}
          {step !== "submitted" && (
            <div className="flex items-center justify-center gap-2 mb-12">
              {(["info", "files", "terms", "review"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === s 
                      ? "bg-blood-600 text-white" 
                      : (["info", "files", "terms", "review"].indexOf(step) > i)
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {(["info", "files", "terms", "review"].indexOf(step) > i) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 3 && (
                    <div className={`w-8 h-0.5 ${
                      (["info", "files", "terms", "review"].indexOf(step) > i)
                        ? "bg-emerald-600"
                        : "bg-zinc-800"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP: INFO */}
          {/* ================================================================ */}
          {step === "info" && (
            <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Film className="w-5 h-5 text-blood-400" />
                Informations de l&apos;épisode
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-400">Titre de l&apos;épisode *</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: L'Éveil des Cendres"
                      className="bg-zinc-800/50 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400">Numéro d&apos;épisode (suggestion)</Label>
                    <Input
                      value={episodeNumber}
                      onChange={(e) => setEpisodeNumber(e.target.value)}
                      placeholder="Ex: Episode 5"
                      className="bg-zinc-800/50 border-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-zinc-400">Synopsis *</Label>
                  <Textarea
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="Décrivez votre épisode en quelques phrases..."
                    className="bg-zinc-800/50 border-zinc-700 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label className="text-zinc-400">Durée estimée (en minutes) *</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ex: 12"
                    className="bg-zinc-800/50 border-zinc-700 max-w-[200px]"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  onClick={() => setStep("files")}
                  disabled={!canProceedFromInfo}
                  className="bg-blood-600 hover:bg-blood-500"
                >
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* ================================================================ */}
          {/* STEP: FILES */}
          {/* ================================================================ */}
          {step === "files" && (
            <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blood-400" />
                Fichiers
              </h2>

              <div className="space-y-6">
                {/* Video upload */}
                <div>
                  <Label className="text-zinc-400 mb-2 block">Vidéo de l&apos;épisode</Label>
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-blood-600/50 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      {videoFile ? (
                        <p className="text-emerald-400 font-medium">{videoFile.name}</p>
                      ) : (
                        <>
                          <p className="text-zinc-400 mb-1">Glissez votre vidéo ici</p>
                          <p className="text-xs text-zinc-600">MP4, MOV jusqu&apos;à 5GB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <Label className="text-zinc-400 mb-2 block">Miniature (optionnel)</Label>
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-blood-600/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      {thumbnailFile ? (
                        <p className="text-emerald-400 font-medium">{thumbnailFile.name}</p>
                      ) : (
                        <p className="text-zinc-500 text-sm">Cliquez pour ajouter une miniature</p>
                      )}
                    </label>
                  </div>
                </div>

                {/* Script */}
                <div>
                  <Label className="text-zinc-400 mb-2 block">Script / Scénario (optionnel)</Label>
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-blood-600/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setScriptFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="script-upload"
                    />
                    <label htmlFor="script-upload" className="cursor-pointer">
                      <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      {scriptFile ? (
                        <p className="text-emerald-400 font-medium">{scriptFile.name}</p>
                      ) : (
                        <p className="text-zinc-500 text-sm">PDF, DOC, TXT</p>
                      )}
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      <p className="font-medium mb-1">Pas encore de vidéo ?</p>
                      <p className="text-blue-400/80">
                        Vous pouvez soumettre uniquement un script. Notre équipe pourra vous aider 
                        à le produire avec Bloodwings Studio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep("info")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button
                  onClick={() => setStep("terms")}
                  disabled={!canProceedFromFiles}
                  className="bg-blood-600 hover:bg-blood-500"
                >
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* ================================================================ */}
          {/* STEP: TERMS */}
          {/* ================================================================ */}
          {step === "terms" && (
            <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blood-400" />
                Conditions
              </h2>

              <div className="space-y-6">
                {/* Revenue sharing info */}
                <div className="p-6 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                    <div>
                      <h3 className="font-bold text-white">Revenue Sharing 15%</h3>
                      <p className="text-sm text-emerald-400">Gagnez de l&apos;argent avec votre création</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Si votre épisode est sélectionné et publié sur la chaîne officielle Moostik, 
                    vous recevrez <strong className="text-emerald-400">15% des revenus</strong> générés 
                    (publicités, sponsors, merchandising lié à votre épisode).
                  </p>
                </div>

                {/* Terms checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      className="mt-1 data-[state=checked]:bg-blood-600"
                    />
                    <label htmlFor="terms" className="text-sm text-zinc-400 cursor-pointer">
                      J&apos;accepte les <Link href="/terms" className="text-blood-400 hover:underline">conditions générales</Link> et 
                      confirme que mon contenu est original et respecte les guidelines Moostik.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="revenue"
                      checked={acceptedRevenue}
                      onCheckedChange={(checked) => setAcceptedRevenue(checked as boolean)}
                      className="mt-1 data-[state=checked]:bg-blood-600"
                    />
                    <label htmlFor="revenue" className="text-sm text-zinc-400 cursor-pointer">
                      J&apos;accepte les termes du <Link href="/revenue-sharing" className="text-blood-400 hover:underline">contrat de partage de revenus</Link> (15% créateur / 85% plateforme) 
                      et comprends que Bloodwings Studio se réserve le droit éditorial final.
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-300">
                      <p className="font-medium mb-1">Processus de review</p>
                      <p className="text-amber-400/80">
                        Votre soumission sera examinée par notre équipe éditoriale. 
                        Ce processus peut prendre 2-4 semaines. Vous serez notifié par email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep("files")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button
                  onClick={() => setStep("review")}
                  disabled={!canProceedFromTerms}
                  className="bg-blood-600 hover:bg-blood-500"
                >
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* ================================================================ */}
          {/* STEP: REVIEW */}
          {/* ================================================================ */}
          {step === "review" && (
            <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blood-400" />
                Récapitulatif
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-1">Titre</p>
                  <p className="text-white font-medium">{title}</p>
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-1">Synopsis</p>
                  <p className="text-zinc-300 text-sm">{synopsis}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Durée</p>
                    <p className="text-white font-medium">{duration} minutes</p>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Fichiers</p>
                    <p className="text-white font-medium">
                      {[videoFile, scriptFile, thumbnailFile].filter(Boolean).length} fichier(s)
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                  <p className="text-sm text-emerald-400">
                    ✓ Conditions acceptées • Revenue sharing 15%
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep("terms")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Soumettre mon épisode
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* ================================================================ */}
          {/* STEP: SUBMITTED */}
          {/* ================================================================ */}
          {step === "submitted" && (
            <Card className="p-12 bg-gradient-to-b from-emerald-900/20 to-zinc-900/50 border-emerald-700/30 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-900/50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Épisode soumis avec succès !
              </h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Votre épisode &quot;{title}&quot; a été envoyé pour review. 
                Vous recevrez une notification par email sous 2-4 semaines.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={ROUTES.community}>
                  <Button variant="outline" className="border-zinc-700">
                    Retour à la communauté
                  </Button>
                </Link>
                <Link href="/app/projects">
                  <Button className="bg-blood-600 hover:bg-blood-500">
                    Voir mes projets
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
