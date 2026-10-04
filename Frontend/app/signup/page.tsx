"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const supabase = createClient();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setEmailSent(false);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });

    setPending(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // With email confirmation OFF a session exists immediately.
    if (data.session) {
      router.push("/profile");
      router.refresh();
      return;
    }

    setEmailSent(true);
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border bg-card/60 p-8 shadow-xl">
        <div className="space-y-1 text-center">
          <Film className="mx-auto h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Save favorites, mark titles watched, keep lists on {SITE_NAME}.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-center text-xs text-destructive">
            {error}
          </p>
        )}

        {emailSent ? (
          <div className="space-y-3 text-center">
            <MailCheck className="mx-auto h-8 w-8 text-primary" />
            <p className="text-sm">
              We sent a confirmation link to{" "}
              <span className="font-semibold">{email}</span>. Click it to
              finish signing up.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Back to sign in</Link>
            </Button>
          </div>
        ) : (
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
              minLength={8}
              placeholder="Password (min. 8 characters)"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Create
              account
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
