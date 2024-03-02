import { Collection } from 'discord.js';
import { getChart } from '../../utils/getChart.js';
import { getStatus, getPlayerCount } from '../../utils/getStatus.js';
import { getRoleColor } from '../../utils/getRoleColor.js';
import index from '../../index.js';
const commands = index;
import Keyv from 'keyv';
const intervals = new Keyv(process.env.database, { collection: 'intervals' });
const servers = new Keyv(process.env.database, { collection: 'samp-servers' });
const maxPlayers = new Keyv(process.env.database, { collection: 'max-members' });
const uptimes = new Keyv(process.env.database, { collection: 'uptime' });

export default {
  name: 'ready',
  execute: async (client) => {
    console.log('I am live');

    client.user.setActivity('SA:MP');

    client.guilds.cache.forEach((guild) => {
      client.application.commands.set(commands, guild.id).catch((err) => console.log(`Error: Could not create commands on guild ${guild.id}!`));
    });

    client.guildConfigs = new Collection();
    client.guilds.cache.forEach(async (guild) => {
      let server = await servers.get(guild.id);
      let interval = await intervals.get(guild.id);
      const config = {
        server,
        interval
      }
      client.guildConfigs.set(guild.id, config);
    });

    setInterval(() => {
      client.guilds.cache.forEach(async (guild) => {
        const guildConfigs = client.guildConfigs.get(guild.id);
        if (!guildConfigs) return;
        const { interval = 0, server = 0 } = guildConfigs;
        if (!interval || Date.now() < interval.next) return;
        interval.next = Date.now() + 180000;
        let onlineStats = await uptimes.get(`${server.ip}:${server.port}`);
        if (!onlineStats) {
          onlineStats = {
            uptime: 0,
            downtime: 0
          }
        }
        let chartData = await maxPlayers.get(`${server.ip}:${server.port}`);
        if (!chartData) return;
        const info = await getPlayerCount(server);
        if (info.playerCount > chartData.maxPlayersToday) chartData.maxPlayersToday = info.playerCount;
        chartData.name = info.name;
        chartData.maxPlayers = info.maxPlayers;
        await maxPlayers.set(`${server.ip}:${server.port}`, chartData);
        const channel = await client.channels
          .fetch(interval.channel)
          .catch((err) => console.log(`Error: Could not fetch channel ${interval.channel} in guild ${guild.id}!`));
        if (!channel) return;
        const color = getRoleColor(guild);
        const serverEmbed = await getStatus(server, color);
        if (!serverEmbed.data.fields) onlineStats.downtime++;
        else onlineStats.uptime++;
        await uptimes.set(`${server.ip}:${server.port}`, onlineStats);
        channel.messages
          .fetch(interval.message)
          .then((oldMsg) => oldMsg.delete())
          .catch((err) => console.log(`Error: Could not delete message ${interval.message} in channel ${interval.channel} in guild ${guild.id}!`));
        channel
          .send({ embeds: [serverEmbed] })
          .then((msg) => interval.message = msg.id)
          .catch((err) => console.log(`Error: Could not send message in channel ${interval.channel} in guild ${guild.id}!`));
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
          if (!data) return;
          let ChartData = {};
          ChartData.value = data.maxPlayersToday;
          ChartData.date = Date.now();
          if (!data.days) data.days = [];
          if (ChartData.value >= 0) data.days.push(ChartData);
          if (data.days.length > 30) data.days.shift();
          await maxPlayers.set(`${server.ip}:${server.port}`, data);
          const channel = await client.channels
            .fetch(interval.channel)
            .catch((err) => console.log(`Error: Could not fetch channel ${interval.channel} in guild ${guild.id}!`));
          if (!channel) return;
          const color = getRoleColor(guild);
          const chart = await getChart(data, color);
          channel
            .send({ files: [chart] })
            .then((msg) => data.msg = msg.id)
            .catch((err) => console.log(`Error: Could not send message in channel ${interval.channel} in guild ${guild.id}!`));
        });
        setTimeout(() => {
          client.guilds.cache.forEach(async (guild) => {
            const { interval = 0, server = 0 } = client.guildConfigs.get(guild.id);
            if (!interval) return;
            const data = await maxPlayers.get(`${server.ip}:${server.port}`);
            if (!data) return;
            data.maxPlayersToday = -1;
            await maxPlayers.set(`${server.ip}:${server.port}`, data);
          });
        }, 60000);
      }
    }, 3600000);
  }
}