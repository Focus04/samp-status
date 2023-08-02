import { Collection } from 'discord.js';
import { getChart } from '../../utils/getChart.js';
import { getStatus, getPlayerCount } from '../../utils/getStatus.js';
import { getRoleColor } from '../../utils/getRoleColor.js';
import index from '../../index.js';
const commands = index;
import Keyv from 'keyv';
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);
const maxPlayers = new Keyv(process.env.maxPlayers);

export default {
  name: 'ready',
  execute: async (client) => {
    console.log('I am live');

    client.user.setActivity('SA:MP');

    client.guilds.cache.forEach((guild) => {
      client.application.commands.set(commands, guild.id).catch((err) => console.log(err));
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
        interval.next = Date.now() + interval.time;
        let chartData = await maxPlayers.get(`${server.ip}:${server.port}`);
        if (!chartData) return;
        const info = await getPlayerCount(server);
        if(info.playerCount > chartData.maxPlayersToday) chartData.maxPlayersToday = info.playerCount;
        chartData.name = info.name;
        chartData.maxPlayers = info.maxPlayers;
        await maxPlayers.set(`${server.ip}:${server.port}`, chartData);
        const channel = await client.channels
          .fetch(interval.channel)
          .catch((err) => console.log(err));
        if (!channel) return;
        const color = getRoleColor(guild);
        const serverEmbed = await getStatus(server, color);
        channel.messages
          .fetch(interval.message)
          .then((oldMsg) => oldMsg.delete())
          .catch((err) => console.log(err));
        channel
          .send({ embeds: [serverEmbed] })
          .then((msg) => interval.message = msg.id)
          .catch((err) => console.log(err));
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
          data.maxPlayersToday = -1;
          if (!data.days) data.days = [];
          if (ChartData.value >= 0) data.days.push(ChartData);
          if (data.days.length > 30) data.days.shift();
          await maxPlayers.set(`${server.ip}:${server.port}`, data);
          const channel = await client.channels
            .fetch(interval.channel)
            .catch((err) => console.log(err));
          if (!channel) return;
          const color = getRoleColor(guild);
          const chart = await getChart(data, color);
          channel.messages
            .fetch(data.msg)
            .then((oldMsg) => oldMsg.delete())
            .catch((err) => console.log(err));
          channel
            .send({ files: [chart] })
            .then((msg) => data.msg = msg.id)
            .catch((err) => console.log(err));
        });
      }
    }, 60000);
  }
}