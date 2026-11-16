
import {
  PrismaClient,
  Prisma,
  User,
} from "../../app/generated/prisma/client";

const prisma = new PrismaClient();

export type UserWithQuizzes = Prisma.UserGetPayload<{
  include: { quizzes: true };
}>;

export type UserData = {
  name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
};

export interface IUserRepository {
  getAll(): Promise<UserWithQuizzes[]>;
  getById(id: number): Promise<UserWithQuizzes | null>;
  create(data: UserData): Promise<User>;
  update(id: number, data: UserData): Promise<User>;
}

export class UserRepository implements IUserRepository {
  async getAll(): Promise<UserWithQuizzes[]> {
    return prisma.user.findMany({
      include: { quizzes: true },
    });
  }

  async getById(id: number): Promise<UserWithQuizzes | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { quizzes: true },
    });
  }

  async create(data: UserData): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: number, data: UserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
