
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
};

export default function EditUserForm({ user }: { user: User }) {
  const router = useRouter();
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(event.currentTarget);

    const updatedUser = {
      name:   String(formData.get("name")  ?? "").trim(),
      email:  String(formData.get("email") ?? "").trim(),
      phone:  String(formData.get("phone") ?? "").trim(),
      role:   String(formData.get("role")  ?? "student"),
      active: formData.get("active") === "on",
    };

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Eroare la actualizare.");
      }

      router.push("/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setSaving(false);
    }
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="page-wrapper">
      <div className="container-narrow">

        {/* Back */}
        <Link
          href={`/users/${user.id}`}
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
          ← Înapoi la profil
        </Link>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <span style={{ display: "block", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--brand-500)", marginBottom: ".4rem" }}>
            Editare
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="avatar" style={{ width: "3rem", height: "3rem", fontSize: "1rem" }}>
              {initials}
            </div>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: "0 0 .2rem", letterSpacing: "-.03em", color: "var(--text-primary)" }}>
                {user.name}
              </h1>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: ".875rem" }}>
                Editează informațiile utilizatorului
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card fade-up fade-up-1">
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              <div className="form-group">
                <label htmlFor="name" className="form-label">Nume complet</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={user.name}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Adresă email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Telefon{" "}
                  <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-muted)" }}>
                    (opțional)
                  </span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  defaultValue={user.phone ?? ""}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Rol în platformă</label>
                <select id="role" name="role" defaultValue={user.role} className="form-control">
                  <option value="student">📚 Student</option>
                  <option value="profesor">🎓 Profesor</option>
                </select>
              </div>

              <label className="form-check">
                <input id="active" name="active" type="checkbox" defaultChecked={user.active} />
                <span className="form-check-label">Cont activ</span>
              </label>

              {error && (
                <div className="alert alert-error" role="alert">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: ".75rem",
                  paddingTop: ".5rem",
                  borderTop: "1px solid var(--surface-200)",
                }}
              >
                <button type="submit" disabled={saving} className="btn btn-success">
                  {saving ? "⏳ Se salvează..." : "✓ Salvează modificările"}
                </button>
                <Link href={`/users/${user.id}`} className="btn btn-ghost">
                  Anulează
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
