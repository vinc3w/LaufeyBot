import { EmbedBuilder, Message } from "discord.js";
import { embed } from "config";

declare module "discord.js" {
  interface Message {
    replyEmbed(color: number, message: string): void;
    replyInfo(message: string): void;
    replySuccess(message: string): void;
    replyWarn(message: string): void;
    replyError(message: string): void;
  }
}

Message.prototype.replyEmbed = function (color, message) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setDescription(message);
  this.reply({ embeds: [embed] });
}

Message.prototype.replyInfo = function (message) {
  this.replyEmbed(embed.colors.info, message);
}

Message.prototype.replySuccess = function (message) {
  this.replyEmbed(embed.colors.success, message);
}

Message.prototype.replyWarn = function (message) {
  this.replyEmbed(embed.colors.warn, message);
}

Message.prototype.replyError = function (message) {
  this.replyEmbed(embed.colors.error, message);
}
