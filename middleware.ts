import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rute publice — nu necesită autentificare
const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lasă libere rutele publice și fișierele statice
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Verifică cookie-ul de autentificare
  const auth = request.cookies.get("sb-auth");

  if (!auth || auth.value !== "sb-authenticated-v1") {
    const loginUrl = new URL("/login", request.url);
    // Salvăm unde voia să ajungă, pentru redirect după login
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Protecție secțiune Admin: doar utilizatorii cu rol admin sau profesor
  if (pathname.startsWith("/admin")) {
    const userCookie = request.cookies.get("sb-user");
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value);
        if (user.role !== "admin" && user.role !== "profesor") {
          // Utilizatorii obișnuiți (studenți) sunt redirecționați pe prima pagină
          return NextResponse.redirect(new URL("/?access_denied=admin", request.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protejează toate rutele EXCEPTÂND:
     * - _next/static  (fișiere Next.js)
     * - _next/image   (optimizare imagini)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
