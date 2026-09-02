import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://internflow:internflow_password@localhost:5432/internflow?schema=public'
});

async function main() {
  console.log('🔄 Applying non-destructive database migration...');
  
  // In Postgres, ALTER TYPE ADD VALUE cannot run inside a multi-statement transaction block
  const client = await pool.connect();
  try {
    const enumValues = ['COMMITTED', 'CANCEL_REQUESTED', 'CANCELLED'];
    for (const val of enumValues) {
      try {
        await client.query(`ALTER TYPE "ApplicationStatus" ADD VALUE '${val}'`);
        console.log(`✓ Added enum value: ${val}`);
      } catch (err: any) {
        if (err.code === '42710') {
          console.log(`- Enum value already exists: ${val}`);
        } else {
          console.warn(`! Note on ${val}:`, err.message);
        }
      }
    }

    await client.query(`ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT`);
    console.log('✓ Added column: cancellationReason');
    console.log('✅ Migration finished successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
