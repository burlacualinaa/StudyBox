
import Link from "next/link";
import { Suspense } from "react";
import { getUserById } from "../../../lib/userAccessor";

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="page-wrapper">
          <div className="container-narrow">
            <div className="skeleton" style={{ height: "240px", borderRadius: "var(--radius-lg)" }} />
          </div>
        </div>
      }
    >
      <UserDetailsLoader params={params} />
    </Suspense>
  );
}

async function UserDetailsLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetails id={Number(id)} />;
}

async function UserDetails({ id }: { id: number }) {
  if (!Number.isInteger(id) || id <= 0) {
    return (
      <div className="page-wrapper">
        <div className="container-narrow">
          <div className="alert alert-error">⚠️ ID invalid.</div>
        </div>
      </div>
    );
  }

  const user = await getUserById(id);

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container-narrow">
          <div className="alert alert-error">⚠️ Utilizatorul nu există.</div>
          <Link href="/users" className="btn btn-ghost" style={{ marginTop: "1rem" }}>
            ← Înapoi la utilizatori
          </Link>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="page-wrapper">
      <div className="container-narrow">

        {/* Back */}
        <Link
          href="/users"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: ".4rem",
            fontSize: ".875rem",
            color: "var(--text-secondary)",
            textDecoration: "none",
            marginBottom: "1.75rem",
            fontWeight: 500,
          }}
        >
          ← Înapoi la utilizatori
        </Link>

        {/* Profile card */}
        <div className="card fade-up" style={{ marginBottom: "1.25rem" }}>
          <div className="card-body">
            {/* Avatar + name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                marginBottom: "1.75rem",
                flexWrap: "wrap",
              }}
            >
              <div
                className="avatar"
                style={{ width: "4rem", height: "4rem", fontSize: "1.25rem" }}
              >
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <h1
                  style={{
                    fontSize: "1.625rem",
                    fontWeight: 900,
                    margin: "0 0 .25rem",
                    letterSpacing: "-.03em",
                    color: "var(--text-primary)",
                  }}
                >
                  {user.name}
                </h1>
                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <span className={`badge ${user.role === "profesor" ? "badge-purple" : "badge-primary"}`}>
                    {user.role === "profesor" ? "🎓 Profesor" : "📚 Student"}
                  </span>
                  <span className={`badge ${user.active ? "badge-success" : "badge-danger"}`}>
                    {user.active ? "✓ Activ" : "✕ Inactiv"}
                  </span>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Info grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.25rem",
                margin: "1.5rem 0",
              }}
            >
              {[
                { label: "ID", value: `#${user.id}`, icon: "🔖" },
                { label: "Email", value: user.email, icon: "✉️" },
                { label: "Telefon", value: user.phone ?? "–", icon: "📞" },
                { label: "Prenume", value: user.firstName ?? "–", icon: "👤" },
                { label: "Nume de familie", value: user.lastName ?? "–", icon: "👤" },
              ].map((field) => (
                <div
                  key={field.label}
                  style={{
                    padding: "1rem",
                    background: "var(--surface-50)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--surface-200)",
                  }}
                >
                  <div
                    style={{
                      fontSize: ".7rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      marginBottom: ".35rem",
                    }}
                  >
                    {field.icon} {field.label}
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: ".9375rem" }}>
                    {field.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />

            {/* Quizzes */}
            <div style={{ marginTop: "1.5rem" }}>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: ".5rem",
                }}
              >
                📝 Quiz-uri asociate
                <span className="badge badge-primary">{user.quizzes.length}</span>
              </h2>

              {user.quizzes.length === 0 ? (
                <div
                  style={{
                    padding: "1.5rem",
                    textAlign: "center",
                    background: "var(--surface-50)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px dashed var(--surface-300)",
                    color: "var(--text-muted)",
                    fontSize: ".9rem",
                  }}
                >
                  Niciun quiz asociat acestui utilizator.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: ".625rem" }}>
                  {user.quizzes.map((quiz: { id: number; title: string; description: string | null }) => (
                    <div
                      key={quiz.id}
                      style={{
                        padding: ".875rem 1rem",
                        background: "var(--surface-50)",
                        border: "1px solid var(--surface-200)",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        gap: ".75rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>📋</span>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: ".9375rem" }}>
                          {quiz.title}
                        </div>
                        {quiz.description && (
                          <div style={{ fontSize: ".8125rem", color: "var(--text-muted)", marginTop: ".2rem" }}>
                            {quiz.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="fade-up fade-up-1" style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
          <Link href={`/users/${user.id}/edit`} className="btn btn-primary">
            ✏️ Editează utilizatorul
          </Link>
          <Link href="/users" className="btn btn-ghost">
            ← Înapoi
          </Link>
        </div>
      </div>
    </div>
  );
}
