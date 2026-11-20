
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function CreateUserPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(event.currentTarget);

    const user = {
      name:   String(formData.get("name")  ?? "").trim(),
      email:  String(formData.get("email") ?? "").trim(),
      phone:  String(formData.get("phone") ?? "").trim(),
      role:   String(formData.get("role")  ?? "student"),
      active: formData.get("active") === "on",
    };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Eroare la salvare.");
      }

      router.push("/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container-narrow">

        {/* Back link */}
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
            transition: "color var(--transition)",
          }}
        >
          ← Înapoi la utilizatori
        </Link>

        {/* Page header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <span style={{ display: "block", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--brand-500)", marginBottom: ".4rem" }}>
            Utilizatori
          </span>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 .4rem", letterSpacing: "-.03em", color: "var(--text-primary)" }}>
            Adaugă utilizator
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Completează detaliile pentru a înregistra un utilizator nou.
          </p>
        </div>

        {/* Form card */}
        <div className="card fade-up fade-up-1">
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Nume */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">Nume complet</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="ex. Ana Ionescu"
                  className="form-control"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Adresă email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="ex. ana.ionescu@email.com"
                  className="form-control"
                />
              </div>

              {/* Telefon */}
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
                  placeholder="ex. +40 721 000 000"
                  className="form-control"
                />
              </div>

              {/* Rol */}
              <div className="form-group">
                <label htmlFor="role" className="form-label">Rol în platformă</label>
                <select id="role" name="role" defaultValue="student" className="form-control">
                  <option value="student">📚 Student</option>
                  <option value="profesor">🎓 Profesor</option>
                </select>
              </div>

              {/* Activ */}
              <label className="form-check">
                <input id="active" name="active" type="checkbox" defaultChecked />
                <span className="form-check-label">Cont activ</span>
              </label>

              {/* Error */}
              {error && (
                <div className="alert alert-error" role="alert">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: ".75rem",
                  paddingTop: ".5rem",
                  borderTop: "1px solid var(--surface-200)",
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-success"
                >
                  {saving ? "⏳ Se salvează..." : "✓ Salvează utilizatorul"}
                </button>
                <Link href="/users" className="btn btn-ghost">
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
