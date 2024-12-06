import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"; 
import { createOrUpdateUser, getUserById } from "../../models/userModel";

export default {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Links your Discord to your SMX-user")
    .addStringOption(option => 
      option
        .setName("smx_username")
        .setDescription("The SMX-username to link with")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {

    const inputUsername = interaction.options.getString("smx_username");

    if (!inputUsername) {
      await interaction.reply("You must provide an SMX username!");
      return;
    }
    try {
      const apiUrl = `https://api.smx.573.no/players?params=${encodeURIComponent(
        JSON.stringify({ username: inputUsername })
      )}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        await interaction.reply(`Failed to fetch data from SMX API: ${response.statusText}`);
        return;
      }

      const data = await response.json();

      if (Object.keys(data).length == 0) {
        await interaction.reply(`Failed to find SMX username`);
        return;
      }


      const discordId = interaction.user.id;
      const smxId = data[0]._id;
      const smxUsername = data[0].username;
      
      try {
        const newUser = await createOrUpdateUser(discordId, smxId, smxUsername);
        console.log("User created:", newUser);

        await interaction.reply(`
          Your Discord has successfully been linked to \`${smxUsername}\`'s SMX-profile
        `);

      } catch (error) {
        console.error('Error fetching data:', error);
        await interaction.reply('An error occurred while fetching data from the SMX API.');
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      await interaction.reply("An error occurred while fetching data from the SMX API.");
    }
  },
};
