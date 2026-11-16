import { NextResponse } from "next/server";
import { addUser } from "../../../lib/userAccessor";
import { userMapper, UserSource } from "../../../lib/UserMapper";
import { UserDTO } from "../../../lib/UserDTO";
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const role = body.role;
    const active = body.active;

    if (
      !name ||
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !["student", "admin"].includes(role) ||
      typeof active !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Datele introduse nu sunt valide." },
        { status: 400 }
      );
    }

    const user = await addUser({
      name,
      email,
      phone,
      role,
      active,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Eroare la adăugarea utilizatorului:", error);

    return NextResponse.json(
      { error: "Utilizatorul nu a putut fi salvat. Verifică dacă emailul există deja." },
      { status: 500 }
    );
  }
}
import { getAllUsers } from "../../../lib/userAccessor";

export async function GET() {
  try {
    const users = await getAllUsers();

   const usersDTO = users.map((user) =>
  userMapper.map(
    Object.assign(new UserSource(), user),
    UserSource,
    UserDTO
  )
);

return NextResponse.json(usersDTO, { status: 200 });
  } catch (error) {
    console.error("Eroare la citirea utilizatorilor:", error);

    return NextResponse.json(
      { error: "Nu s-au putut încărca utilizatorii." },
      { status: 500 }
    );
  }
}