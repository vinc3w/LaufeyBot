import BotClient from "@structures/BotClient";
import env from "env";
import { validateParameter } from "@helpers/Validator";
import { ChannelType, Message, OmitPartialGroupDMChannel } from "discord.js";
import { CommandMessage } from "@helpers/extenders/CommandMessage";

module.exports = async (client: BotClient, message: OmitPartialGroupDMChannel<Message<true>>) => {
  if (
    message.author.bot ||
    !message.guild ||
    message.channel.type !== ChannelType.GuildText
  ) return;

  const [commandName, ...args] = message.content.split(" ").filter(content => !!content);
  const command = client.commands[commandName];

  if (!command) return;

  const { parameters, execute } = command;
  const parametersFiltered = parameters.filter(p => {
    // discard if:
    // - parameter is a development parameter 
    // - environment is not development
    return !p.dev || env.ENVIRONMENT === "development";
  });
  const formattedArgs = [];

  for (const [index, parameter] of parametersFiltered.entries()) {
    try {
      const arg = args[index];
      if (parameter.required || arg) {
        const value = await validateParameter(message as CommandMessage, parameter, arg);
        formattedArgs.push(value);
      }
    } catch (error) {
      message.replyError((error as Error).message);
      return;
    }
  }

  execute(client, message as CommandMessage, ...formattedArgs);
};