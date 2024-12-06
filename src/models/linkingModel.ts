import { query } from "../config/database";

export const getLinkingById = async (discordId: string) => {
  const result = await query("SELECT * FROM linkings WHERE discord_id = $1", [discordId]);
  return result.rows[0];
};

export const createOrUpdateLinking = async (discordId: string, smxId: number, code: string) => {
  const result = await query(`
    INSERT INTO linkings (discord_id, smx_id, code)
    VALUES ($1, $2, $3)
    ON CONFLICT (discord_id)
    DO UPDATE SET smx_id = EXCLUDED.smx_id, code = EXCLUDED.code
    RETURNING *;
    `,
    [discordId, smxId, code]
  );
  return result.rows[0];
};
