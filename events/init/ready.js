const { Collection } = require('discord.js');
const { getChart } = require('../../utils/getChart');
const { getStatus, getPlayerCount } = require('../../utils/getStatus');
const { getRoleColor } = require('../../utils/getRoleColor');
const commands = require('../../index');
const gamedig = require('gamedig');
const Keyv = require('keyv');
const prefixes = new Keyv(process.env.prefixes);
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);
const maxPlayers = new Keyv(process.env.maxPlayers);

module.exports = async (client) => {
  console.log('I am live');
  
  client.user.setActivity('SA:MP');

  client.guilds.cache.forEach((guild) => {
    client.application.commands.set(commands, guild.id).catch((err) => console.log(err));
  });

  client.guildConfigs = new Collection();
  client.guilds.cache.forEach(async (guild) => {
    let prefix = await prefixes.get(guild.id);
    let server = await servers.get(guild.id);
    let interval = await intervals.get(guild.id);
    const config = {
      prefix,
      server,
      interval
    }
    client.guildConfigs.set(guild.id, config);
  });

  setInterval(() => {
    client.guilds.cache.forEach(async (guild) => {
      const { interval = 0, server = 0 } = client.guildConfigs.get(guild.id);
      if (!interval || Date.now() < interval.next) return;
      interval.next = Date.now() + interval.time;
      const chartData = await maxPlayers.get(`${server.ip}:${server.port}`);
      const playerCount = await getPlayerCount(server, gamedig);
      if (playerCount > chartData.maxPlayersToday) chartData.maxPlayersToday = playerCount;
      await maxPlayers.set(`${server.ip}:${server.port}`, chartData);
      const channel = await client.channels
        .fetch(interval.channel)
        .catch((err) => console.log(err));
      if (!channel) return;
      const color = getRoleColor(guild);
      const status = await getStatus(server, color);
      const oldMsg = await channel.messages
        .fetch(interval.message)
        .catch((err) => console.log(err));
      if (oldMsg) oldMsg.delete();
      let msg = await channel.send({ embeds: [status] });
      interval.message = msg.id;
      await intervals.set(guild.id, interval);
    });
  }, 60000);
  
  setInterval(async () => {
    const nextCheck = await maxPlayers.get('next');
    if (Date.now() >= nextCheck) {
      await maxPlayers.set('next', nextCheck + 86400000);
      client.guilds.cache.forEach(async (guild) => {
        const { interval = 0, server = 0 } = client.guildConfigs.get(guild.id);
        if (!interval) return;
        const data = await maxPlayers.get(`${server.ip}:${server.port}`);
        let ChartData = {};
        ChartData.value = data.maxPlayersToday;
        ChartData.date = Date.now();
        data.maxPlayersToday = -1;
        if (ChartData.value >= 0) data.days.push(ChartData);
        if (data.days.length > 30) data.days.shift();
        const channel = await client.channels
          .fetch(interval.channel)
          .catch((err) => console.log(err));
        if (!channel) return;
        const color = getRoleColor(guild);
        const chart = await getChart(data, color);
        const oldMsg = await channel.messages
          .fetch(data.msg)
          .catch((err) => console.log(err));
        if (oldMsg) oldMsg.delete();
        const msg = await channel.send({ files: [chart] });
        data.msg = msg.id;
        await maxPlayers.set(`${server.ip}:${server.port}`, data);
      });
    }
  }, 3600000);
}