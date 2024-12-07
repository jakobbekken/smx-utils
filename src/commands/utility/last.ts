import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"; 
import { getUserById } from "../../models/userModel";

export default {
  data: new SlashCommandBuilder()
    .setName("last")
    .setDescription("Checks your or another player's last song")
    .addUserOption(option => 
      option
        .setName("discord_user")
        .setDescription("The Discord user to check")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {

    const discordUser = interaction.options.getUser("discord_user") || interaction.user;

    try {
      const user = await getUserById(discordUser.id);

      if (!user) {

        if (discordUser == interaction.user) {
          await interaction.reply({ content: `Your user is not linked with your SMX-profile yet, run \`/link\` to do so!`, ephemeral: true });
        } else {
          await interaction.reply({ content: `That user has not linked their Discord and SMX-profile yet!`, ephemeral: true });
        }
        return;
      }

      try {
        const apiUrl = `https://api.smx.573.no/scores?params=${encodeURIComponent(
          JSON.stringify({ "gamer.username": user.smx_username, "_take": 1 })
        )}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          await interaction.reply({ content: `Failed to fetch data from SMX API: ${response.statusText}`, ephemeral: true });
          return;
        }

        const data = await response.json();

        if (Object.keys(data).length == 0) {
          await interaction.reply({ content: `Failed to find SMX username`, ephemeral: true });
          return;
        }

        const score = data[0];

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
        
        
        await interaction.reply({ embeds: [scoreEmbed] });
      
      } catch (error) {
        console.error("Error fetching data:", error);
        await interaction.reply({ content: "An error occurred while fetching data from the SMX API.", ephemeral: true });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      await interaction.reply({ content: "An error occurred while fetching data from the SMX API.", ephemeral: true });
    }
  },
};
