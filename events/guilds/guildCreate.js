const commands = require('../../index');

module.exports = async (client, guild) => {
  client.application.commands.set(commands, guild.id);
}