
import { SignJWT, jwtVerify } from "jose";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET lipseste sau este prea scurt.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionUser) {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifySession(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    const id = Number(payload.sub);

    if (
      !Number.isInteger(id) ||
      id < 0 ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      id,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      role: payload.role,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}
