import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";

export default class StopCommand extends Command {

  description = "Stop music playing.";

  execute(client: BotClient, message: CommandMessage) {
    const player = message.guild.getPlayer();

    if (!player.connection) {
      message.replyError("I am not playing anything at the moment.");
      return;
    }

    player.stopWithoutLeaving();

    message.replySuccess(`Successfully stopped!`);
  } 

}
