
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateSubscriptionViewModel } from "../../../../lib/CreateSubscriptionViewModel";

const PLAN_OPTIONS = [
  { value: "Basic",   label: "📦 Basic",   price: "29.99",  desc: "Ideal pentru studenți la început de drum" },
  { value: "Premium", label: "⭐ Premium", price: "59.99",  desc: "Acces extins la toate quiz-urile" },
  { value: "Pro",     label: "🚀 Pro",     price: "99.99",  desc: "Acces complet + funcționalități avansate" },
];

export default function CreateSubscriptionForm({
  users,
}: {
  users: CreateSubscriptionViewModel["users"];
}) {
  const router = useRouter();

  const [userId,    setUserId]    = useState(users.length > 0 ? String(users[0].id) : "");
  const [plan,      setPlan]      = useState("Basic");
  const [price,     setPrice]     = useState("29.99");
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [endDate,   setEndDate]   = useState("");
  const [error,     setError]     = useState("");
  const [saving,    setSaving]    = useState(false);

  function handlePlanChange(newPlan: string) {
    setPlan(newPlan);
    const opt = PLAN_OPTIONS.find((o) => o.value === newPlan);
    if (opt) setPrice(opt.price);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:    Number(userId),
          plan,
          price:     Number(price),
          startDate,
          endDate:   endDate || null,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Eroare la salvare.");
      }

      router.push("/admin/subscriptions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută.");
    } finally {
      setSaving(false);
    }
  }

  const selectedPlan = PLAN_OPTIONS.find((o) => o.value === plan)!;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Utilizator */}
      <div className="form-group">
        <label htmlFor="userId" className="form-label">Utilizator</label>
        <select
          id="userId"
          className="form-control"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} — {user.email}
            </option>
          ))}
        </select>
      </div>

      {/* Plan selector */}
      <div className="form-group">
        <label className="form-label">Plan de abonament</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: ".75rem" }}>
          {PLAN_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: ".4rem",
                padding: "1rem",
                background: plan === opt.value ? "var(--brand-50)" : "var(--surface-50)",
                border: `2px solid ${plan === opt.value ? "var(--brand-500)" : "var(--surface-200)"}`,
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                transition: "all var(--transition)",
              }}
            >
              <input
                type="radio"
                name="plan"
                value={opt.value}
                checked={plan === opt.value}
                onChange={() => handlePlanChange(opt.value)}
                style={{ display: "none" }}
              />
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {opt.label}
              </span>
              <span style={{ fontSize: ".8125rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {opt.desc}
              </span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: plan === opt.value ? "var(--brand-600)" : "var(--text-primary)",
                  marginTop: ".2rem",
                }}
              >
                {opt.price} RON
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Preț */}
      <div className="form-group">
        <label htmlFor="price" className="form-label">
          Preț final{" "}
          <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-muted)" }}>
            (RON, editabil)
          </span>
        </label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          className="form-control"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={{ maxWidth: "240px" }}
        />
      </div>

      {/* Date */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">Data începerii</label>
          <input
            id="startDate"
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate" className="form-label">
            Data expirării{" "}
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-muted)" }}>
              (opțional)
            </span>
          </label>
          <input
            id="endDate"
            type="date"
            className="form-control"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary */}
      {userId && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--brand-50)",
            border: "1px solid var(--brand-200)",
            borderRadius: "var(--radius-sm)",
            fontSize: ".875rem",
            color: "var(--brand-700)",
          }}
        >
          <strong>Sumar:</strong> Abonament{" "}
          <strong>{selectedPlan.label}</strong> la{" "}
          <strong>{price} RON</strong>, începând din{" "}
          <strong>{new Date(startDate + "T00:00:00").toLocaleDateString("ro-RO")}</strong>
          {endDate && (
            <>
              {" "}până la{" "}
              <strong>{new Date(endDate + "T00:00:00").toLocaleDateString("ro-RO")}</strong>
            </>
          )}.
        </div>
      )}

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
        <button
          type="submit"
          className="btn btn-success"
          disabled={saving || users.length === 0}
        >
          {saving ? "⏳ Se salvează..." : "✓ Salvează abonamentul"}
        </button>
      </div>
    </form>
  );
}
