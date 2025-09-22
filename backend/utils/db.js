import dotenv from "dotenv";
import { Pool } from "pg";

// Load env if not already loaded
dotenv.config();

const shouldUseSsl =
  process.env.PGSSL === "true" ||
  (process.env.PGSSLMODE && process.env.PGSSLMODE.toLowerCase() === "require")
    ? { rejectUnauthorized: false }
    : false;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: shouldUseSsl,
    })
  : new Pool({
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: shouldUseSsl,
    });

export async function testConnection() {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows?.[0]?.ok === 1;
}

export async function initDb() {
  try {
    const ok = await testConnection();
    if (ok) {
      console.log("[db] PostgreSQL connection verified");
    } else {
      console.warn("[db] PostgreSQL connection test failed");
    }

    // Initialize schema for chat_messages
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      -- Conversations table
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      -- Add optional file metadata columns if missing
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_name TEXT;
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_path TEXT;
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages (conversation_id, created_at DESC);

      -- Trigger to keep conversations.updated_at fresh
      CREATE OR REPLACE FUNCTION touch_conversation_updated_at() RETURNS trigger AS $$
      BEGIN
        IF NEW.conversation_id IS NOT NULL THEN
          UPDATE conversations SET updated_at = now() WHERE id = NEW.conversation_id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS messages_touch_conversation_updated_at ON chat_messages;
      CREATE TRIGGER messages_touch_conversation_updated_at
      AFTER INSERT ON chat_messages
      FOR EACH ROW EXECUTE FUNCTION touch_conversation_updated_at();
    `);
    console.log("[db] chat_messages schema ready");
  } catch (err) {
    console.error("[db] PostgreSQL init error:", err);
  }
}

export { pool };
