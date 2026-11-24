import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "../../generated/prisma/client";
import { createNotification } from "../../../lib/notifications";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userCookie  = cookieStore.get("sb-user");

    if (!userCookie) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat pentru a crea un quiz." },
        { status: 401 }
      );
    }

    let authUser: { id?: number; email?: string } | null = null;
    try {
      authUser = JSON.parse(userCookie.value);
    } catch {
      return NextResponse.json({ error: "Sesiune invalidă." }, { status: 401 });
    }

    const body = await request.json();
    const title       = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const isPublic    = body.isPublic !== undefined ? Boolean(body.isPublic) : true;
    const questions   = Array.isArray(body.questions) && body.questions.length > 0
      ? body.questions
      : null;

    if (!title) {
      return NextResponse.json(
        { error: "Titlul quiz-ului este obligatoriu." },
        { status: 400 }
      );
    }

    // Găsim utilizatorul în baza de date
    let dbUser = authUser?.id
      ? await prisma.user.findUnique({ where: { id: authUser.id } })
      : null;

    if (!dbUser && authUser?.email) {
      dbUser = await prisma.user.findUnique({ where: { email: authUser.email } });
    }

    // Dacă este contul hardcoded de admin (id: 0), îl asociem cu primul admin din DB sau cu primul utilizator
    if (!dbUser) {
      dbUser = await prisma.user.findFirst();
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Nu a fost găsit un utilizator valid pentru asocierea quiz-ului." },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || null,
        questions: questions ?? undefined,
        isPublic,
        userId: dbUser.id,
      },
    });

    const isPdfSource = body.source === "pdf" || Boolean(body.isFromPdf);

    // Notificare automată: Crearea unui quiz
    await createNotification({
      userId: dbUser.id,
      title: isPdfSource ? "Quiz salvat din PDF" : "Quiz manual creat cu succes",
      message: `Quiz-ul «${quiz.title}» a fost salvat cu succes (${isPublic ? "vizibil în comunitate" : "privat în contul tău"}).`,
      type: "success",
      link: `/quizzes/${quiz.id}`,
    });

    return NextResponse.json({ success: true, quiz }, { status: 201 });
  } catch (err) {
    console.error("[create-quiz]", err);
    return NextResponse.json(
      { error: "A apărut o eroare la salvarea quiz-ului." },
      { status: 500 }
    );
  }
}
