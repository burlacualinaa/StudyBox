-- Coloane adaugate anterior in baza de date de Antigravity
ALTER TABLE "Quiz" ADD COLUMN "questions" JSONB;
ALTER TABLE "Quiz" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
