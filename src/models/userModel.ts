import { query } from "../config/database";

export const getUserById = async (discordId: string) => {
  const result = await query("SELECT * FROM users WHERE discord_id = $1", [discordId]);
  return result.rows[0] || null;
};

export const createOrUpdateUser = async (discordId: string, smxId: number, smxUsername: string) => {
  const result = await query(`
    INSERT INTO users (discord_id, smx_id, smx_username)
    VALUES ($1, $2, $3)
    ON CONFLICT (discord_id)
    DO UPDATE SET smx_id = EXCLUDED.smx_id, smx_username = EXCLUDED.smx_username
    RETURNING *;
    `,
    [discordId, smxId, smxUsername]
  );
  return result.rows[0];
};
