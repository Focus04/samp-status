import { SlashCommandBuilder } from '@discordjs/builders'
import Keyv from 'keyv'
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);
const maxPlayers = new Keyv(process.env.maxPlayers);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setinterval')
    .setDescription(`Sets a channel for status messages to be sent in.`)
    .addChannelOption((option) => option
      .setName('channel-name')
      .setDescription('Tag the channel you want status updates to be sent in.')
      .setRequired(true)
    )
    .addIntegerOption((option) => option
      .setName('minutes')
      .setDescription('The interval updates will be sent at (at least 3).')
      .setRequired(true)
    ),
  usage: 'setinterval `channel-name` `minutes`',
  requiredPerms: 'MANAGE_GUILD',
  permError: 'You require the Manage Server permission in order to run this command.',
  async execute(interaction) {
    let loading = await message.channel.send('This will take a moment...');
    if (!args[1] || isNaN(args[1])) {
      let msg = await loading.edit(`Proper command usage /setinterval [channel-name] [minutes]`);
    }

    let channel = message.mentions.channels.first();
    if (!channel) channel = message.guild.channels.cache.find((ch) => ch.name === args[0]);
    if (!channel) {
      let msg = await loading.edit(`Couldn't find ${args[0]}`);
    }

    if (args[1] < 3) {
      let msg = await loading.edit(`Minutes can't be lower than 3.`);
    }

    const server = await servers.get(message.guild.id);
    if (!server) {
      let msg = await loading.edit(`This server doesn't have a server linked to it yet. Type /setguildserver to setup one.`);
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
  }
}