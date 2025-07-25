import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Kalau belum login, redirect ke /login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

// Proteksi semua route yang diawali dengan /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
