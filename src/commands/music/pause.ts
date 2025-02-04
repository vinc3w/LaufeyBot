import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { PlayerState } from "@typings/Player";

export default class PauseCommand extends Command {
  
  description = "Pause player.";

  execute(client: BotClient, message: CommandMessage) {
    const player = message.guild.getPlayer();

    if (player.state === PlayerState.OFF) {
      message.replyError("I am not playing anything now. Use the `play` command to play something!");
      return;
    }

    player.pause();

    message.replySuccess("Player paused!");
  } 

}
