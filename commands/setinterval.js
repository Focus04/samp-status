const Keyv = require('keyv');
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);
const maxPlayers = new Keyv(process.env.maxPlayers);
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
      return message.react(reactionError);
    }

    let channel = message.mentions.channels.first();
    if (!channel) channel = message.guild.channels.cache.find((ch) => ch.name === args[0]);
    if (!channel) {
      let msg = await loading.edit(`Couldn't find ${args[0]}`);
      return message.react(reactionError);
    }

    if (args[1] < 3) {
      let msg = await loading.edit(`Minutes can't be lower than 3.`);
      return message.react(reactionError);
    }

    const server = await servers.get(message.guild.id);
    if (!server) {
      let msg = await loading.edit(`This server doesn't have a server linked to it yet. Type ${prefix}setguildserver to setup one.`);
      return message.react(reactionError);
    }

    let Interval = {};
    Interval.channel = channel.id;
    Interval.time = args[1] * 60000;
    Interval.next = Date.now();
    Interval.message = loading.id;
    await intervals.set(message.guild.id, Interval);
    const config = message.client.guildConfigs.get(message.guild.id);
    config.interval = Interval;
    message.client.guildConfigs.set(message.guild.id, config);
    const serverData = await maxPlayers.get(`${server.ip}:${server.port}`);
    if (!serverData) {
      const data = {};
      data.maxPlayersToday = -1;
      data.days = [];
      await maxPlayers.set(`${server.ip}:${server.port}`, data);
    }
    await loading.edit(`Successfully set an interval.`);
    message.react(reactionSuccess);
  }
}