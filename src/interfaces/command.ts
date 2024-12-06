import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface CommandJSON {
  name: string;
  description: string;
  options?: object[];
}

