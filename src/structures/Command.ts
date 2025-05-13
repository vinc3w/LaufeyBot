import BotClient from "./BotClient";
import { Parameter } from "@typings/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";

export default class Command {

  description = "";
  alternativeNames: string[] = [];
  parameters: Parameter[] = [];

  execute(client: BotClient, message: CommandMessage, ...args: any[]) {

  }

}
