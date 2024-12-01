import discord
from discord import app_commands
import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")
GUILD_ID = discord.Object(id=os.getenv("DEV_GUILD_ID"))

intents = discord.Intents.default()
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)

@tree.command(name="ping", description="It pongs!", guild=GUILD_ID)
async def ping(interaction):
    await interaction.response.send_message("pong")

@tree.command(name="get", description="Fetch last played song", guild=GUILD_ID)
async def get_song(interaction: discord.Interaction):
    url = ""
    await interaction.response.send_message("pong")

@client.event
async def on_ready():
    await tree.sync(guild=GUILD_ID)
    print("Ready!")

client.run(TOKEN)
