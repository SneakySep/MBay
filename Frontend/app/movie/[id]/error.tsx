"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MovieError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertTriangle className="h-12 w-12 text-primary" />
      <h1 className="text-2xl font-bold tracking-tight">
        Couldn&apos;t load this movie
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>
        <RotateCcw className="h-4 w-4" /> Try again
      </Button>
    </div>
  );
}
