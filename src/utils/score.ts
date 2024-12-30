import { EmbedBuilder } from "discord.js";

export const createScoreEmbed = (score: any) => {

  // Song info
  const title = score.song.title;
  const artist = score.song.artist;
  const bpm = score.song.bpm;
  const cover = `https://data.stepmaniax.com/${score.song.cover_thumb}`;
  const genre = score.song.genre;

  // Score Info
  const difficultyDisplay = score.chart.difficulty_display;
  const difficulty = score.chart.difficulty;
  const gameScore = score.score;
  const scoreId = score._id;
  const thumbnail = `https://scores.stepmaniax.com/image/${scoreId}`;
  const maxCombo = score.max_combo;
  const calories = score.calories;
  const time = new Date(score.created_at);

  // SMX Info
  const smxUsername = score.gamer.username;
  const smxDescription = score.gamer.description;
  const smxCountry = score.gamer.country;
  const smxPicture = `https://data.stepmaniax.com/${score.gamer.picture_path}`;
  const smxColor = score.gamer.hex_color || "400C32";


  const scoreEmbed = new EmbedBuilder()
    .setTitle(`${smxUsername} :flag_${smxCountry.toLowerCase()}:`)
    .setDescription(smxDescription || "No description :(")
    .setColor(`#${smxColor}`)
    .setURL(`https://smx.573.no/graph?scores=${scoreId}`)
    .setAuthor({ name: `${title} - ${artist}`, iconURL: cover })
    .setImage(thumbnail)
    .setThumbnail(smxPicture)
    .addFields(
      // { name: "Score", value: gameScore.toLocaleString("en-US"), inline: true },
      // { name: "Difficulty", value: `${difficultyDisplay.charAt(0).toUpperCase() + difficultyDisplay.slice(1)} ${difficulty}`, inline: true },
      // { name: "Max Combo", value: `${maxCombo}`, inline: true },
      { name: "Genre", value: `${genre.charAt(0).toUpperCase() + genre.slice(1)}`, inline: true },
      { name: "BPM", value: `${bpm}`, inline: true },
      { name: "Calories", value: `${calories}`, inline: true },
    )
    .setTimestamp(time)

  return scoreEmbed;
}
