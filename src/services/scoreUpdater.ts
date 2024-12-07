import { Client, EmbedBuilder, TextChannel } from "discord.js"
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

                // Song info
                const title = score.song.title;
                const artist = score.song.artist;
                const bpm = score.song.bpm;
                const cover = `https://data.stepmaniax.com/${score.song.cover_thumb}`;
                const genre = score.song.genre;

                // Score Info
                const difficultyDisplay = score.chart.difficulty_display;
                const difficulty = score.chart.difficulty;
                const gameScore = score.score;
                const scoreId = score._id;
                const thumbnail = `https://scores.stepmaniax.com/image/${scoreId}`;
                const maxCombo = score.max_combo;
                const calories = score.calories;

                // SMX Info
                const smxUsername = score.gamer.username;
                const smxDescription = score.gamer.description;
                const smxCountry = score.gamer.country;
                const smxPicture = `https://data.stepmaniax.com/${score.gamer.picture_path}`;
                const smxColor = score.gamer.hex_color;

                if (channel.country !== smxCountry && channel.country !== "") {
                  continue;
                }

                const scoreEmbed = new EmbedBuilder()
                  .setTitle(`${smxUsername} :flag_${smxCountry.toLowerCase()}:`)
                  .setDescription(smxDescription || "No description :(")
                  .setColor(`#${smxColor}`)
                  .setURL(`https://smx.573.no/graph?scores=${scoreId}`)
                  .setAuthor({ name: `${title} - ${artist}`, iconURL: cover })
                  .setImage(thumbnail)
                  .setThumbnail(smxPicture)
                  .addFields(
                    { name: "Score", value: gameScore.toLocaleString("en-US"), inline: true },
                    { name: "Difficulty", value: `${difficultyDisplay.charAt(0).toUpperCase() + difficultyDisplay.slice(1)} ${difficulty}`, inline: true },
                    { name: "Max Combo", value: `${maxCombo}`, inline: true },
                    { name: "BPM", value: `${bpm}`, inline: true },
                    { name: "Calories", value: `${calories}`, inline: true },
                    { name: "Genre", value: `${genre.charAt(0).toUpperCase() + genre.slice(1)}`, inline: true },
                  )
                  .setTimestamp()
                
                
                await textChannel.send({ embeds: [scoreEmbed] });
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
