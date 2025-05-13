import { EmbedBuilder, TextChannel } from "discord.js";
import { embed } from "config";

declare module "discord.js" {
  interface TextChannel {
    sendEmbed(color: number, message: string): void;
    sendInfo(message: string): void;
    sendSuccess(message: string): void;
    sendWarn(message: string): void;
    sendError(message: string): void;
  }
}

TextChannel.prototype.sendEmbed = function (color, message) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setDescription(message);
  this.send({ embeds: [embed] });
}

TextChannel.prototype.sendInfo = function (message) {
  this.sendEmbed(embed.colors.info, message);
}

TextChannel.prototype.sendSuccess = function (message) {
  this.sendEmbed(embed.colors.success, message);
}

TextChannel.prototype.sendWarn = function (message) {
  this.sendEmbed(embed.colors.warn, message);
}

TextChannel.prototype.sendError = function (message) {
  this.sendEmbed(embed.colors.error, message);
}
