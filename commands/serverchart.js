const { SlashCommandBuilder } = require('@discordjs/builders');
const Keyv = require('keyv');
const intervals = new Keyv(process.env.intervals);
const maxPlayers = new Keyv(process.env.maxPlayers);
const { reactionError, reactionSuccess } = require('../config.json');
const { getChart } = require('../utils/getChart');
const { getRoleColor } = require('../utils/getRoleColor')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverchart')
    .setDescription('Sends a chart displaying server statistics for each day.'),
  usage: 'serverchart',
  async execute(interaction) {
    let loadingMsg = await message.channel.send('Fetching server info...');
    const interval = await intervals.get(message.guild.id);
    if (!interval) {
      let msg = await loadingMsg.edit(`You must set an interval to view statistics. Set one using ${prefix}setinterval`);
      return message.react(reactionError);
    }

    const { server } = message.client.guildConfigs.get(message.guild.id);
    const data = await maxPlayers.get(`${server.ip}:${server.port}`);
    const color = getRoleColor(message.guild);
    const attachment = await getChart(data, color);
    await loadingMsg.delete();
    await message.channel.send(attachment);
    message.react(reactionSuccess);
  }
}
