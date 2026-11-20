// Funcție de hash SHA-256 cu salt (fără dependențe externe)
import { createHash } from "crypto";

export const SALT = "studybox-2026-secret";

export function hashPassword(password: string): string {
  return createHash("sha256")
    .update(SALT + password)
    .digest("hex");
}
