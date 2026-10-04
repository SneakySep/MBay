import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server-side Supabase client for RSC / Server Actions / Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<Required<CookieMethodsServer>["setAll"]>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render, where cookie writes are a
            // no-op. Session refresh happens in middleware, so this is safe.
          }
        },
      } satisfies CookieMethodsServer,
    },
  );
}
