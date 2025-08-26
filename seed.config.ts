import { SeedPg } from "@snaplet/seed/adapter-pg";
import { defineConfig } from "@snaplet/seed/config";
import { Client } from "pg";

export default defineConfig({
  adapter: async () => {
    const client = new Client({
      host: "localhost",
      port: 54322,
      user: "postgres",
      password: "postgres",
      database: "postgres",
    });
    await client.connect();
    return new SeedPg(client);
  },
});