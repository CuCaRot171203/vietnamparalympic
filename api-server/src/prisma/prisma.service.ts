import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
    // Club search relies on `unaccent` for diacritic-insensitive matching.
    // The database image does not ship the extension, so enable it on boot.
    // Non-fatal: the search query degrades to a plain ILIKE if it cannot be enabled.
    try {
      await this.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS unaccent`);
    } catch (error) {
      console.warn("Could not enable the unaccent extension:", (error as Error).message);
    }
  }
}
