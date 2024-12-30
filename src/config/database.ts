import { Pool } from "pg";
import { createInterface } from "readline";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: "postgres",
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

const createUsers = `
  CREATE TABLE IF NOT EXISTS users (
    discord_id VARCHAR PRIMARY KEY,
    smx_id INTEGER,
    smx_username VARCHAR
  );
`;

const createScoreChannels = `
  CREATE TABLE IF NOT EXISTS score_channels (
    channel_id VARCHAR PRIMARY KEY,
    country VARCHAR,
    only_highscores BOOLEAN
  );
`;

const createMatches = `
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY,
    p1_id VARCHAR,
    p2_id VARCHAR,
    format INTEGER,
    accepted BOOLEAN DEFAULT FALSE,
    winner_id VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (format) REFERENCES formats(id)
  );
`;

const createMatchCharts = `
  CREATE TABLE IF NOT EXISTS match_charts (
    id INTEGER PRIMARY KEY,
    match_id INTEGER,
    chart_id INTEGER,
    p1_score_id INTEGER,
    p2_score_id INTEGER,
    winner_id VARCHAR,
    FOREIGN KEY (match_id) REFERENCES matches(id)
  );
`;

const createFormats = `
  CREATE TABLE IF NOT EXISTS formats (
    id INTEGER PRIMARY KEY,
    name VARCHAR,
    number INTEGER
  );

  INSERT INTO formats (id, name, number)
  VALUES
    (1, 'Bo1', 1),
    (2, 'Bo3', 3),
    (3, 'Bo5', 5),
    (5, 'Ft3', 3)
  ON CONFLICT (id) DO NOTHING;
`;

const createTable = async (sql: string, name: string) => {
  try {
    await pool.query(sql);
    console.log(`Table '${name}' is ready.`);
  } catch (error) {
    console.error(`Error creating '${name}' table:`, error);
  }
};

const initializeDatabase = async () => {
  await createTable(createUsers, "users");
  await createTable(createScoreChannels, "score_channels");
  await createTable(createFormats, "match_charts");
  await createTable(createMatches, "matches");
  await createTable(createMatchCharts, "match_charts");
};



initializeDatabase().then(() => {
  console.log("Database initialized and application started.");
}).catch((err) => {
  console.error("Error initializing database:", err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
