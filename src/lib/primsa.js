import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/index.js";
import { PrismaClient } from "../generated/prisma/index.js";

const databaseUrl = config.database_url;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in the .env file");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
  max: 5,
});

const prisma = new PrismaClient({
  adapter,
});

export { prisma };
