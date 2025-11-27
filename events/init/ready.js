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

const BATCH_SIZE = 200;
const BATCH_DELAY_MS = 500;

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  name: 'ready',
  execute: async (client) => {
    console.log('I am live on Railway!');
    let index = 0;

    const guildList = Array.from(client.guilds.cache.values());
    const batches = chunkArray(guildList, BATCH_SIZE);

    client.guilds.cache.forEach((guild) => {
      client.application.commands
        .set(commands, guild.id)
        .catch((err) => console.log(`WARNING: Could not create commands on guild ${guild.id}!`));
    });
    console.log('Commands registered!');

    client.guildConfigs = new Collection();
    for (const batch of batches) {
      await Promise.all(batch.map(async (guild) => {
        const [server, interval] = await Promise.all([
          servers.get(guild.id),
          intervals.get(guild.id)
        ]);
        client.guildConfigs.set(guild.id, { server, interval });
      }));
      await sleep(200);
    }
    console.log('Cached guild configs!');

    const subscription = await subscriptions.get('subscribedServers');
    client.guildConfigs.set('subscribedServers', subscription);
    console.log('Cached partner servers!');

    const runUpdateLoop = async () => {
      const partnerServers = client.guildConfigs.get('subscribedServers');
      if (!partnerServers?.length) {
        client.user.setActivity('SAMP');
      } else {
        client.user.setActivity(partnerServers[(index++) % partnerServers.length].name);
      }

      const currentGuilds = Array.from(client.guilds.cache.values());
      const currentBatches = chunkArray(currentGuilds, BATCH_SIZE);

      for (const batch of currentBatches) {
        await Promise.all(batch.map(async (guild) => {
          const guildConfigs = client.guildConfigs.get(guild.id);
          if (!guildConfigs) return;

          let { interval = {}, server = {} } = guildConfigs;
          if (!interval?.enabled || Date.now() < interval.next) return;

          interval.next = Date.now() + 180000;

          let onlineStats = await uptimes.get(`${server.ip}:${server.port}`) || { uptime: 0, downtime: 0 };
          const chartData = await maxPlayers.get(`${server.ip}:${server.port}`);

          if (!chartData) return;

          const info = await getPlayerCount(server);
          if (info.playerCount > chartData.maxPlayersToday) chartData.maxPlayersToday = info.playerCount;
          chartData.name = info.name;
          chartData.maxPlayers = info.maxPlayers;
          server.name = info.name;

          await maxPlayers.set(`${server.ip}:${server.port}`, chartData);

          const channel = await client.channels.fetch(interval.channel).catch(() => null);
          if (!channel) return;

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
                console.log(`WARNING: Could not delete message in ${interval.channel} in guild ${guild.id}`);
              }
            }
            interval.message = newMsg.id;
          } catch (err) {
            console.log(`WARNING: Could not send status update in channel ${interval.channel} in guild ${guild.id}`);
            return;
          }

          client.guildConfigs.set(guild.id, { server, interval });
          await intervals.set(guild.id, interval);
        }));

        await sleep(BATCH_DELAY_MS);
      }

      setTimeout(runUpdateLoop, 60000);
    };

    runUpdateLoop();

    const runDailyStatsLoop = async () => {
      const nextCheck = await maxPlayers.get('next') || Date.now();

      if (Date.now() < nextCheck) {
        setTimeout(runDailyStatsLoop, 3600000);
        return;
      }

      await maxPlayers.set('next', Date.now() + 86400000);

      const currentGuilds = Array.from(client.guilds.cache.values());
      const currentBatches = chunkArray(currentGuilds, BATCH_SIZE);

      for (const batch of currentBatches) {
        await Promise.all(batch.map(async (guild) => {
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

          const channel = await client.channels.fetch(interval.channel).catch(() => null);
          if (!channel) return;

          const color = getRoleColor(guild);
          const chart = await getChart(data, color);

          try {
            const msg = await channel.send({ files: [chart] });
            data.msg = msg.id;
            await maxPlayers.set(`${server.ip}:${server.port}`, data);
          } catch (err) {
            console.log(`WARNING: Could not send daily chart in channel ${interval.channel} in guild ${guild.id}!`);
          }
        }));

        await sleep(BATCH_DELAY_MS);
      }

      setTimeout(async () => {
        for (const batch of currentBatches) {
          await Promise.all(batch.map(async (guild) => {
            const guildConfig = client.guildConfigs.get(guild.id) || {};
            const { interval = {}, server = {} } = guildConfig;
            if (!interval) return;

            const data = await maxPlayers.get(`${server.ip}:${server.port}`) || {};
            data.maxPlayersToday = -1;
            await maxPlayers.set(`${server.ip}:${server.port}`, data);
          }));
          await sleep(200);
        }
      }, 120000);

      setTimeout(runDailyStatsLoop, 3600000);
    };

    runDailyStatsLoop();
  },
};