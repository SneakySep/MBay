"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, LogIn, LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { createClient } from "@/lib/supabase/client";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";

export function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user ?? null);
        setReady(true);
      })
      .catch(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const signOut = async () => {
    try {
      await createClient().auth.signOut();
    } finally {
      setUser(null);
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight"
        >
          <Film className="h-6 w-6 text-primary" />
          <span>
            {SITE_NAME.slice(0, 1)}
            <span className="text-primary">{SITE_NAME.slice(1)}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 md:gap-3">
          <SearchAutocomplete />

          {!ready && <Skeleton className="h-9 w-24 shrink-0 rounded-md" />}

          {ready && !user && (
            <>
              <Button variant="ghost" size="sm" asChild className="shrink-0">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Log in</span>
                </Link>
              </Button>
              <Button size="sm" asChild className="shrink-0">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}

          {ready && user && (
            <>
              <Button variant="ghost" size="sm" asChild className="shrink-0">
                <Link href="/profile">
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="shrink-0">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
