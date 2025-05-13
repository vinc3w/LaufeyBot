import Logger from "@helpers/Logger";
import Player from "@handlers/Player";
import Command from "@structures/Command";
import { Client, Guild, OAuth2Guild } from "discord.js";
import { recursivelyReadDirectory } from "@helpers/Utils";
import { basename, extname, join } from "path";
import { existsSync, mkdirSync, rmSync } from "fs";
import { bot, stream } from "config";

export default class BotClient extends Client {

  commands: { [key: string]: Command } = {};
  players: { [key: string]: Player } = {};
  logger = Logger;

  loadEvents(path: string) {
    const files = recursivelyReadDirectory(path);
    const total = files.length;
    let succeeded = 0;

    files.forEach(file => {
      try {
        const execute = require(file);
        const event = basename(file, extname(file));
        this.on(event, (...args) => execute(this, ...args));
        succeeded++;
      } catch (error) {
        this.logger.error(error);
      }
    });

    this.logger.info(`Events loaded (${succeeded}/${total})`);
  }

  loadCommands(path: string) {
    const files = recursivelyReadDirectory(path);
    const total = files.length;
    let succeeded = 0;

    files.forEach(file => {
      try {
        const CommandClass = require(file).default;
        const command: Command = new CommandClass();
        const name = basename(file, extname(file));
        this.commands[bot.prefix + name] = command;
        command.alternativeNames.forEach(n => {
          this.commands[bot.prefix + n] = command;
        });
        succeeded++;
      } catch (error) {
        this.logger.error(error);
      }
    });

    this.logger.info(`Commands loaded (${succeeded}/${total})`);
  }

  clearStreamDirectory() {
    const path = join(process.cwd(), stream.directoryPath);
    if (existsSync(path)) {
      rmSync(path, { recursive: true });
    }
    mkdirSync(path);
  }

  async loadPlayers() {
    if (!this.isReady()) return;
    const guilds = await this.guilds.fetch();
    const total = guilds.size;
    let succeeded = 0;

    guilds.forEach(guild => {
      this.loadPlayer(guild);
      succeeded++;
    });

    this.logger.info(`Music players loaded (${succeeded}/${total})`);
  }

  loadPlayer(guild: Guild | OAuth2Guild) {
    if (!this.isReady()) return;
    this.players[guild.id] = new Player(this, guild as Guild);
  }

  getPlayer(guildId: string) {
    return this.players[guildId];
  }

  destroyPlayer(guild: Guild) {
    delete this.players[guild.id];
  }

}
