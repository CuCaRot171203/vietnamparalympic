-- Preserve existing club records; details are optional for existing organizations.
ALTER TABLE "Organization" ADD COLUMN "details" JSONB;
