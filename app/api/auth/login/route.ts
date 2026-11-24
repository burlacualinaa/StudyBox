
import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { hashPassword } from "../../../../lib/auth";
import { createSession } from "../../../../lib/session";

const prisma = new PrismaClient();

// Conturi demo - doar pentru dezvoltare
const HARDCODED_ACCOUNTS = [
  {
    email: "admin@example.com",
    password: "admin",
    name: "Administrator",
    role: "admin",
  },
  {
    email: "profesor@studybox.ro",
    password: "profesor123",
    name: "Prof. Ionescu",
    role: "profesor",
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    if (!email || !password.trim()) {
      return NextResponse.json(
        { error: "Email și parola sunt obligatorii." },
        { status: 400 }
      );
    }

    // 1. Autentificarea conturilor demo
    // Aceste conturi nu trebuie folosite in productie.
    if (process.env.NODE_ENV !== "production") {
      const hardcoded = HARDCODED_ACCOUNTS.find(
        (account) =>
          account.email === email &&
          account.password === password
      );

      if (hardcoded) {
        return await buildSuccessResponse({
          id: 0,
          email: hardcoded.email,
          name: hardcoded.name,
          role: hardcoded.role,
        });
      }
    }

    // 2. Cautam utilizatorul in baza de date
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser || !dbUser.passwordHash) {
      return NextResponse.json(
        { error: "Email sau parolă incorectă." },
        { status: 401 }
      );
    }

    // LAB 9 - Soft Delete
    // Un utilizator sters logic nu se poate autentifica.
    if (dbUser.isDeleted) {
      return NextResponse.json(
        { error: "Acest cont a fost șters." },
        { status: 403 }
      );
    }

    // Verificam daca utilizatorul este activ
    if (!dbUser.active) {
      return NextResponse.json(
        {
          error:
            "Contul tău a fost dezactivat. Contactează un administrator.",
        },
        { status: 403 }
      );
    }

    // Verificam parola
    if (dbUser.passwordHash !== hashPassword(password)) {
      return NextResponse.json(
        { error: "Email sau parolă incorectă." },
        { status: 401 }
      );
    }

    // Autentificare reusita
    return await buildSuccessResponse({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    });
  } catch (error) {
    console.error("[login]", error);

    return NextResponse.json(
      { error: "Eroare internă la autentificare." },
      { status: 500 }
    );
  }
}

// Creeaza un token de sesiune semnat criptografic
async function buildSuccessResponse(user: {
  id: number;
  email: string;
  name: string;
  role: string;
}) {
  const token = await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const response = NextResponse.json({
    success: true,
  });

  // Cookie securizat, verificabil pe server
  response.cookies.set("sb-auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  // Pastrat pentru compatibilitatea cu interfata existenta.
  // NU trebuie folosit pentru verificarea permisiunilor.
  response.cookies.set("sb-user", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
