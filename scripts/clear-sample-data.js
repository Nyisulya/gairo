import 'dotenv/config';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const useSSL = process.env.PGSSL === 'true' || 
               process.env.PGSSLMODE === 'require' || 
               (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'));

const poolConfig = (process.env.DATABASE_URL || process.env.POSTGRES_URL)
  ? {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    }
  : {
      user: process.env.PGUSER || 'gairo_user',
      host: process.env.PGHOST || 'localhost',
      password: process.env.PGPASSWORD || 'GairoSec2026!',
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE || 'gairo',
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    };

const pool = new pg.Pool(poolConfig);

async function clearSampleData() {
  console.log("🧹 Inasafisha maswali na kazi zote za sampuli zilizokuwepo kwenye PostgreSQL...");
  const client = await pool.connect();
  try {
    const resA = await client.query("DELETE FROM assignments;");
    const resS = await client.query("DELETE FROM submissions;");
    console.log(`✅ Zimefutwa kazi ${resA.rowCount} na submissions ${resS.rowCount} kikamilifu.`);
    console.log("✨ Sasa database haina maswali yoyote ya sampuli (Iko tupu tayari kwa walimu kupakia kazi halisi).");
  } catch (err) {
    console.error("❌ Hitilafu:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

clearSampleData();
