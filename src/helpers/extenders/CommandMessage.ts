import { Message, OmitPartialGroupDMChannel, TextChannel } from "discord.js";

export type CommandMessageWithTextChannel<Structure extends Message> = Structure & {
  channel: TextChannel;
}

export type CommandMessage = CommandMessageWithTextChannel<OmitPartialGroupDMChannel<Message<true>>>;
