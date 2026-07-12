import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const DEFAULT_GENRES = ["Horror", "Comedy"];
const DEFAULT_EXTRAS = ["haunted house", "road trip", "mistaken identity"];

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settings (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      year_min INTEGER NOT NULL DEFAULT 1960,
      year_max INTEGER NOT NULL DEFAULT 2026,
      genres JSONB NOT NULL DEFAULT '["Horror","Comedy"]'::jsonb,
      extras JSONB NOT NULL DEFAULT '["haunted house","road trip","mistaken identity"]'::jsonb
    );
  `);
}

export async function userCount() {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM users");
  return result.rows[0].count;
}

export async function createUserWithSettings(username, passwordHash) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userResult = await client.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username`,
      [username, passwordHash],
    );
    const user = userResult.rows[0];
    await client.query(
      `INSERT INTO settings (user_id, year_min, year_max, genres, extras)
       VALUES ($1, 1960, 2026, $2::jsonb, $3::jsonb)`,
      [user.id, JSON.stringify(DEFAULT_GENRES), JSON.stringify(DEFAULT_EXTRAS)],
    );
    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findUserByUsername(username) {
  const result = await pool.query(
    "SELECT id, username, password_hash FROM users WHERE username = $1",
    [username],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id) {
  const result = await pool.query(
    "SELECT id, username FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getSettings(userId) {
  const result = await pool.query(
    `SELECT year_min, year_max, genres, extras
     FROM settings WHERE user_id = $1`,
    [userId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    yearMin: row.year_min,
    yearMax: row.year_max,
    genres: row.genres,
    extras: row.extras,
  };
}

export async function upsertSettings(userId, settings) {
  await pool.query(
    `INSERT INTO settings (user_id, year_min, year_max, genres, extras)
     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
     ON CONFLICT (user_id) DO UPDATE SET
       year_min = EXCLUDED.year_min,
       year_max = EXCLUDED.year_max,
       genres = EXCLUDED.genres,
       extras = EXCLUDED.extras`,
    [
      userId,
      settings.yearMin,
      settings.yearMax,
      JSON.stringify(settings.genres),
      JSON.stringify(settings.extras),
    ],
  );
}
