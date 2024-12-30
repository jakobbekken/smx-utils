import { Client, EmbedBuilder, TextChannel } from "discord.js"
import WebSocket from "ws";
import { getAllScoreChannels } from "../models/scoreChannelModel";
import { createScoreEmbed } from "../utils/score";



const startWS = (client: Client) => {
  const ws = new WebSocket("wss://api.smx.573.no/scores");

  ws.on("open", () => {
    console.log("Connected to WSS");
  });

  ws.on("message", async (data: WebSocket.RawData) => {
    const score = JSON.parse(data.toString());

    try {
      const scoreChannels = await getAllScoreChannels();

      if (!scoreChannels || scoreChannels.length === 0) {
        console.log("No channels to update!")
      }

      for (const channel of scoreChannels) {
        try {
          const discordChannel = await client.channels.fetch(channel.channel_id);
          if (discordChannel && discordChannel.isTextBased()) {
            const textChannel = discordChannel as TextChannel;
            if (channel.country !== score.gamer.country && channel.country !== "") {
              continue;
            }
            const scoreEmbed = createScoreEmbed(score);
            await textChannel.send({ embeds: [scoreEmbed] });
          }
        } catch (error) {
          console.error(`Error fetching channel with ID ${channel.channel_id}:`, error)
        }
      }
    } catch (error) {
      console.error(`Error finding channels to post scores: ${error}`)
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed. Reconnecting in 10 seconds...");
    setTimeout(startWS, 10000);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
}

export const startScoreUpdater = async (client: Client, interval: number) => {

  startWS(client);
  
}
