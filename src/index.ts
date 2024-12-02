import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config()
const discordToken = process.env.DISCORD_TOKEN;
const devGuildId = process.env.DEV_GUILD_ID;

if (!discordToken || !devGuildId) {
  throw new Error("Missing environment variables")
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user?.tag}`);
});

client.login(discordToken);
