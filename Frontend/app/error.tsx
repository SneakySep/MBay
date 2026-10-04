"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for the whole app. Surfaces actionable config
 * hints (e.g. a missing TMDB key) instead of a blank screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isKeyIssue = /TMDB_API_KEY/i.test(error.message);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertTriangle className="h-12 w-12 text-primary" />
      <h1 className="text-2xl font-bold tracking-tight">
        {isKeyIssue ? "TMDB is not configured" : "Something went wrong"}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
      {isKeyIssue && (
        <p className="max-w-md rounded-lg border bg-card p-3 text-xs text-muted-foreground">
          Copy <code>.env.local.example</code> → <code>.env.local</code>, paste your{" "}
          <strong>API Key (v4 auth token)</strong> from themoviedb.org/settings/api,
          then restart <code>npm run dev</code>.
        </p>
      )}
      {error.digest && (
        <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
      )}
      <Button onClick={reset}>
        <RotateCcw className="h-4 w-4" /> Try again
      </Button>
    </div>
  );
}
