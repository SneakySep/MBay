"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Film, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth"
      ? "That sign-in link is invalid or expired — please try again."
      : null,
  );

  const supabase = createClient();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setPending(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function onGoogle() {
    setPending(true);
    setError(null);

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setPending(false);
      return;
    }

    if (data.url) window.location.assign(data.url);
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border bg-card/60 p-8 shadow-xl">
        <div className="space-y-1 text-center">
          <Film className="mx-auto h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to sync your watchlist across devices.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-center text-xs text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="email"
            required
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            required
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={onGoogle} disabled={pending}>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New to {SITE_NAME}?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
