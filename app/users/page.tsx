
import Link from "next/link";
import { Suspense } from "react";
import { getAllUsers } from "../../lib/userAccessor";

export default function UsersPage() {
  return (
    <div className="page-wrapper">
      <div className="container-wide">
        <Suspense
          fallback={
            <div style={{ padding: "3rem 0" }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: "52px", marginBottom: ".75rem", borderRadius: "var(--radius-sm)" }}
                />
              ))}
            </div>
          }
        >
          <UsersList />
        </Suspense>
      </div>
    </div>
  );
}

async function UsersList() {
  const utilizatori = await getAllUsers();

  return (
    <>
      {/* Header */}
      <div
        className="fade-up"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "2rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="eyebrow" style={{ display: "block", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--brand-500)", marginBottom: ".4rem" }}>
            Platformă educațională
          </span>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 900,
              color: "var(--text-primary)",
              margin: "0 0 .4rem",
              letterSpacing: "-.03em",
            }}
          >
            Utilizatori
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: ".9375rem" }}>
            {utilizatori.length} {utilizatori.length === 1 ? "utilizator înregistrat" : "utilizatori înregistrați"} în platformă
          </p>
        </div>
        <Link href="/users/create" className="btn btn-primary">
          + Adaugă utilizator
        </Link>
      </div>

      {utilizatori.length === 0 ? (
        <div className="empty-state fade-up fade-up-1">
          <span className="empty-icon">👥</span>
          <p>Nu există utilizatori înregistrați.</p>
          <Link href="/users/create" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Adaugă primul utilizator
          </Link>
        </div>
      ) : (
        <div className="table-wrap fade-up fade-up-1">
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilizator</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>Quiz-uri</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {utilizatori.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((w: string) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                        <div className="avatar">{initials}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: ".9375rem" }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>
                            #{user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: ".875rem" }}>
                      {user.email}
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: ".875rem" }}>
                      {user.phone ?? (
                        <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>–</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${user.role === "profesor" ? "badge-purple" : "badge-primary"}`}>
                        {user.role === "profesor" ? "🎓 Profesor" : "📚 Student"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: ".35rem",
                          fontWeight: 600,
                          color: user.quizzes.length > 0 ? "var(--brand-600)" : "var(--text-muted)",
                        }}
                      >
                        {user.quizzes.length > 0 ? "📝" : "○"} {user.quizzes.length}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.active ? "badge-success" : "badge-danger"}`}>
                        {user.active ? "✓ Activ" : "✕ Inactiv"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
                        <Link
                          href={`/users/${user.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Detalii
                        </Link>
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="btn btn-primary btn-sm"
                        >
                          Editează
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
