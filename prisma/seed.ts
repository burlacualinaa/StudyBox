import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "ana.popescu@example.com" },
    update: {},
    create: {
      name: "Ana Popescu",
      email: "ana.popescu@example.com",
      phone: "0712345678",
    },
  });

  const category = await prisma.category.upsert({
    where: { name: "Programare" },
    update: {},
    create: { name: "Programare" },
  });

  const existingQuiz = await prisma.quiz.findFirst({
    where: {
      title: "Quiz de test",
      userId: user.id,
    },
  });

  const quiz =
    existingQuiz ??
    (await prisma.quiz.create({
      data: {
        title: "Quiz de test",
        description: "Primul quiz pentru laborator",
        userId: user.id,
      },
    }));

  console.log("Utilizator:", user.name, "| ID:", user.id);
  console.log("Categorie:", category.name);
  console.log("Quiz:", quiz.title, "| ID:", quiz.id);
}

main()
  .catch((error) => {
    console.error("Eroare la introducerea datelor:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
