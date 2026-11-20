import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { hashPassword } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name     = String(body.name     ?? "").trim();
    const email    = String(body.email    ?? "").trim().toLowerCase();
    const password = String(body.password ?? "").trim();
    const phone    = String(body.phone    ?? "").trim();

    // Validări
    if (!name)     return NextResponse.json({ error: "Numele este obligatoriu." },  { status: 400 });
    if (!email)    return NextResponse.json({ error: "Email-ul este obligatoriu." }, { status: 400 });
    if (!password) return NextResponse.json({ error: "Parola este obligatorie." },   { status: 400 });
    if (password.length < 4) {
      return NextResponse.json({ error: "Parola trebuie să aibă cel puțin 4 caractere." }, { status: 400 });
    }

    // Verifică dacă email-ul există deja
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Există deja un cont cu acest email." },
        { status: 409 }
      );
    }

    // Creează utilizatorul cu parola hash-uită
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone:        phone || null,
        role:         "student",
        active:       true,
        passwordHash: hashPassword(password),
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Eroare internă la înregistrare." }, { status: 500 });
  }
}
