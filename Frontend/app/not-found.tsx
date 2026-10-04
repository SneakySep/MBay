import Link from "next/link";
import { Film } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <Film className="h-12 w-12 text-primary" />
      <h1 className="text-3xl font-extrabold tracking-tight">Scene missing</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you were looking for has left the theater. It may have been
        removed or the address was mistyped.
      </p>
      <Button asChild size="lg">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
