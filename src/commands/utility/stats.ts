import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"; 
import { getUserById } from "../../models/userModel";

export default {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Checks your or another player's stats")
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

      await interaction.reply(`
        This is \`${user.smx_username}\`'s SMX-profile, more content is comming!
      `);

    } catch (error) {
      console.error('Error fetching data:', error);
      await interaction.reply({ content: 'An error occurred while fetching data from the SMX API.', ephemeral: true });
    }

    //try {
      //const apiUrl = `https://api.smx.573.no/players?params=${encodeURIComponent(
      //  JSON.stringify({ username: inputUsername })
      //)}`;

      //const response = await fetch(apiUrl);
      //if (!response.ok) {
      //  await interaction.reply(`Failed to fetch data from SMX API: ${response.statusText}`);
      //  return;
      //}

      //const data = await response.json();

      //if (Object.keys(data).length == 0) {
      //  await interaction.reply(`Failed to find SMX username`);
      //  return;
      //}


      //const discordId = interaction.user.id;
      //const smxId = data[0]._id;
      //const smxUsername = data[0].username;
      
      
    //} catch (error) {
      //console.error("Error fetching data:", error);
      //await interaction.reply("An error occurred while fetching data from the SMX API.");
    //}
  },
};
