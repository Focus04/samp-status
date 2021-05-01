const { MessageAttachment } = require('discord.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const moment = require('moment');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);
const intervals = new Keyv(process.env.intervals);
const maxPlayers = new Keyv(process.env.maxPlayers);
const { reactionError, reactionSuccess, deletionTimeout } = require('../config.json');
const { getChart } = require('../utils/getChart');
const { getRoleColor } = require('../utils/getRoleColor')

module.exports = {
  name: 'serverchart',
  description: 'Sends a chart displaying server statistics for each day.',
  usage: 'serverchart',
  async execute(message, prefix) {
    let loadingMsg = await message.channel.send('Fetching server info...');
    const interval = await intervals.get(message.guild.id);
    if (!interval) {
      let msg = await loadingMsg.edit(`You must set an interval to view statistics. Set one using ${prefix}setinterval`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    const serverAddress = await servers.get(message.guild.id);
    const data = await maxPlayers.get(`${serverAddress.ip}:${serverAddress.port}`);
    const color = getRoleColor(message.guild);
    const attachment = await getChart(data, color, ChartJSNodeCanvas, MessageAttachment, moment);
    await loadingMsg.delete();
    await message.channel.send(attachment);
    message.react(reactionSuccess);
  }
}
