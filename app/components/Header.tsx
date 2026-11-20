
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type User = { name: string; email: string; role: string } | null;

const NAV_LINKS = [
  { href: "/",      label: "Acasă",       icon: "🏠" },
  { href: "/users", label: "Utilizatori", icon: "👥" },
  { href: "/admin", label: "Admin",       icon: "⚙️" },
];

export default function Header({ user }: { user: User }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  // Nu afișăm header-ul pe pagina de login
  if (pathname === "/login") return null;

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = user
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--surface-200)",
        boxShadow: "0 1px 20px rgba(99,102,241,.07)",
      }}
    >
      <div
        className="container-wide"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: ".875rem 1.25rem",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".6rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "2.1rem",
              height: "2.1rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--brand-600), var(--accent-500))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              boxShadow: "0 2px 8px rgba(99,102,241,.35)",
              flexShrink: 0,
            }}
          >
            🎓
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "1.0625rem",
                color: "var(--text-primary)",
                lineHeight: 1.1,
                letterSpacing: "-.02em",
              }}
            >
              StudyBox
            </div>
            <div
              style={{
                fontSize: ".65rem",
                fontWeight: 600,
                color: "var(--brand-500)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              Platformă educațională
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: ".25rem" }}>
          {NAV_LINKS.filter(
            (link) => link.href !== "/admin" || user?.role === "admin" || user?.role === "profesor"
          ).map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".35rem",
                  padding: ".45rem .9rem",
                  borderRadius: "8px",
                  fontSize: ".875rem",
                  fontWeight: active ? 700 : 500,
                  textDecoration: "none",
                  transition: "all var(--transition)",
                  background: active
                    ? "linear-gradient(135deg, var(--brand-600), var(--brand-500))"
                    : "transparent",
                  color: active ? "#fff" : "var(--text-secondary)",
                  boxShadow: active ? "0 2px 8px rgba(99,102,241,.30)" : "none",
                }}
              >
                <span style={{ fontSize: ".9rem" }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User area */}
        {user && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".6rem",
                background: "var(--surface-50)",
                border: "1.5px solid var(--surface-200)",
                borderRadius: "999px",
                padding: ".35rem .75rem .35rem .4rem",
                cursor: "pointer",
                transition: "all var(--transition)",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "1.9rem",
                  height: "1.9rem",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--brand-500), var(--accent-500))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".7rem",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: ".03em",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: ".8125rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  {user.name.split(" ")[0]}
                </div>
                <div style={{ fontSize: ".7rem", color: "var(--text-muted)", lineHeight: 1 }}>
                  {user.role === "admin" ? "⚙️ Admin" : user.role === "profesor" ? "🎓 Profesor" : "📚 Student"}
                </div>
              </div>
              <span style={{ fontSize: ".7rem", color: "var(--text-muted)", marginLeft: ".1rem" }}>
                {menuOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <>
                {/* Overlay transparent pt. click outside */}
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 40,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + .5rem)",
                    right: 0,
                    zIndex: 50,
                    background: "var(--surface-0)",
                    border: "1px solid var(--surface-200)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-lg)",
                    minWidth: "220px",
                    overflow: "hidden",
                  }}
                >
                  {/* User info */}
                  <div
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--surface-100)",
                      background: "var(--surface-50)",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--text-primary)" }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: ".8rem", color: "var(--text-muted)", marginTop: ".15rem" }}>
                      {user.email}
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: ".5rem" }}>
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".6rem",
                        padding: ".6rem .75rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: ".875rem",
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        transition: "background var(--transition)",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-100)")}
                      onMouseOut={(e)  => (e.currentTarget.style.background = "transparent")}
                    >
                      🏠 Acasă
                    </Link>
                    <Link
                      href="/subscription"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".6rem",
                        padding: ".6rem .75rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: ".875rem",
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        transition: "background var(--transition)",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-100)")}
                      onMouseOut={(e)  => (e.currentTarget.style.background = "transparent")}
                    >
                      💳 Plan de abonament
                    </Link>
                    {(user.role === "admin" || user.role === "profesor") && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".6rem",
                          padding: ".6rem .75rem",
                          borderRadius: "var(--radius-sm)",
                          fontSize: ".875rem",
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                          transition: "background var(--transition)",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-100)")}
                        onMouseOut={(e)  => (e.currentTarget.style.background = "transparent")}
                      >
                        ⚙️ Panou Admin
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div style={{ padding: ".5rem", borderTop: "1px solid var(--surface-100)" }}>
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".6rem",
                        width: "100%",
                        padding: ".6rem .75rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: ".875rem",
                        fontWeight: 600,
                        color: "#b91c1c",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "background var(--transition)",
                        textAlign: "left",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#fff1f2")}
                      onMouseOut={(e)  => (e.currentTarget.style.background = "transparent")}
                    >
                      {loggingOut ? "⏳ Se deconectează..." : "🚪 Deconectare"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
