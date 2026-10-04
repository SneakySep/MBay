import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-confirmation callback. Supabase appends ?code=… here; we
 * exchange it for a session (cookies written via the server client) and
 * bounce the user to `next` (default: /profile).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/profile";
  // Only allow in-app relative redirects to avoid open-redirect abuse.
  const next = nextParam.startsWith("/") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
