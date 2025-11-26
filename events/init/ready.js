import { Collection } from 'discord.js';
import { getChart } from '../../utils/getChart.js';
import { getStatus, getPlayerCount } from '../../utils/getStatus.js';
import { getRoleColor } from '../../utils/getRoleColor.js';
import index from '../../index.js';
import Keyv from 'keyv';

const commands = index.commands;

const intervals = new Keyv(process.env.database, { collection: 'intervals' });
const servers = new Keyv(process.env.database, { collection: 'samp-servers' });
const maxPlayers = new Keyv(process.env.database, { collection: 'max-members' });
const uptimes = new Keyv(process.env.database, { collection: 'uptime' });
const subscriptions = new Keyv(process.env.database, { collection: 'subscriptions' });

export default {
  name: 'ready',
  execute: async (client) => {
    console.log('I am live on Railway!');
    let index = 0;

    // Register commands in all guilds
    client.guilds.cache.forEach((guild) => {
      client.application.commands
        .set(commands, guild.id)
        .catch((err) => console.log(`WARNING: Could not create commands on guild ${guild.id}!`));
    });

    // Cache guild configs
    client.guildConfigs = new Collection();
    await Promise.all(client.guilds.cache.map(async (guild) => {
      const [server, interval] = await Promise.all([
        servers.get(guild.id),
        intervals.get(guild.id)
      ]);
      await client.guildConfigs.set(guild.id, { server, interval });
    }));
    console.log('Cached guild servers and intervals from the database!');

    const subscription = await subscriptions.get('subscribedServers');
    await client.guildConfigs.set('subscribedServers', subscription);
    console.log('Cached partner servers from the database!');

    // Status Update Interval (1 minute)
    setInterval(async () => {
      const partnerServers = client.guildConfigs.get('subscribedServers');
      if (!partnerServers?.length) {
        client.user.setActivity('SAMP');
      } else {
        client.user.setActivity(partnerServers[(index++) % partnerServers.length].name);
      }

      // Sequential Processing
      for (const [guildId, guild] of client.guilds.cache) {
        const guildConfigs = client.guildConfigs.get(guildId);
        if (!guildConfigs) continue;

        let { interval = {}, server = {} } = guildConfigs;
        if (!interval?.enabled || Date.now() < interval.next) continue;

        interval.next = Date.now() + 180000;

        let onlineStats = await uptimes.get(`${server.ip}:${server.port}`) || { uptime: 0, downtime: 0 };
        const chartData = await maxPlayers.get(`${server.ip}:${server.port}`);

        if (!chartData) continue;

        const info = await getPlayerCount(server);
        if (info.playerCount > chartData.maxPlayersToday) chartData.maxPlayersToday = info.playerCount;
        chartData.name = info.name;
        chartData.maxPlayers = info.maxPlayers;
        server.name = info.name;

        await maxPlayers.set(`${server.ip}:${server.port}`, chartData);

        const channel = await client.channels.fetch(interval.channel).catch(() => null);
        if (!channel) continue;

        const color = getRoleColor(guild);
        const serverEmbed = await getStatus(server, color);

        if (!serverEmbed.data?.fields) onlineStats.downtime += 1;
        else onlineStats.uptime += 1;

        await uptimes.set(`${server.ip}:${server.port}`, onlineStats);

        try {
          const newMsg = await channel.send({ embeds: [serverEmbed] });

          if (interval.message) {
            try {
              const oldMsg = await channel.messages.fetch(interval.message).catch(() => null);
              if (oldMsg) await oldMsg.delete();
            } catch (err) {
              console.log(`WARNING: Could not delete message in ${interval.channel} in guild ${guildId}`);
            }
          }
          interval.message = newMsg.id;
        } catch (err) {
          console.log(`WARNING: Could not send status update in channel ${interval.channel} in guild ${guildId}`);
          continue;
        }

        client.guildConfigs.set(guildId, { server, interval });
        await intervals.set(guildId, interval);
      }
    }, 60000);

    // Daily Stats Interval (1 hour)
    setInterval(async () => {
      const nextCheck = await maxPlayers.get('next') || Date.now();
      if (Date.now() < nextCheck) return;

      await maxPlayers.set('next', Date.now() + 86400000);

      for (const [guildId, guild] of client.guilds.cache) {
        const guildConfig = client.guildConfigs.get(guildId) || {};
        const { interval = {}, server = {} } = guildConfig;
        if (!interval?.enabled) continue;

        const data = await maxPlayers.get(`${server.ip}:${server.port}`);
        if (!data) continue;

        const chartData = {
          value: data.maxPlayersToday,
          date: Date.now(),
        };

        if (!data.days) data.days = [];
        if (chartData.value >= 0) data.days.push(chartData);
        if (data.days.length > 30) data.days.shift();

        await maxPlayers.set(`${server.ip}:${server.port}`, data);

        const channel = await client.channels.fetch(interval.channel).catch(() => null);
        if (!channel) continue;

        const color = getRoleColor(guild);
        const chart = await getChart(data, color);

        try {
          const msg = await channel.send({ files: [chart] });
          data.msg = msg.id;
          await maxPlayers.set(`${server.ip}:${server.port}`, data);
        } catch (err) {
          console.log(`WARNING: Could not send daily chart in channel ${interval.channel} in guild ${guildId}!`);
        }
      }

      setTimeout(async () => {
        for (const [guildId, guild] of client.guilds.cache) {
          const guildConfig = client.guildConfigs.get(guildId) || {};
          const { interval = {}, server = {} } = guildConfig;
          if (!interval) continue;

          const data = await maxPlayers.get(`${server.ip}:${server.port}`) || {};
          data.maxPlayersToday = -1;
          await maxPlayers.set(`${server.ip}:${server.port}`, data);
        }
      }, 120000);

    }, 3600000);
  },
};