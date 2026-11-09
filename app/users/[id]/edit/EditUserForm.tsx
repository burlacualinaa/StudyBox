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

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSaving(true);

    const formData = new FormData(event.currentTarget);

    const updatedUser = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      role: String(formData.get("role") ?? "student"),
      active: formData.get("active") === "on",
    };

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Eroare la actualizare.");
      }

      router.push("/users");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "A apărut o eroare."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="mb-6 text-3xl font-bold">
        Editează utilizator
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-4 rounded border bg-white p-6 shadow"
      >
        <div>
          <label htmlFor="name" className="block font-semibold">
            Nume complet
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={user.name}
            required
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            required
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block font-semibold">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            defaultValue={user.phone ?? ""}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="role" className="block font-semibold">
            Rol
          </label>
          <select
            id="role"
            name="role"
            defaultValue={user.role}
            className="w-full rounded border p-2"
          >
            <option value="student">Student</option>
            <option value="profesor">Profesor</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={user.active}
          />
          <label htmlFor="active">
            Utilizator activ
          </label>
        </div>

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Se salvează..." : "Salvează modificările"}
          </button>

          <Link
            href="/users"
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Înapoi
          </Link>
        </div>
      </form>
    </main>
  );
}