import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../app/generated/prisma/client";
import { getAuthenticatedUser } from "../../../../lib/notifications";

const prisma = new PrismaClient();

// PATCH - Marchează o singură notificare ca citită
export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Autentificare necesară." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const notificationId = Number(id);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return NextResponse.json(
        { error: "ID notificare invalid." },
        { status: 400 }
      );
    }

    // Verificăm dacă notificarea există și aparține utilizatorului autentificat
    const existing = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Notificarea nu a fost găsită sau nu îți aparține." },
        { status: 404 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      notification: updated,
    });
  } catch (error) {
    console.error("[PATCH /api/notifications/[id]]", error);
    return NextResponse.json(
      { error: "A apărut o eroare la actualizarea notificării." },
      { status: 500 }
    );
  }
}

// DELETE - HARD DELETE: Șterge definitiv o singură notificare din baza de date
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Autentificare necesară." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const notificationId = Number(id);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return NextResponse.json(
        { error: "ID notificare invalid." },
        { status: 400 }
      );
    }

    // Verificăm apartenența la utilizatorul autentificat înainte de ștergere
    const existing = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Notificarea nu a fost găsită sau nu ai permisiunea să o ștergi." },
        { status: 404 }
      );
    }

    // Hard delete - ștergere fizică definitivă din PostgreSQL
    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notificarea a fost ștearsă definitiv.",
      id: notificationId,
    });
  } catch (error) {
    console.error("[DELETE /api/notifications/[id]]", error);
    return NextResponse.json(
      { error: "A apărut o eroare la ștergerea notificării." },
      { status: 500 }
    );
  }
}
