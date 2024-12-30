import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"; 
import { getUserById } from "../../models/userModel";
import { createScoreEmbed } from "../../utils/score";

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
        const scoreEmbed = createScoreEmbed(score);
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
