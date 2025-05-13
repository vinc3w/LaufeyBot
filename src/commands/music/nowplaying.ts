import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { EmbedBuilder } from "discord.js";
import { embed as embedMessage } from "config";
import { msToReadableMinutes } from "@helpers/Utils";

const seekerLength = 18;

export default class NowPlayingCommand extends Command {

  description = "Display currently playing track.";
  alternativeNames = ["np"];

  execute(client: BotClient, message: CommandMessage) {
    const player = message.guild.getPlayer();
    const currentTrack = player.currentTrack;

    if (!currentTrack) {
      message.replyError("There is no track currently playing!");
      return;
    }

    if (!currentTrack.startPlayDate) {
      message.replyInfo("Track is loading..");
      return;
    }

    const seeker = Array(seekerLength).fill("—");
    const timePlayedMs = (new Date().getTime()) - (new Date(currentTrack.startPlayDate).getTime());
    const seekerBallPosition = Math.floor((timePlayedMs / currentTrack.durationMs) * seeker.length);
    
    seeker[seekerBallPosition] = "🔴";

    const embed = new EmbedBuilder()
      .setColor(embedMessage.colors.info)
      .setTitle(currentTrack.name)
      .setDescription(`\`${msToReadableMinutes(timePlayedMs)}\` ${seeker.join("")} \`${msToReadableMinutes(currentTrack.durationMs)}\``)
      .addFields(
        {
          name: "Album",
          value: currentTrack.album.name,
        },
        {
          name: "Queue No.",
          value: (currentTrack.queueNumber + 1).toString(),
          inline: true,
        },
        {
          name: "Track No.",
          value: currentTrack.trackNumber.toString() as string,
          inline: true,
        },
      )
      .setImage(currentTrack.album.images[0].url);

    message.reply({ embeds: [embed] });
  }

}
