import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only routes that need a refreshed Supabase session — keeps every other
  // request (and static asset) off the middleware path for speed.
  matcher: ["/profile/:path*", "/auth/callback"],
};
