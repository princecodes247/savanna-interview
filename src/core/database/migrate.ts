import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './schema';
;

async function startMigration() {
    // This will run migrations on the database, skipping the ones already applied
    await migrate(db, { migrationsFolder: 'src/core/database/migrations' });

    // Don't forget to close the connection, otherwise the script will hang
    await pool.end();
}
startMigration()