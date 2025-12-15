import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: postgres.Sql | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL environment variable is not set");
  }

  if (!client) {
    const connectionString = process.env.POSTGRES_URL;
    client = postgres(connectionString, { max: 1 });
    dbInstance = drizzle(client, { schema });
  }

  return dbInstance!;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});
