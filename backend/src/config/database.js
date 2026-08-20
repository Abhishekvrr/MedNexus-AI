import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL;

const isRemoteDb =
  Boolean(dbUrl) &&
  !dbUrl.includes("localhost") &&
  !dbUrl.includes("127.0.0.1");

let pool = null;

if (dbUrl) {
  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl:
        process.env.DB_SSL === "true" || isRemoteDb
          ? { rejectUnauthorized: false }
          : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("connect", () => {
      console.log("✅ PostgreSQL client connected");
    });

    pool.on("error", (error) => {
      console.error("❌ Unexpected PostgreSQL pool error:", error.message);
    });
  } catch (err) {
    console.error("❌ Failed to initialize PostgreSQL pool:", err.message);
  }
}

export const query = async (text, params = []) => {
  if (!pool) {
    const errorMsg =
      "DATABASE_URL is not configured. Please add DATABASE_URL (e.g. from Neon.tech or Supabase) to your Vercel Environment Variables.";
    console.error(`❌ [DATABASE ERROR]: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`🗄️ SQL executed in ${duration}ms`);
    return result;
  } catch (error) {
    console.error("❌ Database query failed:", error.message);
    throw error;
  }
};

export const testDatabaseConnection = async () => {
  if (!pool) {
    throw new Error("DATABASE_URL is missing in environment variables.");
  }

  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS time"
    );

    console.log(`✅ Database connected: ${result.rows[0].database}`);
    return result.rows[0];
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    throw error;
  }
};

export default pool;