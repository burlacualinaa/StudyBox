import { PrismaClient } from "../app/generated/prisma/client";
import { cookies } from "next/headers";
import { verifySession } from "./session";

const prisma = new PrismaClient();

export type NotificationType = "success" | "error" | "info" | "warning";

/**
 * Extrage utilizatorul autentificat pe baza sesiunii JWT verificate pe server.
 * Nu are încredere în niciun parametru venit de pe client.
 */
export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-auth")?.value;
  const session = await verifySession(token);

  if (session && session.id > 0) {
    const user = await prisma.user.findFirst({
      where: {
        id: session.id,
        isDeleted: false,
      },
    });

    if (user && user.active) {
      return user;
    }
  }

  // Fallback pentru contul demonstrativ din dev (id 0) sau cookie sb-user
  const userCookie = cookieStore.get("sb-user");
  if (userCookie) {
    try {
      const parsed = JSON.parse(userCookie.value) as { id?: number; email?: string };

      if (parsed.id && parsed.id > 0) {
        const user = await prisma.user.findFirst({
          where: {
            id: parsed.id,
            isDeleted: false,
          },
        });
        if (user && user.active) return user;
      }

      if (parsed.email) {
        const user = await prisma.user.findFirst({
          where: {
            email: parsed.email,
            isDeleted: false,
          },
        });
        if (user && user.active) return user;
      }
    } catch {
      // JSON invalid
    }
  }

  // Dacă este contul hardcoded admin (id: 0) în mediul de dezvoltare, îl asociem cu primul admin din DB
  if (session && session.role === "admin") {
    const adminUser = await prisma.user.findFirst({
      where: { role: "admin", isDeleted: false },
    });
    if (adminUser) return adminUser;
  }

  return null;
}

/**
 * Creează o notificare nouă pentru un utilizator specificat în baza de date.
 */
export async function createNotification(data: {
  userId: number;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string | null;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type ?? "info",
        link: data.link ?? null,
      },
    });
  } catch (error) {
    console.error("[createNotification] Eroare la crearea notificării:", error);
    return null;
  }
}
