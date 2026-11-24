
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/session";

// Rute publice - nu necesita autentificare
const PUBLIC_PATHS = ["/login", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitem rutele publice
  const isPublic = PUBLIC_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Verificam tokenul de sesiune semnat
  const token = request.cookies.get("sb-auth")?.value;
  const session = await verifySession(token);

  if (!session) {
    // Pentru API returnam 401, nu redirect HTML
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Autentificare necesara." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);

    // Pastram destinatia pentru redirect dupa login
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  // Protejam sectiunea Admin
  if (pathname.startsWith("/admin")) {
    if (
      session.role !== "admin" &&
      session.role !== "profesor"
    ) {
      return NextResponse.redirect(
        new URL("/?access_denied=admin", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protejam toate rutele, exceptand:
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
