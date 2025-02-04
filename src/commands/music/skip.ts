import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { PlayerState } from "@typings/Player";

export default class SkipCommand extends Command {

  description = "Skip to the next track!";
  alternativeNames = ["s"];

  async execute(client: BotClient, message: CommandMessage) {
    const player = message.guild.getPlayer();

    if (player.state === PlayerState.OFF) {
      message.replyError("I am not playing anything now. Use the `play` command to play something!");
      return;
    }

    player.skip();

    message.replySuccess("Skip Successful");
  }

}
