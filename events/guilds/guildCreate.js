const commands = require('../../index');

module.exports = async (client, guild) => {
  await client.application.commands.set(commands, guild.id);
}