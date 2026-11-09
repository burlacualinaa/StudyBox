import Link from "next/link";
import { Suspense } from "react";
import { getAllUsers } from "../../lib/userAccessor";

// Pagina principală - Index
export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-gray-900">
          Se încarcă utilizatorii...
        </p>
      }
    >
      <UsersList />
    </Suspense>
  );
}

// Componenta care citește utilizatorii prin accesor
async function UsersList() {
  const utilizatori = await getAllUsers();

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="mb-6 text-3xl font-bold">
        Lista utilizatorilor
      </h1>

      <Link
        href="/users/create"
        className="mb-6 inline-block rounded bg-blue-600 px-4 py-2 text-white"
      >
        Adaugă utilizator
      </Link>

      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-3">ID</th>
            <th className="border p-3">Nume</th>
            <th className="border p-3">Email</th>
            <th className="border p-3">Telefon</th>
            <th className="border p-3">Quizuri</th>
            <th className="border p-3">Acțiuni</th>
          </tr>
        </thead>

        <tbody>
          {utilizatori.map((user) => (
            <tr key={user.id}>
              <td className="border p-3">{user.id}</td>
              <td className="border p-3">{user.name}</td>
              <td className="border p-3">{user.email}</td>
              <td className="border p-3">
                {user.phone ?? "Nespecificat"}
              </td>
              <td className="border p-3">
                {user.quizzes.length}
              </td>
              <td className="border p-3">
                <Link
                  href={`/users/${user.id}`}
                  className="mr-3 text-blue-600"
                >
                  Detalii
                </Link>

                <Link
                  href={`/users/${user.id}/edit`}
                  className="text-green-600"
                >
                  Editează
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {utilizatori.length === 0 && (
        <p className="mt-4">Nu există utilizatori.</p>
      )}
    </main>
  );
}