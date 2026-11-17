-- Additive migration: existing sports and their descriptions remain unchanged.
ALTER TABLE "Sport" ADD COLUMN IF NOT EXISTS "thumbnail" TEXT;
