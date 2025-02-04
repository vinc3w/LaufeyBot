import BotClient from "@structures/BotClient";
import { Guild } from "discord.js";

module.exports = (client: BotClient, guild: Guild) => {
  client.loadPlayer(guild);
}
