import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { LoopState } from "@typings/Player";

export default class LoopCommand extends Command {

  description = "Loop currently playing track.";
  alternativeNames = ["lp"];

  execute(client: BotClient, message: CommandMessage) {
    const player = message.guild.getPlayer();
    const musicPlayer = player.player;

    if (!musicPlayer) {
      message.replyError("I am not playing anything now. Use the `play` command to play something!");
      return;
    }

    switch (player.loopState) {
      case LoopState.TRACK: {
        player.setLoopState(LoopState.OFF)
        message.replySuccess("Track loop has been disabled");
        break;
      }
      case LoopState.QUEUE:
      case LoopState.OFF: {
        player.setLoopState(LoopState.TRACK)
        message.replySuccess("Track loop has been enabled");
        break;
      }
    }
  } 

}
