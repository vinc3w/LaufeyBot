import api from "@api/api";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { Album } from "@typings/Album";
import { Paging } from "@typings/Global";
import { Readable, Stream } from "stream";
import { join } from "path";
import { Track } from "@typings/Track";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { embed as embedMessage, stream } from "config";

const streamFileRootPath = join(process.cwd(), stream.directoryPath);

export default class Music {

  menuItemsLimit = 10;

  async fetchAlbumData(albumId: string) {
    const response = await api.get(`/data/albums/${albumId}.json`);
    const album: Album = response.data;
    album.tracks.items.forEach((t, i) => {
      album.tracks.items[i].album = album;
    })
    return album;
  }

  async fetchAlbums(): Promise<Paging<Album>> {
    const response = await api.get("/data/albums.json");
    return response.data;
  }

  async fetchTestAlbum() {
    const response = await api.get("/test/data/album.json");
    const album: Album = response.data;
    album.tracks.items.forEach((t, i) => {
      album.tracks.items[i].album = album;
    })
    return album;
  }

  async createTrackStream(guildId: string, trackId: string, enableTestMode: boolean): Promise<string> {
    const response = await api.get(
      enableTestMode ? `/test/streams/${trackId}.mp3` : `/streams/${trackId}.mp3`,
      {
        responseType: "stream"
      },
    );

    const guildStreamDIrectory = join(streamFileRootPath, guildId);
    if (!existsSync(guildStreamDIrectory)) {
      mkdirSync(guildStreamDIrectory);
    }

    const trackStreamPath = join(guildStreamDIrectory, trackId);
    const writer = createWriteStream(trackStreamPath);
    const buffers: Buffer[] = [];
    const audioStream: Stream = response.data;

    return new Promise((resolve, reject) => {
      audioStream.on("data", chunk => {
        buffers.push(chunk);
      });
      audioStream.on("end", () => {
        Readable.from(buffers).pipe(writer);
        resolve(trackStreamPath);
      });
      audioStream.on("error", (error: Error) => {
        reject(error);
      });
    });
  }

  async getAlbumByUserSelection(message: CommandMessage, getTracks?: boolean) {
    const albumsData = await this.fetchAlbums();
    const totalPage = Math.ceil(albumsData.items.length / this.menuItemsLimit);
    let page = 1;

    const getComponentRows = () => {
      const offset = this.menuItemsLimit * (page - 1);
      const limit = this.menuItemsLimit * page;

      const select = new StringSelectMenuBuilder()
        .setCustomId("album")
        .setPlaceholder(`Currently viewing page ${page}/${totalPage}`)
        .addOptions(
          ...albumsData.items.slice(offset, limit).map(
            album => new StringSelectMenuOptionBuilder()
              .setLabel(album.name)
              .setDescription(album.artists.map(artist => artist.name).join(", "))
              .setValue(album.id)
          )
        );
      const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(select);
        
      const buttons = [
        new ButtonBuilder()
          .setCustomId("start")
          .setEmoji("⏪")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId("prev")
          .setEmoji("⬅️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("➡️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page >= totalPage),
        new ButtonBuilder()
          .setCustomId("end")
          .setEmoji("⏩")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= totalPage),
        new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger),
      ];
      const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(...buttons);

      return {
        components: [menuRow, buttonRow],
      };
    }

    const trackListingMessage = await message.reply(getComponentRows());
    while (true) {
      try {
        const interaction = await trackListingMessage.awaitMessageComponent({
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
          case "cancel":
            interaction.update({
              components: [],
              embeds: [
                new EmbedBuilder()
                  .setColor(embedMessage.colors.success)
                  .setDescription("Cancelled Successfully")
              ],
            });
            return null;
          case "album":
            const albumId = (interaction as StringSelectMenuInteraction).values[0];
            const album = (
              getTracks
                ? await this.fetchAlbumData(albumId)
                : albumsData.items.find(a => a.id === albumId) as Album
            );
            interaction.update({
              components: [],
              embeds: [
                new EmbedBuilder()
                  .setColor(embedMessage.colors.success)
                  .setDescription(`\`Album:\` **${album.name}** by \`${album.artists.map(a => a.name).join(", ")}\``)
              ],
            });
            return album;
        }
        interaction.update(getComponentRows());
      } catch (error) {
        trackListingMessage.edit({
          components: [],
          embeds: [
            new EmbedBuilder()
              .setColor(embedMessage.colors.error)
              .setDescription("Time's up!")
          ],
        });
        return null;
      }
    }
  }

  async getTrackByUserSelection(message: CommandMessage, albumId: string) {
    const album = await this.fetchAlbumData(albumId);
    const tracks = album.tracks;
    const totalPage = Math.ceil(tracks.items.length / this.menuItemsLimit);
    let page = 1;

    const getComponentRows = () => {
      const offset = this.menuItemsLimit * (page - 1);
      const limit = this.menuItemsLimit * page;

      const select = new StringSelectMenuBuilder()
        .setCustomId("track")
        .setPlaceholder(`Currently viewing page ${page}/${totalPage}`)
        .addOptions(
          ...tracks.items.slice(offset, limit).map(
            track => new StringSelectMenuOptionBuilder()
              .setLabel(track.name)
              .setDescription(track.artists.map(artist => artist.name).join(", "))
              .setValue(track.id)
          )
        );
      const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(select);
        
      const buttons = [
        new ButtonBuilder()
          .setCustomId("start")
          .setEmoji("⏪")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId("prev")
          .setEmoji("⬅️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("➡️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page >= totalPage),
        new ButtonBuilder()
          .setCustomId("end")
          .setEmoji("⏩")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= totalPage),
        new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger),
      ];
      const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(...buttons);

      return {
        components: [menuRow, buttonRow],
      };
    }

    const trackListingMessage = await message.reply(getComponentRows());
    while (true) {
      try {
        const interaction = await trackListingMessage.awaitMessageComponent({
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
          case "cancel":
            interaction.update({
              components: [],
              embeds: [
                new EmbedBuilder()
                  .setColor(embedMessage.colors.success)
                  .setDescription("Cancelled Successfully")
              ],
            });
            return null;
          case "track":
            const trackId = (interaction as StringSelectMenuInteraction).values[0];
            const track = tracks.items.find(t => t.id === trackId) as Track;
            interaction.update({
              components: [],
              embeds: [
                new EmbedBuilder()
                  .setColor(embedMessage.colors.success)
                  .setDescription(`\`Track:\` **${track.name}** by \`${track.artists.map(a => a.name).join(", ")}\``)
              ],
            });
            return track;
        }
        interaction.update(getComponentRows());
      } catch (error) {
        trackListingMessage.edit({
          components: [],
          embeds: [
            new EmbedBuilder()
              .setColor(embedMessage.colors.error)
              .setDescription("Time's up!")
          ],
        });
        return null;
      }
    }
  }

}
