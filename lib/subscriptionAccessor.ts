import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

// Index - toate abonamentele și utilizatorii lor
export async function getAllSubscriptions() {
  return await prisma.subscription.findMany({
    include: {
      user: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}

// Utilizatorii disponibili pentru formularul Create
export async function getUsersForSubscription() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

// Create - adăugarea unui abonament
export async function addSubscription(data: {
  userId: number;
  plan: string;
  price: number;
  startDate: Date;
  endDate: Date | null;
}) {
  return await prisma.subscription.create({
    data: {
      userId: data.userId,
      plan: data.plan,
      price: data.price,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "active",
    },
  });
}