import { Client, TextChannel } from "discord.js"
import { getAllScoreChannels } from "../models/scoreChannelModel";

let lastTime: string = "";

const updateTimeOfLastScore = async () => {
  try {
    const apiUrl = `https://api.smx.573.no/scores?params=${encodeURIComponent(
      JSON.stringify({ "_take": 1 })
    )}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`Failed to fetch data from SMX API: ${response.statusText}`)
      return;
    }

    const data = await response.json();

    if (Object.keys(data).length == 0) {
      console.error(`Failed to find a score`)
      return;
    }

    lastTime = data[0].created_at;

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

updateTimeOfLastScore();

export const startScoreUpdater = async (client: Client, interval: number) => {
  setInterval(async () => {
    try {
      const scoreChannels = await getAllScoreChannels();

      if (!scoreChannels || scoreChannels.length === 0) {
        console.log("No channels to update!")
      }
      
      try {
        const apiUrl = `https://api.smx.573.no/scores?params=${encodeURIComponent(
          JSON.stringify({ "_take": 10, "created_at": {"gt": lastTime} })
        )}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          console.error(`Failed to fetch data from SMX API: ${response.statusText}`)
          return;
        }

        const data = await response.json();

        if (Object.keys(data).length == 0) {
          return;
        }


        lastTime = data[0].created_at;
      
        for (const channel of scoreChannels) {
          try {
            const discordChannel = await client.channels.fetch(channel.channel_id);
            if (discordChannel && discordChannel.isTextBased()) {
              const textChannel = discordChannel as TextChannel;

              for (const score of data.reverse()) {

                const title = score.song.title;
                const difficultyDisplay = score.chart.difficulty_display;
                const difficulty = score.chart.difficulty;
                const smxUsername = score.gamer.username;
                
                await textChannel.send(`${smxUsername} played ${title} at ${difficultyDisplay} ${difficulty}`);
              }
            }
          } catch (error) {
            console.error(`Error fetching channel with ID ${channel.channel_id}:`, error)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

    } catch (error) {
      console.error(`Error finding channels to post scores: ${error}`)
    }
  }, interval);
}
