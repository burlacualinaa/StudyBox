
import { PrismaClient } from "./generated/prisma/client";
export const instant = false;
const prisma = new PrismaClient();

export default async function Home() {
  const utilizatori = await prisma.user.findMany({
    include: {
      quizzes: true,
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="mb-6 text-3xl font-bold">
        Platformă educațională
      </h1>

      <h2 className="mb-4 text-2xl font-semibold">
        Utilizatori și quizuri
      </h2>

      {utilizatori.length === 0 ? (
        <p>Nu există utilizatori în baza de date.</p>
      ) : (
        <div className="space-y-4">
          {utilizatori.map((utilizator) => (
            <section
              key={utilizator.id}
              className="rounded-lg border bg-white p-5 shadow-sm"
            >
              <h3 className="text-xl font-bold">
  {utilizator.name}
</h3>

<p>Prenume: {utilizator.firstName ?? "Nespecificat"}</p>
<p>Nume: {utilizator.lastName ?? "Nespecificat"}</p>

              <p>Email: {utilizator.email}</p>
              <p>Telefon: {utilizator.phone ?? "Nespecificat"}</p>

              <h4 className="mt-4 font-semibold">Quizuri:</h4>

              {utilizator.quizzes.length === 0 ? (
                <p>Acest utilizator nu are quizuri.</p>
              ) : (
                <ul className="list-disc pl-6">
                  {utilizator.quizzes.map((quiz) => (
                    <li key={quiz.id}>
                      <strong>{quiz.title}</strong>
                      {" — "}
                      {quiz.description ?? "Fără descriere"}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
