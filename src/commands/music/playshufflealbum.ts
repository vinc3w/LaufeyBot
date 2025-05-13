import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { PlayerState } from "@typings/Player";
import { ChannelType } from "discord.js";
import { Track } from "@typings/Track";
import { ParameterType } from "@typings/Command";
import { Album } from "@typings/Album";

export default class PlayShuffleAlbumCommand extends Command {

  description = "Shuffle an album and play it.";
  alternativeNames = ["psa"];
  parameters = [
    {
      name: "use test album",
      description: "play test album",
      required: false,
      type: ParameterType.STRING,
      dev: true,
    }
  ];

  async execute(client: BotClient, message: CommandMessage, playTestalbum: string) {
    if (!message.member) return; 
    try {
      const voiceState = await message.member.voice.fetch();
      const voiceChannel = voiceState.channel;

      if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
        message.replyError("The voice channel that you are in is invalid!");
        return;
      }

      const player = message.guild.getPlayer();
      let tracks: Track[];
      let album: Album | null;

      if (playTestalbum) {
        album = await player.music.fetchTestAlbum();
        tracks = album.tracks.items;
      } else {
        album = await player.music.getAlbumByUserSelection(message, true);
        if (!album) return;
        tracks = album.tracks.items;
      }
      
      player.joinChannel(voiceChannel, message.channel);
      tracks
      // shuffle
      .map(t => ({ value: t, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(t => t.value)
      // end shuffle
      .forEach(track => {
        player.addToQueue(track);
      });
      if (player.state !== PlayerState.PLAYING) {
        player.play();
      } else {
        message.replySuccess(`\`${album.name}\`'s tracks added to queue.`);
      }
    } catch (error) {
      message.replyError("You must be in a voice channel to use this command!");
    }
  }

}
