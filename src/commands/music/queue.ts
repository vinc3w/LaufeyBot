import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { embed as embedMessage } from "config";

export default class QueueCommand extends Command {
  
  description = "List the tracks in the queue.";
  alternativeNames = ["q"];

  async execute(client: BotClient, message: CommandMessage) {
    const player = message.guild.getPlayer();
    const queue = player.queue;
    const currentTrack = player.currentTrack;

    if (!queue.length) {
      message.replyError("Queue is currenty empty! Use the `play` command to play something!");
      return;
    }

    const queueLimitCount = 10;
    const totalPage = Math.ceil(queue.length / queueLimitCount);
    let page = 1;
    
    const createMessage = () => {
      const offset = queueLimitCount * (page - 1);
      const limit = queueLimitCount * page;

      const embed = new EmbedBuilder()
      .setColor(embedMessage.colors.info)
      .setTitle(`${message.guild.name}'s queue`)
      .setDescription(
        [
          queue.slice(offset, limit).map(
            (track, index) => `**\`${index + offset + 1}.\`** ${track.name} - \`${track.artists.map(artist => artist.name).join(", ")}\``
          ).join("\n"),
          currentTrack
            ? `\`Current track:\` **\`no.${currentTrack.queueNumber + 1}\`**\n`
            : "\n",
        ].join("\n\n")
      )
      .setFooter({ text: `Page ${page}/${totalPage}   •   ${queue.length} tracks` });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("start")
          .setLabel("<<")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("<")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel(">")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page >= totalPage),
        new ButtonBuilder()
          .setCustomId("end")
          .setLabel(">>")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page >= totalPage),
      );

      return {
        embeds: [embed],
        components: [row],
      };
    }

    const queueMessage = await message.reply(createMessage());

    while (true) {
      try {
        const interaction = await queueMessage.awaitMessageComponent({
          filter: i => i.user.id === message.author.id,
          time: 60_000,
        });
        switch (interaction.customId) {
          case "start":
            page = 1;
            break;
          case "prev":
            page--;
            break;
          case "next":
            page++;
            break;
          case "end":
            page = totalPage;
            break;
        }
        interaction.update(createMessage());
      } catch (error) {
        return;
      }
    }
  }

}
