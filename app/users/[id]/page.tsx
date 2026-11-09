import Link from "next/link";
import { Suspense } from "react";
import { getUserById } from "../../../lib/userAccessor";

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-8">Se încarcă detaliile...</p>}>
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
    return <p className="p-8">ID invalid.</p>;
  }

  // Citim utilizatorul prin accesor
  const user = await getUserById(id);

  if (!user) {
    return <p className="p-8">Utilizatorul nu există.</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="mb-6 text-3xl font-bold">
        Detalii utilizator
      </h1>

      <div className="rounded border bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">
          {user.name}
        </h2>

        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Prenume:</strong> {user.firstName ?? "Nespecificat"}</p>
        <p><strong>Nume:</strong> {user.lastName ?? "Nespecificat"}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Telefon:</strong> {user.phone ?? "Nespecificat"}</p>
        <p><strong>Rol:</strong> {user.role}</p>
        <p>
          <strong>Activ:</strong> {user.active ? "Da" : "Nu"}
        </p>

        <h3 className="mt-6 text-xl font-semibold">
          Quizuri asociate
        </h3>

        {user.quizzes.length === 0 ? (
          <p>Utilizatorul nu are quizuri.</p>
        ) : (
          <ul className="mt-2 list-disc pl-6">
            {user.quizzes.map((quiz) => (
              <li key={quiz.id}>
                <strong>{quiz.title}</strong>
                {" — "}
                {quiz.description ?? "Fără descriere"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          href={`/users/${user.id}/edit`}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Editează
        </Link>

        <Link
          href="/users"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Înapoi la listă
        </Link>
      </div>
    </main>
  );
}