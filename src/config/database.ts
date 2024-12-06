import { Pool } from "pg";
import { createInterface } from "readline";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: "postgres",
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

const createUser = `
  CREATE TABLE IF NOT EXISTS users (
    discord_id VARCHAR PRIMARY KEY,
    smx_id INTEGER,
    smx_username VARCHAR
  );
`;

const createScoreChannel = `
  CREATE TABLE IF NOT EXISTS score_channels (
    channel_id VARCHAR PRIMARY KEY,
    country VARCHAR,
    only_highscores BOOLEAN
  );
`;


const initializeDatabase = async () => {
  try {
    await pool.query(createUser);
    console.log("Table 'users' is ready.");
  } catch (err) {
    console.error("Error creating 'users' table:", err);
  }

  try {
    await pool.query(createScoreChannel);
    console.log("Table 'score_channels' is ready.")
  } catch (err) {
    console.error("Error creating 'score_channels' table:", err);
  }
}



initializeDatabase().then(() => {
  console.log("Database initialized and application started.");
}).catch((err) => {
  console.error("Error initializing database:", err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
