import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import api from "@api/api";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { EmbedBuilder } from "discord.js";
import { embed } from "config";
import { Artist } from "@typings/Artist";
import { getRandomFaceEmoji } from "@helpers/Utils";

export default class AboutCommand extends Command {

  description = "About drumroll ... Laufey Bot!!!";

  async execute(client: BotClient, message: CommandMessage) {
    try {
      const response = await api.get("/data/artist.json");
      const artist: Artist = response.data;
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(embed.colors.info)
            .setAuthor({
              name: artist.name,
              iconURL: client.user?.displayAvatarURL(),
              url: artist.externalUrls.spotify
            })
            .setDescription(artist.about)
            .setFields(
              {
                name: "Followers",
                value: Intl.NumberFormat("en", { notation: "compact" }).format(artist.followers.total),
              },
            )
            .setImage(artist.images[0].url)
            .setTimestamp()
            .setFooter({ text: getRandomFaceEmoji() })
        ]
      })
    } catch (error) {
      message.replyError("Something went wrong. Please try again later!");
    }
  }

}
