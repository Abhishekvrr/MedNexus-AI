import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL client connected");
});

pool.on("error", (error) => {
  console.error("❌ Unexpected PostgreSQL error:", error);
});

export const query = async (text, params = []) => {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);

    const duration = Date.now() - start;

    console.log(
      `🗄️ SQL executed in ${duration}ms`
    );

    return result;
  } catch (error) {
    console.error("❌ Database query failed:", error);
    throw error;
  }
};

export const testDatabaseConnection = async () => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS time"
    );

    console.log(
      `✅ Database connected: ${result.rows[0].database}`
    );

    return result.rows[0];
  } catch (error) {
    console.error(
      "❌ PostgreSQL connection failed:",
      error.message
    );

    throw error;
  }
};

export default pool;