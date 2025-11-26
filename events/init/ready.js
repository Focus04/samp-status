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

    // Register Commands
    for (const [guildId, guild] of client.guilds.cache) {
      try {
        await client.application.commands.set(commands, guildId);
      } catch (err) {
        console.log(`WARNING: Could not create commands on guild ${guildId}!`);
      }
    }

    // Cache Guild Configs (Sequential Loading)
    client.guildConfigs = new Collection();
    console.log('Starting to cache guild configs...');

    for (const [guildId, guild] of client.guilds.cache) {
      try {
        const server = await servers.get(guildId);
        const interval = await intervals.get(guildId);
        client.guildConfigs.set(guildId, { server, interval });
      } catch (err) {
        console.error(`Failed to load config for guild ${guildId}:`, err);
      }
    }
    console.log('Cached guild servers and intervals from the database!');

    const subscription = await subscriptions.get('subscribedServers');
    client.guildConfigs.set('subscribedServers', subscription);
    console.log('Cached partner servers from the database!');

    // Status Update Interval (1 minute)
    setInterval(async () => {
      const partnerServers = client.guildConfigs.get('subscribedServers');
      if (!partnerServers?.length) {
        client.user.setActivity('SAMP');
      } else {
        client.user.setActivity(partnerServers[(index++) % partnerServers.length].name);
      }

      // Process guilds sequentially to avoid DB spikes
      for (const [guildId, guild] of client.guilds.cache) {
        const guildConfigs = client.guildConfigs.get(guildId);
        if (!guildConfigs) continue;

        let { interval = {}, server = {} } = guildConfigs;
        if (!interval?.enabled || Date.now() < interval.next) continue;

        interval.next = Date.now() + 180000;

        try {
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
            const oldMsg = await channel.messages.fetch(interval.message).catch(() => null);
            if (oldMsg) await oldMsg.delete();

            const newMsg = await channel.send({ embeds: [serverEmbed] });
            interval.message = newMsg.id;
          } catch (err) {
            console.log(`WARNING: Could not update message in channel ${interval.channel} in guild ${guildId}!`);
          }

          client.guildConfigs.set(guildId, { server, interval });
          await intervals.set(guildId, interval);

        } catch (error) {
          console.error(`Error updating guild ${guildId}:`, error.message);
        }
      }
    }, 60000);

    // Daily Stats Interval (1 hour)
    setInterval(async () => {
      try {
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
      } catch (err) {
        console.error("Error in daily stats interval:", err);
      }

      setTimeout(async () => {
        for (const [guildId, guild] of client.guilds.cache) {
          const guildConfig = client.guildConfigs.get(guildId) || {};
          const { interval = {}, server = {} } = guildConfig;
          if (!interval) continue;

          try {
            const data = await maxPlayers.get(`${server.ip}:${server.port}`) || {};
            data.maxPlayersToday = -1;
            await maxPlayers.set(`${server.ip}:${server.port}`, data);
          } catch (err) {
            console.error(`Error resetting stats for ${guildId}`, err);
          }
        }
      }, 120000);

    }, 3600000);
  },
};