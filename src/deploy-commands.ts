import { REST, Routes } from "discord.js";
import { Command, CommandJSON } from "./interfaces/command";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const discordToken = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const devGuildId = process.env.DEV_GUILD_ID;

if (!discordToken || !clientId || !devGuildId) {
  throw new Error("Missing environment variables")
}


const commands: CommandJSON[] = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command: Command = require(filePath).default;
      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
    }
  }
}

const rest = new REST({ version: "10" }).setToken(discordToken);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, devGuildId),
      { body: commands },
    );

    console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} application (/) commands.`);
  } catch (error) {
    console.error(`[ERROR] Failed to deploy commands:`, error);
  }
})();
