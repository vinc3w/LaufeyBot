import BotClient from "@structures/BotClient";
import Command from "@structures/Command";
import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from "discord.js";
import { CommandMessage } from "@helpers/extenders/CommandMessage";
import { ParameterType } from "@typings/Command";
import { embed as embedMessage } from "config";
import { readdirSync } from "fs";
import { basename, extname, join } from "path";
import { transformToTitleCase } from "@helpers/Utils";

export default class HelpCommand extends Command {

  description = "Show all available commands.";
  alternativeNames = ["h", "commands", "cmds", "cmd"];

  async execute(client: BotClient, message: CommandMessage) {
    const categoryPath = join(process.cwd(), "src/commands");
    const categories = readdirSync(categoryPath);
    let listing: { [key: string]: string[] } = {};
    let currentCategory = categories[0];

    categories.forEach(category => {
      const commandPath = join(categoryPath, category);
      const commands = readdirSync(commandPath);
      listing[category] = [];
      commands.forEach(commandName => {
        const name = basename(commandName, extname(commandName));
        const command: Command = new (require(join(commandPath, commandName)).default);
        listing[category].push((() => {
          const parameters = command.parameters
            .filter(p => p.dev)
            .map(p => `\n<${p.name}> \`${ParameterType[p.type].toLowerCase()}\``);
          return `\`${name}\`${parameters}\n${command.description}`;
        })())
      });
    });

    const createMessage = () => {
      const embed = new EmbedBuilder()
        .setColor(embedMessage.colors.info)
        .setTitle(`${transformToTitleCase(currentCategory)} Category`)
        .setDescription(listing[currentCategory].join("\n\n"));

      const select = new StringSelectMenuBuilder()
        .setCustomId("album")
        .setPlaceholder("Choose category")
        .addOptions(
          ...categories.map(
            c => new StringSelectMenuOptionBuilder()
              .setLabel(transformToTitleCase(c))
              .setValue(c)
          )
        );
      const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(select);

      return {
        embeds: [embed],
        components: [row],
      };
    }

    const helpMessage = await message.reply(createMessage());

    while (true) {
      try {
        const interaction = await helpMessage.awaitMessageComponent({
          filter: i => i.user.id === message.author.id,
          componentType: ComponentType.StringSelect,
          time: 60_000,
        });
        currentCategory = interaction.values[0];
        interaction.update(createMessage());
      } catch (error) {
        return;
      }
    }
  } 

}

