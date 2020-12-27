const Keyv = require('keyv');
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);
const { reactionError, reactionSuccess, deletionTimeout } = require('../config.json');

module.exports = {
  name: 'setinterval',
  description: `Sets a channel for status messages to be sent in.`,
  usage: 'setinterval `channel-name` `minutes`',
  requiredPerms: 'MANAGE_GUILD',
  permError: 'You require the Manage Server permission in order to run this command.',
  async execute(message, args, prefix) {
    let loading = await message.channel.send('This will take a moment...');
    if (!args[1] || isNaN(args[1])) {
      let msg = await loading.edit(`Proper command usage ${prefix}setinterval [channel-name] [minutes]`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    const channel = message.guild.channels.cache.find((ch) => ch.name === args[0]);
    if (!channel) {
      let msg = await loading.edit(`Couldn't find ${args[0]}`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    if (args[1] < 3) {
      let msg = await loading.edit(`Minutes can't be lower than 3.`);
      msg.delete({timeout: deletionTimeout });
      return message.react(reactionError);
    }

    const server = await servers.get(message.guild.id);
    if (!server) {
      let msg = await loading.edit(`This server doesn't have a server linked to it yet. Type ${prefix}setguildserver to setup one.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    let Interval = {};
    Interval.channel = channel.id;
    Interval.time = args[1] * 60000;
    Interval.next = Date.now();
    Interval.message = loading.id;
    await intervals.set(message.guild.id, Interval);
    await loading.edit(`Successfully set an interval.`);
    message.react(reactionSuccess);
  }
}