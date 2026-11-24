import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "../../../generated/prisma/client";
import { createNotification } from "../../../../lib/notifications";

const prisma = new PrismaClient();

const PLAN_PRICES: Record<string, number> = {
  Gratuit: 0,
  Basic: 29.99,
  Premium: 59.99,
  Pro: 99.99,
};

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("sb-user");
  if (!userCookie) return null;

  try {
    const parsed = JSON.parse(userCookie.value) as { id?: number; email?: string };
    let dbUser = parsed.id && parsed.id > 0
      ? await prisma.user.findUnique({ where: { id: parsed.id } })
      : null;

    if (!dbUser && parsed.email) {
      dbUser = await prisma.user.findUnique({ where: { email: parsed.email } });
    }

    if (!dbUser) {
      // Fallback dacă este contul demo
      dbUser = await prisma.user.findFirst();
    }

    return dbUser;
  } catch {
    return null;
  }
}

// GET - returnează abonamentul curent al utilizatorului conectat
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
    }

    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "active",
      },
      orderBy: { id: "desc" },
    });

    if (!activeSub) {
      return NextResponse.json({
        plan: "Gratuit",
        price: 0,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: null,
      });
    }

    return NextResponse.json(activeSub);
  } catch (error) {
    console.error("[get-my-plan]", error);
    return NextResponse.json({ error: "Eroare la citirea planului." }, { status: 500 });
  }
}

// POST - utilizatorul își actualizează singur planul (Gratuit, Basic, Premium, Pro)
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Trebuie să fii autentificat." }, { status: 401 });
    }

    const body = await request.json();
    const plan = String(body.plan ?? "").trim();

    if (!["Gratuit", "Basic", "Premium", "Pro"].includes(plan)) {
      return NextResponse.json(
        { error: "Planul selectat nu este valid. Alege Gratuit, Basic, Premium sau Pro." },
        { status: 400 }
      );
    }

    const price = PLAN_PRICES[plan] ?? 0;
    const startDate = new Date();
    const endDate = plan === "Gratuit"
      ? null
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 zile

    // Dezactivăm abonamentele vechi active ale utilizatorului
    await prisma.subscription.updateMany({
      where: {
        userId: user.id,
        status: "active",
      },
      data: {
        status: "inactive",
      },
    });

    // Creăm noul abonament selectat
    const newSub = await prisma.subscription.create({
      data: {
        userId: user.id,
        plan,
        price,
        status: "active",
        startDate,
        endDate,
      },
    });

    // Notificare automată: Schimbarea cu succes a planului de abonament
    await createNotification({
      userId: user.id,
      title: "Plan de abonament actualizat",
      message: `Ai trecut cu succes la planul «${plan}»${price > 0 ? ` (${price} RON/lună)` : " (Gratuit)"}.`,
      type: "success",
      link: "/subscription",
    });

    return NextResponse.json({
      success: true,
      message: `Planul tău a fost actualizat la "${plan}".`,
      subscription: newSub,
    });
  } catch (error) {
    console.error("[update-my-plan]", error);
    return NextResponse.json(
      { error: "A apărut o eroare la actualizarea planului." },
      { status: 500 }
    );
  }
}
