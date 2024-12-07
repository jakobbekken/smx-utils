import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js"; 
import { createScoreChannel, deleteScoreChannelById } from "../../models/scoreChannelModel";

export default {
  data: new SlashCommandBuilder()
    .setName("toggle_scores")
    .setDescription("Toggles score announcement in current channel")
    .addStringOption(option => 
      option
        .setName("country")
        .setDescription("The two letter country code for scores")
        .setRequired(false)
    )
    // .addBooleanOption(option => 
    //   option
    //     .setName("only_highscores")
    //     .setDescription("Only announce highscores")
    //     .setRequired(false)
    // )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {

    const channelId = interaction.channelId;
    const inputCountry = interaction.options.getString("country") || "";
    const inputOnlyHigh = true; // interaction.options.getBoolean("only_highscores") || false;

    if (inputCountry != "") {
      try {
        const apiUrl = `https://api.smx.573.no/scores?params=${encodeURIComponent(
          JSON.stringify({ "gamer.country": inputCountry, "_take": 1 })
        )}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          await interaction.reply({ content: `Failed to fetch data from SMX API: ${response.statusText}`, ephemeral: true });
          return;
        }

        const data = await response.json();

        if (Object.keys(data).length == 0) {
          await interaction.reply({ content: `${inputCountry} is not a valid 2 letter country code (ex. NO, US, NL)!`, ephemeral: true });
          return;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        await interaction.reply({ content: "An error occurred while fetching data from the SMX API.", ephemeral: true });
      }
    }

    try {
      const oldScoreChannel = await deleteScoreChannelById(channelId);
      if (!oldScoreChannel) {
        const newScoreChannel = await createScoreChannel(channelId, inputCountry, inputOnlyHigh);
        console.log("Score Channel created:", newScoreChannel);

        await interaction.reply({ content: `
          This channel will get score updates now!
        `, ephemeral: true });
      } else {
        await interaction.reply({ content: `
          This channel will no longer get score updates!
        `, ephemeral: true });
      }
    } catch (error) {
      console.error("Error accessing database:", error);
      await interaction.reply({ content: "An error occurred while fetching data from the database.", ephemeral: true });
    }
  },
};
