import { APIApplicationCommand, REST, Routes } from "discord.js";
import { Command, CommandJSON } from "./interfaces/command";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

const discordToken = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!discordToken || !clientId || !guildId) {
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


const deployGlobalCommands = async (): Promise<APIApplicationCommand[]> => {
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );
    return data as APIApplicationCommand[];
}

const deployGuildCommands = async (): Promise<APIApplicationCommand[]> => {
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );
    return data as APIApplicationCommand[];
}

const rest = new REST({ version: "10" }).setToken(discordToken);

(async () => {
  const args = process.argv.slice(2);
  try {

    let data: APIApplicationCommand[];
    if (args[0] === "global") {
      console.log(`Started refreshing ${commands.length} application (/) commands globally.`);
      data = await deployGlobalCommands();
    } else {
      console.log(`Started refreshing ${commands.length} application (/) commands on guild.`);
      data = await deployGuildCommands();
    }


    console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} application (/) commands.`);
  } catch (error) {
    console.error(`[ERROR] Failed to deploy commands:`, error);
  }
})();
