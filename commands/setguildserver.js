const gamedig = require('gamedig');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);
const { reactionError, reactionSuccess } = require('../config.json');

module.exports = {
  name: 'setguildserver',
  description: `Sets a per guild SA:MP server to receive updates on.`,
  usage: 'setguildserver `ip` `port`',
  requiredPerms: 'MANAGE_GUILD',
  permError: 'You require the Manage Server permission in order to run this command.',
  async execute(message, args, prefix) {
    let loading = await message.channel.send('This will take a moment...');
    if (!args[1] || isNaN(args[1])) {
      let msg = await loading.edit(`Proper command usage: ${prefix}setguildserver [ip] [port]`);
      return message.react(reactionError);
    }

    let err = 0;
    await gamedig.query({
      type: 'samp',
      host: args[0],
      port: args[1]
    }).catch(async (error) => {
      let msg = await loading.edit(`Couldn't find ${args[0]}:${args[1]}`);
      message.react(reactionError);
      err = 1;
    });
    if (err === 1) return;
    let Server = {};
    Server.ip = args[0];
    Server.port = args[1];
    await servers.set(message.guild.id, Server);
    const config = message.client.guildConfigs.get(message.guild.id);
    config.server = Server;
    message.client.guildConfigs.set(message.guild.id, config);
    await loading.edit(`You can now use ${prefix}status to view information about ${args[0]}:${args[1]}`);
    message.react(reactionSuccess);
  }
}