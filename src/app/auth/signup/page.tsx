"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { validatePassword } from "@/lib/auth/auth-utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoostikLogo } from "@/components/MoostikLogo";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const { signUp, signInWithGoogle } = useAuth();
  
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    setIsLoading(true);

    const result = await signUp(email, password, displayName);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-gradient-to-br from-blood-900/20 via-[#0b0b0e] to-crimson-900/10" />
        
        <Card className="relative w-full max-w-md bg-[#14131a] border-blood-900/30 p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Vérifiez votre email</h2>
          <p className="text-zinc-500 mb-6">
            Nous avons envoyé un lien de confirmation à <span className="text-white">{email}</span>. 
            Cliquez sur ce lien pour activer votre compte.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="border-zinc-700 text-zinc-300">
              Retour à la connexion
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blood-900/20 via-[#0b0b0e] to-crimson-900/10" />
      <div className="fixed inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blood-700/50 via-blood-600/30 to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blood-600/30 to-blood-700/50" />
      </div>

      <Card className="relative w-full max-w-md bg-[#14131a] border-blood-900/30 p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <MoostikLogo size="md" />
          </Link>
          <p className="text-zinc-500 text-sm mt-4">
            Créez votre compte et commencez à créer
          </p>
          {selectedPlan && (
            <p className="text-blood-400 text-xs mt-2">
              Plan sélectionné: {selectedPlan}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Nom (optionnel)</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 bg-[#0b0b0e] border-blood-900/30 focus:border-blood-600"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-[#0b0b0e] border-blood-900/30 focus:border-blood-600"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-[#0b0b0e] border-blood-900/30 focus:border-blood-600"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password requirements */}
            {password && (
              <div className="mt-2 space-y-1">
                {[
                  { text: "Au moins 8 caractères", valid: password.length >= 8 },
                  { text: "Une majuscule", valid: /[A-Z]/.test(password) },
                  { text: "Une minuscule", valid: /[a-z]/.test(password) },
                  { text: "Un chiffre", valid: /[0-9]/.test(password) },
                ].map((req) => (
                  <div 
                    key={req.text}
                    className={`text-xs flex items-center gap-1 ${req.valid ? "text-emerald-400" : "text-zinc-600"}`}
                  >
                    {req.valid ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-zinc-700" />}
                    {req.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !passwordValidation.valid}
            className="w-full moostik-btn-blood text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-blood-900/30" />
          <span className="text-xs text-zinc-600">ou</span>
          <div className="flex-1 h-px bg-blood-900/30" />
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-900"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </Button>

        {/* Terms */}
        <p className="mt-6 text-center text-[10px] text-zinc-600">
          En créant un compte, vous acceptez nos{" "}
          <Link href="/terms" className="text-blood-400 hover:text-blood-300">
            Conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link href="/privacy" className="text-blood-400 hover:text-blood-300">
            Politique de confidentialité
          </Link>
        </p>

        {/* Login Link */}
        <p className="mt-4 text-center text-sm text-zinc-500">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-blood-400 hover:text-blood-300">
            Se connecter
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blood-500" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
