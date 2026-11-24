
import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import Header from "./components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyBox | Platformă educațională",
  description:
    "Platformă educațională modernă pentru gestionarea utilizatorilor, quiz-urilor și abonamentelor.",
};

async function HeaderWithUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("sb-user");

  const user = userCookie
    ? (() => {
        try {
          return JSON.parse(userCookie.value) as {
            name: string;
            email: string;
            role: string;
          };
        } catch {
          return null;
        }
      })()
    : null;

  return <Header user={user} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ro"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header incarcat in Suspense */}
        <Suspense
          fallback={
            <div
              style={{
                minHeight: "70px",
                width: "100%",
              }}
            />
          }
        >
          <HeaderWithUser />
        </Suspense>

        <main style={{ flex: 1 }}>
          {children}
        </main>

        <footer
          style={{
            background: "var(--surface-0)",
            borderTop: "1px solid var(--surface-200)",
            padding: "1.5rem 1.25rem",
          }}
        >
          <div
            className="container-wide"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: ".75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>
                🎓
              </span>

              <span
                style={{
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontSize: ".9rem",
                }}
              >
                StudyBox
              </span>
            </div>

            <span
              style={{
                fontSize: ".8125rem",
                color: "var(--text-muted)",
              }}
            >
              © 2026 StudyBox · Platformă educațională
            </span>

            <div
              style={{
                display: "flex",
                gap: "1.25rem",
              }}
            >
              <a href="/" className="footer-link">
                Acasă
              </a>

              <a href="/users" className="footer-link">
                Utilizatori
              </a>

              <a href="/admin" className="footer-link">
                Admin
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
