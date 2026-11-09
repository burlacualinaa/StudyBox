import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

export async function getAllUsers() {
  return await prisma.user.findMany({
    include: {
      quizzes: true,
    },
  });
}

export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      quizzes: true,
    },
  });
}

export async function addUser(data: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
}) {
  return await prisma.user.create({
    data,
  });
}

export async function updateUser(
  id: number,
  data: {
    name: string;
    email: string;
    phone?: string;
    role: string;
    active: boolean;
  }
) {
  return await prisma.user.update({
    where: { id },
    data,
  });
}