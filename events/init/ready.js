import { Collection } from 'discord.js';
import { getChart } from '../../utils/getChart.js';
import { getStatus, getPlayerCount } from '../../utils/getStatus.js';
import { getRoleColor } from '../../utils/getRoleColor.js';
import index from '../../index.js';
import Keyv from 'keyv';

const commands = index;
const intervals = new Keyv(process.env.database, { collection: 'intervals' });
const servers = new Keyv(process.env.database, { collection: 'samp-servers' });
const maxPlayers = new Keyv(process.env.database, { collection: 'max-members' });
const uptimes = new Keyv(process.env.database, { collection: 'uptime' });

export default {
  name: 'ready',
  execute: async (client) => {
    console.log('I am live on Railway!');
    client.user.setActivity('SA:MP');

    // Register commands in all guilds
    client.guilds.cache.forEach((guild) => {
      client.application.commands
        .set(commands, guild.id)
        .catch((err) => console.log(`Error: Could not create commands on guild ${guild.id}!`, err));
    });

    // Cache guild configs
    client.guildConfigs = new Collection();
    await Promise.all(client.guilds.cache.map(async (guild) => {
      const [server, interval] = await Promise.all([
        servers.get(guild.id),
        intervals.get(guild.id),
      ]);
      client.guildConfigs.set(guild.id, { server, interval });
    }));

    // Status update interval (1 minute)
    setInterval(async () => {
      await Promise.all(client.guilds.cache.map(async (guild) => {
        const guildConfigs = client.guildConfigs.get(guild.id);
        if (!guildConfigs) return;

        const { interval = {}, server = {} } = guildConfigs;
        if (!interval?.enabled || Date.now() < interval.next) return;

        interval.next = Date.now() + 180000;
        let onlineStats = await uptimes.get(`${server.ip}:${server.port}`) || { uptime: 0, downtime: 0 };

        const chartData = await maxPlayers.get(`${server.ip}:${server.port}`);
        if (!chartData) return;

        const info = await getPlayerCount(server);
        if (info.playerCount > chartData.maxPlayersToday) {
          chartData.maxPlayersToday = info.playerCount;
        }
        chartData.name = info.name;
        chartData.maxPlayers = info.maxPlayers;
        await maxPlayers.set(`${server.ip}:${server.port}`, chartData);

        const channel = await client.channels
          .fetch(interval.channel)
          .catch((err) => console.log(`Error: Could not fetch channel ${interval.channel} in guild ${guild.id}!`, err));
        if (!channel) return;

        const color = getRoleColor(guild);
        const serverEmbed = await getStatus(server, color);

        if (!serverEmbed.data?.fields) {
          onlineStats.downtime += 1;
        } else {
          onlineStats.uptime += 1;
        }

        await uptimes.set(`${server.ip}:${server.port}`, onlineStats);

        try {
          const oldMsg = await channel.messages.fetch(interval.message).catch(() => null);
          if (oldMsg) await oldMsg.delete();

          const newMsg = await channel.send({ embeds: [serverEmbed] });
          interval.message = newMsg.id;
        } catch (err) {
          console.log(`Error updating message in channel ${interval.channel} in guild ${guild.id}!`, err);
        }

        client.guildConfigs.set(guild.id, { server, interval });
        await intervals.set(guild.id, interval);
      }));
    }, 60000);

    // Daily stats interval (1 hour)
    setInterval(async () => {
      const nextCheck = await maxPlayers.get('next') || Date.now();
      if (Date.now() < nextCheck) return;

      await maxPlayers.set('next', Date.now() + 86400000);

      await Promise.all(client.guilds.cache.map(async (guild) => {
        const guildConfig = client.guildConfigs.get(guild.id) || {};
        const { interval = {}, server = {} } = guildConfig;
        if (!interval?.enabled) return;

        const data = await maxPlayers.get(`${server.ip}:${server.port}`);
        if (!data) return;

        const chartData = {
          value: data.maxPlayersToday,
          date: Date.now(),
        };

        if (!data.days) data.days = [];
        if (chartData.value >= 0) data.days.push(chartData);
        if (data.days.length > 30) data.days.shift();

        await maxPlayers.set(`${server.ip}:${server.port}`, data);

        const channel = await client.channels
          .fetch(interval.channel)
          .catch((err) => console.log(`Error: Could not fetch channel ${interval.channel} in guild ${guild.id}!`, err));
        if (!channel) return;

        const color = getRoleColor(guild);
        const chart = await getChart(data, color);

        try {
          const msg = await channel.send({ files: [chart] });
          data.msg = msg.id;
          await maxPlayers.set(`${server.ip}:${server.port}`, data);
        } catch (err) {
          console.log(`Error: Could not send message in channel ${interval.channel} in guild ${guild.id}!`, err);
        }
      }));

      // Reset max players after 2 minutes
      setTimeout(async () => {
        await Promise.all(client.guilds.cache.map(async (guild) => {
          const guildConfig = client.guildConfigs.get(guild.id) || {};
          const { interval = {}, server = {} } = guildConfig;
          if (!interval) return;

          const data = await maxPlayers.get(`${server.ip}:${server.port}`) || {};
          data.maxPlayersToday = -1;
          await maxPlayers.set(`${server.ip}:${server.port}`, data);
        }));
      }, 120000);
    }, 3600000);
  },
};