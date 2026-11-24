import { NextResponse } from "next/server";
import { PrismaClient } from "../../../app/generated/prisma/client";
import { getAuthenticatedUser } from "../../../lib/notifications";

const prisma = new PrismaClient();

// GET - Listează toate notificările utilizatorului autentificat
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Autentificare necesară pentru accesarea notificărilor." },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json(
      { error: "A apărut o eroare la încărcarea notificărilor." },
      { status: 500 }
    );
  }
}

// PATCH - Marchează toate notificările ca citite
export async function PATCH() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Autentificare necesară." },
        { status: 401 }
      );
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("[PATCH /api/notifications]", error);
    return NextResponse.json(
      { error: "Nu s-au putut actualiza notificările." },
      { status: 500 }
    );
  }
}

// DELETE - HARD DELETE: Șterge definitiv TOATE notificările utilizatorului autentificat
export async function DELETE() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Autentificare necesară." },
        { status: 401 }
      );
    }

    // Hard delete folosind Prisma deleteMany pe tabela Notification
    const result = await prisma.notification.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Au fost șterse definitiv ${result.count} notificări.`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("[DELETE /api/notifications]", error);
    return NextResponse.json(
      { error: "A apărut o eroare la ștergerea notificărilor." },
      { status: 500 }
    );
  }
}
