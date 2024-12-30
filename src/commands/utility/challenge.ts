import { SlashCommandBuilder, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, User, Interaction, ComponentType, ButtonInteraction, EmbedBuilder } from "discord.js"; 
import { getUserById } from "../../models/userModel";

export default {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Challenge target player to a match")
    .addUserOption(option => 
      option
        .setName("opponent")
        .setDescription("The Discord user to challenge")
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName("format")
        .setDescription("The format of the match (default: single match)")
        .setRequired(false)
        .addChoices(
          { name: "Best of 1", value: "Bo1" },
          { name: "Best of 3", value: "Bo3" },
          { name: "Best of 5", value: "Bo5" },
          { name: "First to 3", value: "Ft3" },
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const opponent = interaction.options.getUser("opponent");
    const challenger = interaction.user;
    const format = interaction.options.getString("format") || "Bo1";

    if (!challenger) {
      console.log(`challenger not existing`)
      return;
    }
    if (!opponent) {
      console.log(`opponent not existing`)
      return;
    }

    const challengerInfo = await getUserById(challenger.id);
    const opponentInfo = await getUserById(opponent.id)

    if (!challengerInfo) {
      await interaction.reply({ content: `Your user is not linked with your SMX-profile yet, run \`/link\` to do so!`, ephemeral: true });
      return;
    }
    if (!opponentInfo) {
      await interaction.reply({ content: `Your opponents user is not linked with their SMX-profile yet, make them run \`/link\` to do so!`, ephemeral: true });
      return;
    }

    const accept = new ButtonBuilder()
      .setCustomId("accept")
      .setLabel("Accept")
      .setStyle(ButtonStyle.Primary);

    const deny = new ButtonBuilder()
      .setCustomId("deny")
      .setLabel("Deny")
      .setStyle(ButtonStyle.Danger);


    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(accept, deny);


    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle(":crossed_swords: Challenge Incoming! (WIP)")
      .setDescription(
        `Get ready, you have been challenged by **${challenger.username}**!`
      )
      .addFields(
        { name: "Challenger", value: `<@${challenger.id}>`, inline: true },
        { name: "Opponent", value: `<@${opponent.id}>`, inline: true },
        { name: "Format", value: format, inline: true }
      )
      .setFooter({ text: "Press a button to respond." })
      .setThumbnail("https://data.stepmaniax.com/uploads/avatars/11451_0ac26d17a57a3329b1aeb3f9a29b4549d5f63309.jpg")
      .setTimestamp();

    const response = await interaction.reply({
			content: `<@${opponent.id}>**, you have been challenged by** <@${challenger.id}>!`,
			embeds: [embed],
			components: [row],
		});

		const collector = response.createMessageComponentCollector({
		  componentType: ComponentType.Button,
		  time: 30_000,
		});

		collector.on("collect", async (buttonInteraction) => {
		  if (![challenger.id, opponent.id].includes(buttonInteraction.user.id)) {
		    await buttonInteraction.reply({
		      content: "You are not part of this challenge!",
		      ephemeral: true,
		    });
		    return;
		  }

		  if (buttonInteraction.customId === "accept") {
		    if (buttonInteraction.user.id === opponent.id) {
		      await buttonInteraction.update({
		        content: `Match started! ${challenger.username} vs. ${opponent.username}`,
            components: [],
		      });
		    } else {
		      await buttonInteraction.reply({
            content: "Only the opponent can accept the challenge!",
            ephemeral: true,
          });
		    }
		  } else if (buttonInteraction.customId === "deny") {
		    await buttonInteraction.update({
		      content: "The challenge was declined!",
          components: [],
        });
        collector.stop();
		  }
		});

		collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await interaction.editReply({
          content: "Challenge timed out!",
          components: [],
        });
      }
    });
  },
};
