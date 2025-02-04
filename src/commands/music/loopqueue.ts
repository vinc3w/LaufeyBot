import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { LoopState } from "@typings/Player";

export default class LoopQueueCommand extends Command {
  
  description = "Loop current queue.";
  alternativeNames = ["lq"];

  execute(client: BotClient, message: CommandMessage) {
    const player = message.guild.getPlayer();
    const musicPlayer = player.player;

    if (!musicPlayer) {
      message.replyError("I am not playing anything now. Use the `play` command to play something!");
      return;
    }

    switch (player.loopState) {
      case LoopState.QUEUE: {
        player.setLoopState(LoopState.OFF)
        message.replySuccess("Queue loop has been disabled");
        break;
      }
      case LoopState.TRACK:
      case LoopState.OFF: {
        player.setLoopState(LoopState.QUEUE);
        message.replySuccess("Queue loop has been enabled");
        break;
      }
    }
  } 

}
