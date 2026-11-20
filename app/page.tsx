import { PrismaClient } from "./generated/prisma/client";
import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";

export const instant = false;
const prisma = new PrismaClient();

async function AccessDeniedAlert({
  searchParams,
}: {
  searchParams?: Promise<{ access_denied?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  if (params.access_denied !== "admin") return null;

  return (
    <div className="alert alert-warning fade-up" style={{ marginBottom: "1.5rem" }}>
      <span>🔒</span>
      <span>
        <strong>Acces restricționat:</strong> Secțiunea de administrare este disponibilă doar conturilor cu rol de <strong>Administrator</strong> sau <strong>Profesor</strong>.
      </span>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ access_denied?: string }>;
}) {
  const cookieStore = await cookies();
  const userCookie  = cookieStore.get("sb-user");
  const authUser = userCookie
    ? (() => {
        try {
          return JSON.parse(userCookie.value) as { id?: number; name: string; email: string; role: string };
        } catch {
          return null;
        }
      })()
    : null;

  const isStudent = authUser?.role === "student";

  // Dacă utilizatorul este student, încărcăm datele relevante pentru el
  if (isStudent && authUser?.email) {
    const student = await prisma.user.findUnique({
      where: { email: authUser.email },
      include: {
        quizzes: { orderBy: { createdAt: "desc" } },
        subscriptions: { where: { status: "active" }, orderBy: { id: "desc" } },
      },
    });

    const myQuizzes = student?.quizzes ?? [];
    const activeSubscription = student?.subscriptions[0];
    const totalCommunityQuizzes = await prisma.quiz.count({
      where: { isPublic: true },
    });

    // Quiz-uri din comunitate (create de profesori sau alți colegi, publice)
    const otherQuizzes = await prisma.quiz.findMany({
      where: {
        isPublic: true,
        ...(student ? { userId: { not: student.id } } : {}),
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return (
      <div className="page-wrapper">
        <div className="container-wide">
          <Suspense fallback={null}>
            <AccessDeniedAlert searchParams={searchParams} />
          </Suspense>

          {/* ── Hero Student ────────────────────────────────────────────── */}
          <section
            className="fade-up"
            style={{
              background: "linear-gradient(135deg, var(--brand-600) 0%, var(--accent-500) 100%)",
              borderRadius: "var(--radius-xl)",
              padding: "3.5rem 2.5rem",
              marginBottom: "2.5rem",
              position: "relative",
              overflow: "hidden",
              color: "#fff",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute", top: "-60px", right: "-60px",
                width: "260px", height: "260px",
                borderRadius: "50%",
                background: "rgba(255,255,255,.08)",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,.18)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "999px",
                  padding: ".3rem .9rem",
                  fontSize: ".75rem",
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  marginBottom: "1.25rem",
                }}
              >
                🎓 Spațiul tău de studiu • Student
              </span>

              <h1
                style={{
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: ".75rem",
                  letterSpacing: "-.03em",
                }}
              >
                Salut, {student?.name ?? authUser.name}! 👋
              </h1>

              <p
                style={{
                  fontSize: "1.1rem",
                  opacity: .85,
                  maxWidth: "540px",
                  marginBottom: "2rem",
                  lineHeight: 1.6,
                }}
              >
                Aici ai acces la quiz-urile tale, materialele pe care le-ai creat și testele disponibile pentru recapitulare.
              </p>

              <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "center" }}>
                <Link
                  href="/quizzes/create"
                  className="btn"
                  style={{
                    background: "#fff",
                    color: "var(--brand-700)",
                    padding: ".75rem 1.5rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    fontSize: ".9375rem",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(0,0,0,.18)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".5rem",
                  }}
                >
                  📄 Încarcă PDF & Generează Quiz
                </Link>
                <Link
                  href="/users"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".5rem",
                    background: "rgba(255,255,255,.18)",
                    color: "#fff",
                    padding: ".75rem 1.5rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: ".9375rem",
                    textDecoration: "none",
                    border: "1.5px solid rgba(255,255,255,.35)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  👥 Colegi & Comunitate
                </Link>
              </div>
            </div>
          </section>

          {/* ── Statistici Student ──────────────────────────────────────── */}
          <div
            className="fade-up fade-up-1"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
              gap: "1rem",
              marginBottom: "2.5rem",
            }}
          >
            {[
              {
                label: "Quiz-urile mele create",
                value: myQuizzes.length,
                icon: "📝",
                color: "var(--brand-500)",
              },
              {
                label: "Materiale în comunitate",
                value: totalCommunityQuizzes,
                icon: "📚",
                color: "var(--accent-500)",
              },
              {
                label: "Planul meu de abonament",
                value: activeSubscription ? activeSubscription.plan : "Gratuit",
                icon: "💳",
                color: "var(--success-500)",
                isText: true,
                action: { label: "Schimbă planul →", href: "/subscription" },
              },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".75rem" }}>
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "10px",
                      background: `${stat.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <span style={{ fontSize: ".8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                    {stat.label}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: ".5rem" }}>
                  <div
                    style={{
                      fontSize: stat.isText ? "1.6rem" : "2.25rem",
                      fontWeight: 900,
                      color: stat.color,
                      lineHeight: 1,
                      letterSpacing: "-.03em",
                    }}
                  >
                    {stat.value}
                  </div>
                  {"action" in stat && stat.action && (
                    <Link
                      href={stat.action.href}
                      style={{
                        fontSize: ".8125rem",
                        fontWeight: 700,
                        color: "var(--brand-600)",
                        textDecoration: "none",
                        padding: ".35rem .75rem",
                        background: "var(--brand-50)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--brand-100)",
                      }}
                    >
                      {stat.action.label}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Secțiune: Quiz-urile mele ───────────────────────────────── */}
          <section className="fade-up fade-up-2" style={{ marginBottom: "3rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.375rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    margin: 0,
                    letterSpacing: "-.02em",
                  }}
                >
                  📝 Quiz-urile mele create
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: ".875rem", margin: ".25rem 0 0" }}>
                  Materialele și testele adăugate de tine
                </p>
              </div>

              <Link href="/quizzes/create" className="btn btn-primary btn-sm">
                + Adaugă quiz nou
              </Link>
            </div>

            {myQuizzes.length === 0 ? (
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "3.5rem 2rem",
                  background: "var(--surface-0)",
                  border: "2px dashed var(--surface-300)",
                  boxShadow: "none",
                }}
              >
                <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📖</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: ".5rem" }}>
                  Nu ai creat încă niciun quiz
                </h3>
                <p style={{ color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto 1.5rem", fontSize: ".9375rem" }}>
                  Creează teste grilă sau fișe de recapitulare pentru materiile tale pentru a învăța mai ușor.
                </p>
                <Link href="/quizzes/create" className="btn btn-primary">
                  ✨ Creează primul tău quiz
                </Link>
              </div>
            ) : (
              <div className="grid-auto">
                {myQuizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/quizzes/${quiz.id}`}
                    className="card"
                    style={{
                      borderTop: "4px solid var(--brand-500)",
                      textDecoration: "none",
                      display: "block",
                      color: "inherit",
                    }}
                  >
                    <div className="card-body" style={{ padding: "1.375rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".75rem" }}>
                        <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                          <span className="badge badge-primary">Creat de tine</span>
                          {quiz.isPublic ? (
                            <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: ".25rem", fontSize: ".7rem" }}>
                              🌐 Comunitate
                            </span>
                          ) : (
                            <span className="badge badge-gray" style={{ display: "inline-flex", alignItems: "center", gap: ".25rem", fontSize: ".7rem" }}>
                              🔒 Privat
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>
                          {new Date(quiz.createdAt).toLocaleDateString("ro-RO")}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: ".5rem",
                          lineHeight: 1.3,
                        }}
                      >
                        {quiz.title}
                      </h3>

                      <p
                        style={{
                          fontSize: ".875rem",
                          color: "var(--text-secondary)",
                          margin: "0 0 1rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {quiz.description || "Fără descriere adițională"}
                      </p>

                      <div className="divider" style={{ margin: ".75rem 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
                          ID #{quiz.id}
                        </span>
                        <span
                          className="btn btn-primary btn-sm"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: ".35rem",
                            padding: ".4rem .85rem",
                            fontSize: ".8125rem",
                            fontWeight: 700,
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          ▶ Deschide Quiz
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── Secțiune: Quiz-uri din comunitate ──────────────────────── */}
          {otherQuizzes.length > 0 && (
            <section className="fade-up fade-up-3">
              <div style={{ marginBottom: "1.25rem" }}>
                <h2
                  style={{
                    fontSize: "1.375rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    margin: 0,
                    letterSpacing: "-.02em",
                  }}
                >
                  🌐 Quiz-uri disponibile în comunitate
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: ".875rem", margin: ".25rem 0 0" }}>
                  Materiale adăugate de profesori și alți colegi pe care le poți parcurge
                </p>
              </div>

              <div className="grid-auto">
                {otherQuizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/quizzes/${quiz.id}`}
                    className="card"
                    style={{
                      textDecoration: "none",
                      display: "block",
                      color: "inherit",
                    }}
                  >
                    <div className="card-body" style={{ padding: "1.375rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".75rem" }}>
                        <span className="badge badge-purple">
                          {quiz.user?.role === "profesor" ? "Profesor" : "Coleg"}
                        </span>
                        <span style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>
                          {new Date(quiz.createdAt).toLocaleDateString("ro-RO")}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: "1.0625rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: ".5rem",
                          lineHeight: 1.3,
                        }}
                      >
                        {quiz.title}
                      </h3>

                      <p
                        style={{
                          fontSize: ".875rem",
                          color: "var(--text-secondary)",
                          margin: "0 0 1rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {quiz.description || "Fără descriere"}
                      </p>

                      <div className="divider" style={{ margin: ".75rem 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
                          Autor: {quiz.user?.name ?? "Utilizator"}
                        </span>
                        <span
                          className="btn btn-ghost btn-sm"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: ".35rem",
                            padding: ".4rem .85rem",
                            fontSize: ".8125rem",
                            fontWeight: 700,
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          ▶ Explorează
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ── Panou Admin / Profesor (sau vizualizare generală) ─────────────────
  const utilizatori = await prisma.user.findMany({
    include: { quizzes: true, subscriptions: true },
    orderBy: { id: "desc" },
    take: 6,
  });

  const totalUsers   = await prisma.user.count();
  const totalQuizzes = await prisma.quiz.count();
  const activeSubs   = await prisma.subscription.count({ where: { status: "active" } });

  return (
    <div className="page-wrapper">
      <div className="container-wide">
        <Suspense fallback={null}>
          <AccessDeniedAlert searchParams={searchParams} />
        </Suspense>

        {/* ── Hero Admin / Profesor ────────────────────────────────────── */}
        <section
          className="fade-up"
          style={{
            background: "linear-gradient(135deg, var(--brand-600) 0%, var(--accent-500) 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "3.5rem 2.5rem",
            marginBottom: "2.5rem",
            position: "relative",
            overflow: "hidden",
            color: "#fff",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute", top: "-60px", right: "-60px",
              width: "260px", height: "260px",
              borderRadius: "50%",
              background: "rgba(255,255,255,.08)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <span
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,.18)",
                backdropFilter: "blur(8px)",
                borderRadius: "999px",
                padding: ".3rem .9rem",
                fontSize: ".75rem",
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              🎓 StudyBox · Panou de Management
            </span>

            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: ".75rem",
                letterSpacing: "-.03em",
              }}
            >
              {authUser ? `Bun venit, ${authUser.name}!` : "Platformă educațională"}
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                opacity: .85,
                maxWidth: "520px",
                marginBottom: "2rem",
                lineHeight: 1.6,
              }}
            >
              Gestionează utilizatorii, quiz-urile și abonamentele platformei dintr-un singur loc.
            </p>

            <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href="/users"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".5rem",
                  background: "#fff",
                  color: "var(--brand-700)",
                  padding: ".75rem 1.5rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700,
                  fontSize: ".9375rem",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,.18)",
                }}
              >
                👥 Utilizatori
              </Link>
              <Link
                href="/admin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".5rem",
                  background: "rgba(255,255,255,.18)",
                  color: "#fff",
                  padding: ".75rem 1.5rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  fontSize: ".9375rem",
                  textDecoration: "none",
                  border: "1.5px solid rgba(255,255,255,.35)",
                  backdropFilter: "blur(8px)",
                }}
              >
                ⚙️ Panou Admin
              </Link>
              <Link
                href="/quizzes/create"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".5rem",
                  background: "rgba(255,255,255,.18)",
                  color: "#fff",
                  padding: ".75rem 1.5rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  fontSize: ".9375rem",
                  textDecoration: "none",
                  border: "1.5px solid rgba(255,255,255,.35)",
                  backdropFilter: "blur(8px)",
                }}
              >
                📝 + Creează quiz
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats Admin ────────────────────────────────────────────── */}
        <div
          className="fade-up fade-up-1"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "1rem", marginBottom: "2.5rem" }}
        >
          {[
            { label: "Utilizatori înregistrați", value: totalUsers,  icon: "👤", color: "var(--brand-500)"   },
            { label: "Quiz-uri create",           value: totalQuizzes, icon: "📝", color: "var(--accent-500)"  },
            { label: "Abonamente active",         value: activeSubs,  icon: "💳", color: "var(--success-500)" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".75rem" }}>
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "10px",
                    background: `${stat.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <span style={{ fontSize: ".8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {stat.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 900,
                  color: stat.color,
                  lineHeight: 1,
                  letterSpacing: "-.03em",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Utilizatori recenți ───────────────────────────────── */}
        <section className="fade-up fade-up-2">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: 0,
                  letterSpacing: "-.02em",
                }}
              >
                Utilizatori recenți
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: ".875rem", margin: ".25rem 0 0" }}>
                Ultimii {utilizatori.length} utilizatori adăugați în platformă
              </p>
            </div>
            <Link href="/users" className="btn btn-ghost btn-sm">
              Vezi toți →
            </Link>
          </div>

          {utilizatori.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👤</span>
              <p>Nu există utilizatori în baza de date.</p>
              <Link href="/users/create" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Adaugă primul utilizator
              </Link>
            </div>
          ) : (
            <div className="grid-auto">
              {utilizatori.map((user, i) => {
                const initials = user.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                const sub = user.subscriptions[0];

                return (
                  <Link
                    key={user.id}
                    href={`/users/${user.id}`}
                    className={`card fade-up fade-up-${Math.min(i + 1, 4)}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div className="card-body" style={{ padding: "1.375rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: ".875rem", marginBottom: ".875rem" }}>
                        <div className="avatar" style={{ width: "2.75rem", height: "2.75rem", fontSize: ".9rem" }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: ".9375rem",
                              color: "var(--text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {user.name}
                          </div>
                          <div
                            style={{
                              fontSize: ".8125rem",
                              color: "var(--text-muted)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {user.email}
                          </div>
                        </div>
                        <span className={`badge ${user.active ? "badge-success" : "badge-gray"}`}>
                          {user.active ? "Activ" : "Inactiv"}
                        </span>
                      </div>

                      <div className="divider" style={{ margin: ".75rem 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8125rem" }}>
                        <div style={{ color: "var(--text-secondary)" }}>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                            {user.quizzes.length}
                          </span>{" "}
                          quiz{user.quizzes.length !== 1 ? "-uri" : ""}
                        </div>
                        {sub ? (
                          <span className="badge badge-primary">{sub.plan}</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>Fără plan</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
