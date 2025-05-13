import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { ChannelType } from "discord.js";
import { PlayerState } from "@typings/Player";
import { ParameterType } from "@typings/Command";
import { Track } from "@typings/Track";

export default class PlayCommand extends Command {

  description = "Plays the music you want.";
  alternativeNames = ["p"];
  parameters = [
    {
      name: "test file count",
      description: "how many audio test file to use.",
      required: false,
      type: ParameterType.INTEGER,
      dev: true,
    }
  ];

  async execute(client: BotClient, message: CommandMessage, testFileCount: number) {
    if (!message.member) return; 
    try {
      const voiceState = await message.member.voice.fetch();
      const voiceChannel = voiceState.channel;

      if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
        message.replyError("The voice channel that you are in is invalid!");
        return;
      }

      const player = message.guild.getPlayer();
      let tracks: Track[] = [];

      if (testFileCount) {
        const testAlbum = await player.music.fetchTestAlbum();
        testAlbum.tracks.items.slice(0, testFileCount).forEach(track => {
          tracks.push(track);
          player.addToQueue(track);
        });
      } else {
        const album = await player.music.getAlbumByUserSelection(message);
        if (!album) return;
        const track = await player.music.getTrackByUserSelection(message, album.id);
        if (!track) return;
        tracks.push(track);
        player.addToQueue(track);
      }
      
      player.joinChannel(voiceChannel, message.channel);
      if (player.state !== PlayerState.PLAYING) {
        player.play();
      } else {
        message.replySuccess(`${tracks.map(t => `\`${t.name}\``).join(", ")} added to queue.`);
      }
    } catch (error) {
      message.replyError("You must be in a voice channel to use this command!");
    }
  }

}
