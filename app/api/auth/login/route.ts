import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { hashPassword } from "../../../../lib/auth";

const prisma = new PrismaClient();

// Conturi hardcodate (admin + profesor demo) — nu sunt în DB
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
    const body     = await request.json();
    const email    = String(body.email    ?? "").trim().toLowerCase();
    const password = String(body.password ?? "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email și parola sunt obligatorii." },
        { status: 400 }
      );
    }

    // 1️⃣ Verifică mai întâi conturile hardcodate (admin, profesor demo)
    const hardcoded = HARDCODED_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    );

    if (hardcoded) {
      return buildSuccessResponse({
        id:    0,
        email: hardcoded.email,
        name:  hardcoded.name,
        role:  hardcoded.role,
      });
    }

    // 2️⃣ Verifică utilizatorii înregistrați din baza de date
    const dbUser = await prisma.user.findUnique({ where: { email } });

    if (!dbUser || !dbUser.passwordHash) {
      return NextResponse.json(
        { error: "Email sau parolă incorectă." },
        { status: 401 }
      );
    }

    if (!dbUser.active) {
      return NextResponse.json(
        { error: "Contul tău a fost dezactivat. Contactează un administrator." },
        { status: 403 }
      );
    }

    if (dbUser.passwordHash !== hashPassword(password)) {
      return NextResponse.json(
        { error: "Email sau parolă incorectă." },
        { status: 401 }
      );
    }

    return buildSuccessResponse({
      id:    dbUser.id,
      email: dbUser.email,
      name:  dbUser.name,
      role:  dbUser.role,
    });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Eroare internă." }, { status: 500 });
  }
}

function buildSuccessResponse(user: { id?: number; email: string; name: string; role: string }) {
  const response = NextResponse.json({ success: true });

  response.cookies.set("sb-auth", "sb-authenticated-v1", {
    httpOnly: true,
    path:     "/",
    maxAge:   60 * 60 * 8,
    sameSite: "lax",
  });

  response.cookies.set("sb-user", JSON.stringify(user), {
    httpOnly: true,
    path:     "/",
    maxAge:   60 * 60 * 8,
    sameSite: "lax",
  });

  return response;
}
