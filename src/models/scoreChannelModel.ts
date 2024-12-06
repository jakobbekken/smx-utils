import { query } from "../config/database";

export const getScoreChannelById = async (channelId: string) => {
  const results = await query("SELECT * FROM score_channels WHERE channel_id = $1", [channelId]);
  return results.rows[0] || null;
};

export const getAllScoreChannels = async () => {
  const results = await query("SELECT * FROM score_channels");
  return results.rows || [];
}

export const createScoreChannel = async (channelId: string, country: string, onlyHighscores: boolean) => {
  const results = await query(`
    INSERT INTO score_channels (channel_id, country, only_highscores)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
    [channelId, country, onlyHighscores]
  );
  return results.rows[0];
};

export const deleteScoreChannelById = async (channelId: string) => {
  const results = await query(`
    DELETE FROM score_channels
    WHERE channel_id = $1
    RETURNING *;
    `,
    [channelId]
  );
  return results.rows[0] || null;
}
