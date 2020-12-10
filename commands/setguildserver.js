const fetch = require('node-fetch');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);
const { reactionError, reactionSuccess, deletionTimeout } = require('../config.json');

module.exports = {
  name: 'setguildserver',
  description: `Displays the bot's current latency in ms.`,
  usage: 'setguildserver `ip` `port`',
  requiredPerms: 'MANAGE_GUILD',
  permError: 'You require the Manage Server permission in order to run this command.',
  async execute(message, args, prefix) {
    if (!args[1] || isNaN(args[1])) {
      let msg = await message.channel.send(`Proper command usage: ${prefix}setguildserver [ip] [port]`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    const response = await fetch(`https://monitor.teamshrimp.com/api/fetch/all/${args[0]}/${args[1]}/`);
    const data = await response.json();
    if (data.error_code === 2) {
      let msg = await message.channel.send(`Couldn't find ${args[0]}:${args[1]}`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    let Server = {};
    Server.ip = args[0];
    Server.port = args[1];
    await servers.set(message.guild.id, Server);
    message.channel.send(`You can now use ${prefix}status to view information about ${args[0]}:${args[1]}`);
    message.react(reactionSuccess);
  }
}