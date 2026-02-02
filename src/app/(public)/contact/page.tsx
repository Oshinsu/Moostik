"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MapPin,
  Building2,
  Phone,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Twitter,
  Linkedin,
  HelpCircle,
  Briefcase,
  Bug,
  Sparkles,
} from "lucide-react";

// ============================================================================
// CONTACT PAGE
// ============================================================================

const CONTACT_REASONS = [
  { value: "general", label: "Question générale", icon: HelpCircle },
  { value: "support", label: "Support technique", icon: Bug },
  { value: "sales", label: "Ventes / Entreprise", icon: Briefcase },
  { value: "partnership", label: "Partenariat", icon: Sparkles },
  { value: "press", label: "Presse / Média", icon: MessageSquare },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    reason: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="p-12 bg-zinc-900/50 border-zinc-800/50 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Message envoyé !</h2>
          <p className="text-zinc-400 mb-6">
            Nous avons bien reçu votre message et vous répondrons sous 24-48h.
          </p>
          <Link href="/">
            <Button className="bg-blood-600 hover:bg-blood-500">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blood-900/50 text-blood-400 border-blood-700/30">
            Contact
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Parlons de votre projet
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Une question, un projet d&apos;entreprise ou juste envie de discuter ?
            Notre équipe est là pour vous.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Company Card */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blood-400" />
                Moostik Inc.
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-zinc-500 mt-1" />
                  <div>
                    <p className="text-zinc-300">Bloodwings Studio</p>
                    <p className="text-zinc-500">Fort-de-France</p>
                    <p className="text-zinc-500">97200 Martinique, France</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <a href="mailto:contact@bloodwings.studio" className="text-blood-400 hover:text-blood-300">
                    contact@bloodwings.studio
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400">+596 696 XX XX XX</span>
                </div>
              </div>
            </Card>

            {/* Social */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
              <h3 className="text-lg font-bold text-white mb-4">Réseaux sociaux</h3>
              <div className="flex gap-3">
                <a
                  href="https://twitter.com/bloodwingsstudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-blood-400 hover:bg-blood-900/30 transition-all"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
                <a
                  href="https://linkedin.com/company/bloodwings-studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-blood-400 hover:bg-blood-900/30 transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 bg-gradient-to-br from-blood-900/20 to-zinc-900/50 border-blood-800/30">
              <h3 className="text-lg font-bold text-white mb-4">Liens rapides</h3>
              <div className="space-y-2">
                <Link href="/faq" className="block text-zinc-400 hover:text-blood-400 text-sm">
                  → Questions fréquentes
                </Link>
                <Link href="/docs" className="block text-zinc-400 hover:text-blood-400 text-sm">
                  → Documentation
                </Link>
                <Link href="/pricing" className="block text-zinc-400 hover:text-blood-400 text-sm">
                  → Tarification
                </Link>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">Envoyez-nous un message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400">Nom complet *</Label>
                  <Input
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Jean Dupont"
                    className="bg-zinc-800/50 border-zinc-700"
                    required
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">Email *</Label>
                  <Input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="jean@exemple.com"
                    className="bg-zinc-800/50 border-zinc-700"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400">Entreprise (optionnel)</Label>
                  <Input
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    placeholder="Votre entreprise"
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">Motif *</Label>
                  <Select
                    value={formState.reason}
                    onValueChange={(value) => setFormState({ ...formState, reason: value })}
                  >
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                      <SelectValue placeholder="Sélectionnez un motif" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {CONTACT_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          <div className="flex items-center gap-2">
                            <reason.icon className="w-4 h-4" />
                            {reason.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-zinc-400">Sujet *</Label>
                <Input
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  placeholder="En quelques mots..."
                  className="bg-zinc-800/50 border-zinc-700"
                  required
                />
              </div>

              <div>
                <Label className="text-zinc-400">Message *</Label>
                <Textarea
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Décrivez votre demande en détail..."
                  className="bg-zinc-800/50 border-zinc-700 min-h-[150px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 py-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>

              <p className="text-xs text-zinc-600 text-center">
                En soumettant ce formulaire, vous acceptez notre{" "}
                <Link href="/privacy" className="text-blood-400 hover:underline">
                  politique de confidentialité
                </Link>
                .
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
