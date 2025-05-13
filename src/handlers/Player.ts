import BotClient from "@structures/BotClient";
import Music from "@handlers/Music";
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection
} from "@discordjs/voice";
import { Guild, TextChannel, VoiceChannel } from "discord.js";
import { CurrentTrack } from "@typings/CurrentTrack";
import { Track } from "@typings/Track";
import { LoopState, PlayerState } from "@typings/Player";

export default class Player {

  client: BotClient;
  guild: Guild;
  state = PlayerState.OFF;
  loopState = LoopState.OFF;
  queue: Track[] = [];
  currentTrack: CurrentTrack | null = null;
  voiceChannel: VoiceChannel | null = null;
  textChannel: TextChannel | null = null;
  connection: VoiceConnection | null = null;
  player: AudioPlayer | null = null;
  music = new Music();

  constructor(client: BotClient, guild: Guild) {
    this.client = client;
    this.guild = guild;
  }

  joinChannel(voiceChannel: VoiceChannel, textChannel: TextChannel) {
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
  }

  async play() {
    if (!this.connection) throw new Error("Bot is not in a voice channel!");
    if (!this.player) {
      this.createPlayer();
    };
    
    if (!this.currentTrack) return;
    // to remove typescript error as "this.player" is possible
    // null due to typescript type checking
    if (!this.player) return;

    try {
      const track = this.queue[this.currentTrack.queueNumber];
      const streamPath = await this.music.createTrackStream(this.guild.id, track.id, Boolean(track.dev));
      const resource = createAudioResource(streamPath);
      this.connection.subscribe(this.player);
      this.player.play(resource);
      this.state = PlayerState.PLAYING;
    } catch (error) {
      this.textChannel?.sendError("Something went wrong 😑. Please try again later.");
      this.stop();
    }
  }

  pause() {
    this.player?.pause();
    this.state = PlayerState.PAUSED;
  }

  resume() {
    this.player?.unpause();
    this.state = PlayerState.PLAYING;
  }

  stop() {
    this.connection?.destroy();
    this.connection = null;
    return this.stopWithoutLeaving();
  }

  stopWithoutLeaving() {
    const voiceChannelTemp = this.voiceChannel;

    this.player?.stop();
    this.player = null;
    this.state = PlayerState.OFF;
    this.loopState = LoopState.OFF;
    this.queue = [];
    this.currentTrack = null;
    this.textChannel = null;
    this.voiceChannel = null;

    return voiceChannelTemp;
  }

  setLoopState(loopstate: LoopState) {
    this.loopState = loopstate;
  }

  addToQueue(track: Track) {
    if (!this.queue.length) {
      this.setCurrentTrack(track);
    }
    this.queue.push(track);
  }

  skip() {
    if (!this.currentTrack) return;

    const index = this.currentTrack.queueNumber + 1;
    const track = this.queue[index];

    if (!track) {
      this.stopWithoutLeaving();
      return;
    }

    this.setCurrentTrack(track, index);
    this.play();
  }

  setCurrentTrack(track: Track, index = 0) {
    this.currentTrack = {
      ...track,
      queueNumber: index,
      startPlayDate: null,
    };
  }

  createPlayer() {
    this.player = createAudioPlayer();
    
    // when an audio finished playing
    this.player.on(AudioPlayerStatus.Idle, async () => {
      if (!this.currentTrack || !this.textChannel) return;
      const index = this.currentTrack.queueNumber + 1;
      const track = this.queue[index];

      switch (this.loopState) {
        case LoopState.QUEUE: {
          if (!track) {
            this.setCurrentTrack(this.queue[0], 0);
          } else {
            this.setCurrentTrack(track, index);
          }
          break;
        }
        case LoopState.TRACK: {
          break;
        }
        case LoopState.OFF: {
          if (!track) {
            this.stopWithoutLeaving();
            this.textChannel.sendInfo("Queue has ended");
            return;
          }
          this.setCurrentTrack(track, index);
          break;
        }
      }

      this.play();
    });

    this.player.on(AudioPlayerStatus.Playing, oldState => {
      if (
        !this.currentTrack ||
        !this.textChannel ||
        oldState.status === AudioPlayerStatus.AutoPaused
      ) return;
      this.currentTrack.startPlayDate = new Date();
      this.textChannel.sendInfo(`Now playing \`${this.currentTrack.name}\``);
    });
  }

}
