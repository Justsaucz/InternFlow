import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://internflow:internflow_password@localhost:5432/internflow?schema=public'
});

async function main() {
  console.log('🔄 Adding INTERVIEW_SCHEDULED to ApplicationStatus enum in PostgreSQL...');
  const client = await pool.connect();
  try {
    try {
      await client.query(`ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_SCHEDULED'`);
      console.log('✓ Successfully added enum value: INTERVIEW_SCHEDULED');
    } catch (err: any) {
      if (err.code === '42710') {
        console.log('- Enum value already exists: INTERVIEW_SCHEDULED');
      } else {
        console.warn('! Note on INTERVIEW_SCHEDULED:', err.message);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
