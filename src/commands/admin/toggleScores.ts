import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js"; 
import { createScoreChannel, deleteScoreChannelById } from "../../models/scoreChannelModel";

export default {
  data: new SlashCommandBuilder()
    .setName("toggle_scores")
    .setDescription("Toggles score announcement in current channel")
    // .addStringOption(option => 
    //   option
    //     .setName("country")
    //     .setDescription("The two letter country code for scores")
    //     .setRequired(true)
    // )
    // .addBooleanOption(option => 
    //   option
    //     .setName("only_highscores")
    //     .setDescription("Only announce highscores")
    //     .setRequired(false)
    // )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {

    const channelId = interaction.channelId;
    const inputCountry = "NO"; // interaction.options.getString("country");
    const inputOnlyHigh = true; // interaction.options.getBoolean("only_highscores") || false;

    if (!inputCountry) {
      await interaction.reply({ content: "You must provide a country code!", ephemeral: true });
      return;
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
