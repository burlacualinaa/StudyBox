
import { NextResponse } from "next/server";
import {
  updateUser,
  getUserById,
  deleteUser,
} from "../../../../lib/userAccessor";
import { userMapper, UserSource } from "../../../../lib/UserMapper";
import { UserDTO } from "../../../../lib/UserDTO";

// PUT - Actualizare utilizator
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "ID-ul utilizatorului este invalid." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const role = body.role;
    const active = body.active;

    if (
      !name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !["student", "admin"].includes(role) ||
      typeof active !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Datele introduse nu sunt valide." },
        { status: 400 }
      );
    }

    const user = await updateUser(userId, {
      name,
      email,
      phone,
      role,
      active,
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Eroare la actualizarea utilizatorului:", error);

    return NextResponse.json(
      { error: "Utilizatorul nu a putut fi actualizat." },
      { status: 500 }
    );
  }
}

// GET - Obtinere utilizator dupa ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "ID invalid." },
        { status: 400 }
      );
    }

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu exista sau a fost sters." },
        { status: 404 }
      );
    }

    const userDTO = userMapper.map(
      Object.assign(new UserSource(), user),
      UserSource,
      UserDTO
    );

    return NextResponse.json(userDTO, { status: 200 });
  } catch (error) {
    console.error("Eroare la citirea utilizatorului:", error);

    return NextResponse.json(
      { error: "Nu s-au putut incarca detaliile." },
      { status: 500 }
    );
  }
}

// DELETE - Stergere logica (Soft Delete)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "ID invalid." },
        { status: 400 }
      );
    }

    const user = await deleteUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu exista sau a fost deja sters." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Utilizator sters logic cu succes.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Eroare la stergerea utilizatorului:", error);

    return NextResponse.json(
      { error: "Nu s-a putut sterge utilizatorul." },
      { status: 500 }
    );
  }
}
