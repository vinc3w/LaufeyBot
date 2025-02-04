import Player from "@handlers/Player";
import BotClient from "@structures/BotClient";
import { Guild } from "discord.js";

declare module "discord.js" {
  interface Guild {
    getPlayer(): Player;
  }
}

Guild.prototype.getPlayer = function () {
  return (this.client as BotClient).getPlayer(this.id);
}
