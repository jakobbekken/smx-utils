import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}

export interface CommandJSON {
  name: string;
  description: string;
  options?: object[];
}

