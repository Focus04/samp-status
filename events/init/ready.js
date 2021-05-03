const { MessageEmbed, MessageAttachment } = require('discord.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { table, getBorderCharacters } = require('table');
const gamedig = require('gamedig');
const moment = require('moment');
const Keyv = require('keyv');
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);
const maxPlayers = new Keyv(process.env.maxPlayers);
const { getChart } = require('../../utils/getChart');
const { getStatus, getPlayerCount } = require('../../utils/getStatus');
const { getRoleColor } = require('../../utils/getRoleColor');

module.exports = async (client) => {
  console.log('I am live');
  client.user.setActivity('SA:MP');
  setInterval(() => {
    client.guilds.cache.forEach(async (guild) => {
      const time = await intervals.get(guild.id);
      if (time && Date.now() >= time.next) {
        time.next = Date.now() + time.time;
        const server = await servers.get(guild.id);
        const chartData = await maxPlayers.get(`${server.ip}:${server.port}`);
        const playerCount = await getPlayerCount(server, gamedig);
        if (playerCount > chartData.maxPlayersToday) chartData.maxPlayersToday = playerCount;
        await maxPlayers.set(`${server.ip}:${server.port}`, chartData);
        const channel = guild.channels.cache.get(time.channel);
        const color = getRoleColor(guild);
        const status = await getStatus(server, color, MessageEmbed, getBorderCharacters, gamedig, table);
        const oldMsg = await channel.messages.fetch(time.message).catch((err) => console.log(err));
        if (oldMsg) oldMsg.delete();
        let msg = await channel.send(status);
        time.message = msg.id;
        await intervals.set(guild.id, time);
      }
    });
  }, 60000);
  setInterval(async () => {
    const nextCheck = await maxPlayers.get('next');
    if (Date.now() >= nextCheck) {
      await maxPlayers.set('next', nextCheck + 86400000);
      client.guilds.cache.forEach(async (guild) => {
        const time = await intervals.get(guild.id);
        if (!time) return;
        const serverAddress = await servers.get(guild.id);
        const data = await maxPlayers.get(`${serverAddress.ip}:${serverAddress.port}`);
        const interval = await intervals.get(guild.id);
        let ChartData = {};
        ChartData.value = data.maxPlayersToday;
        ChartData.date = Date.now();
        data.maxPlayersToday = -1;
        if (ChartData.value >= 0) data.days.push(ChartData);
        if (data.days.length > 30) data.days.shift();
        const channel = await client.channels.fetch(interval.channel).catch((err) => console.log(err));
        const color = getRoleColor(guild);
        const chart = await getChart(data, color, ChartJSNodeCanvas, MessageAttachment, moment);
        const oldMsg = await channel.messages.fetch(data.msg).catch((err) => console.log(err));
        if (oldMsg) oldMsg.delete();
        const msg = await channel.send(chart);
        data.msg = msg.id;
        await maxPlayers.set(`${serverAddress.ip}:${serverAddress.port}`, data);
      });
    }
  }, 3600000);
}