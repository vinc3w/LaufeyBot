import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";

export default class HelloCommand extends Command {
  
  description = "Greets you back (politely of course)!";
  alternativeNames = ["hi"];

  execute(client: BotClient, message: CommandMessage) {
    message.replyInfo("hello");
  } 

}
