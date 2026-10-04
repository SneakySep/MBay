import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-16 border-t py-8">
      <div className="container flex flex-col items-center justify-between gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. Built with Next.js & Supabase.
        </p>
        <p className="text-xs">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}
