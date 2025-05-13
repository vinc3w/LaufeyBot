import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";

export default class LeaveCommand extends Command {

  description = "Stop music playing and leave the voice channel.";

  execute(client: BotClient, message: CommandMessage) {
    const player = message.guild.getPlayer();

    if (!player.connection) {
      message.replyError("I am not in a voice channel so I am not able to leave it. HeHeHe");
      return;
    }

    const channel = player.stop();

    message.replySuccess(`Left \`${channel?.name}\``);
  } 

}
