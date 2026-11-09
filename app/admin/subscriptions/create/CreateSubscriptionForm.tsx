
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateSubscriptionViewModel } from "../../../../lib/CreateSubscriptionViewModel";

export default function CreateSubscriptionForm({
  users,
}: {
  users: CreateSubscriptionViewModel["users"];
}) {
  const router = useRouter();

  const [userId, setUserId] = useState(
    users.length > 0 ? String(users[0].id) : ""
  );
  const [plan, setPlan] = useState("Basic");
  const [price, setPrice] = useState("0");
  const [startDate, setStartDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          plan,
          price: Number(price),
          startDate,
          endDate: endDate || null,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Eroare la salvare.");
      }

      router.push("/admin/subscriptions");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Eroare necunoscută."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Utilizator</label>
        <select
          className="form-select"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Plan</label>
        <select
          className="form-select"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="Basic">Basic</option>
          <option value="Premium">Premium</option>
          <option value="Pro">Pro</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Preț (RON)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="form-control"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Data începerii</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Data expirării (opțional)</label>
        <input
          type="date"
          className="form-control"
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {error && <p className="text-danger">{error}</p>}

      <button
        type="submit"
        className="btn btn-success"
        disabled={saving || users.length === 0}
      >
        {saving ? "Se salvează..." : "Salvează abonamentul"}
      </button>
    </form>
  );
}
