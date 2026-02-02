/**
 * BLOODWINGS STUDIO - Middleware
 * 
 * Protection des routes:
 * - /app/* → Authentification requise
 * - /admin/* → Admin requis
 * - Redirection vers login si non authentifié
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response to modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Get access token from cookie
  const accessToken = request.cookies.get("sb-access-token")?.value;
  const refreshToken = request.cookies.get("sb-refresh-token")?.value;
  
  // If no tokens, user is not authenticated
  let user = null;
  
  if (accessToken) {
    try {
      // Create Supabase client to verify token
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data } = await supabase.auth.getUser(accessToken);
      user = data.user;
    } catch {
      // Token invalid or expired
      user = null;
    }
  }

  // =========================================
  // PROTECTED ROUTES: /app/*
  // =========================================
  if (pathname.startsWith("/app")) {
    if (!user) {
      // Redirect to login with return URL
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // =========================================
  // ADMIN ROUTES: /admin/*
  // =========================================
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is admin (would need to fetch from DB)
    // For now, we'll handle this in the page component
  }

  // =========================================
  // AUTH ROUTES: Redirect if already logged in
  // =========================================
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup")) {
    if (user) {
      // Check for redirect param
      const redirect = request.nextUrl.searchParams.get("redirect");
      if (redirect) {
        return NextResponse.redirect(new URL(redirect, request.url));
      }
      // Default redirect to dashboard
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Protected routes
    "/app/:path*",
    "/admin/:path*",
    // Auth routes (for redirect when logged in)
    "/auth/login",
    "/auth/signup",
  ],
};
