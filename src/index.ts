// system setup
import env from "env";

if (env.ENVIRONMENT === "production") {
  require("module-alias/register");
}

// Register extenders
import "@helpers/extenders/Guild";
import "@helpers/extenders/TextChannel";
import "@helpers/extenders/Message";

// Bot
import BotClient from "@structures/BotClient";
import { GatewayIntentBits } from "discord.js";

const client = new BotClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.loadEvents("src/events");
client.loadCommands("src/commands");
client.clearStreamDirectory();

client.login(env.BOT_TOKEN);
