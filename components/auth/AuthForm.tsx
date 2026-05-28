"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StickyNote, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
        });
        if (error) throw error;
        setError("Controlla la tua email per confermare l'account.");
      }
    } catch (err: any) {
      setError(err.message ?? "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!email) { setError("Inserisci la tua email prima"); return; }
    setError(null);
    setMagicLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
      });
      if (error) throw error;
      setMagicSent(true);
    } catch (err: any) {
      setError(err.message ?? "Errore");
    } finally {
      setMagicLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-primary rounded-2xl mb-3">
          <StickyNote className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Notetaker</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "login" ? "Bentornato! Accedi al tuo account" : "Crea il tuo account gratuito"}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@esempio.com"
              required
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          {error && (
            <p className={cn(
              "text-sm px-3 py-2 rounded-lg",
              error.includes("Controlla") ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-destructive/10 text-destructive"
            )}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Accedi" : "Registrati"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">oppure</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {magicSent ? (
          <div className="mt-4 text-center text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
            Magic link inviato! Controlla la tua email.
          </div>
        ) : (
          <button
            onClick={handleMagicLink}
            disabled={magicLoading}
            className="mt-4 w-full py-2 border border-input rounded-lg text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {magicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Accedi con magic link
          </button>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>Non hai un account?{" "}<Link href="/signup" className="text-primary hover:underline font-medium">Registrati</Link></>
          ) : (
            <>Hai già un account?{" "}<Link href="/login" className="text-primary hover:underline font-medium">Accedi</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
