import { ChatInputCommandInteraction, Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

import { Command } from "./interfaces/command";
import { startScoreUpdater } from "./services/scoreUpdater";

dotenv.config();

const discordToken = process.env.DISCORD_TOKEN;

if (!discordToken) {
  throw new Error("Missing environment variables")
}


class MyClient extends Client {
  commands: Collection<string, Command>;
  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds],
    });
    this.commands = new Collection();
  }
}

const client = new MyClient();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: Command = require(filePath).default;
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName) as Command | undefined;

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction as ChatInputCommandInteraction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, readyClient => {
  startScoreUpdater(client, 10000);
  console.log(`Ready! Logged in as ${readyClient.user?.tag}`);
});

client.login(discordToken);
