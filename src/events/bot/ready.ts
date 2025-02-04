import BotClient from "@structures/BotClient";

module.exports = (client: BotClient) => {
  client.logger.info(`Logged in as ${client.user?.tag}`);

  client.loadPlayers();
}
