import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/core/database/schema.ts',
  out: './src/core/database/migrations/',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL ?? ""
  },
});