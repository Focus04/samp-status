import { EmbedBuilder } from 'discord.js';
import { getBorderCharacters, table } from 'table';
import { GameDig } from 'gamedig';
import { getUptime, formatUrl } from './getUptime.js';
import { getPartnerServers } from './getPartnerServers.js';
import index from '../index.js';

const tableConfig = {
  border: getBorderCharacters('void'),
  columnDefault: {
    paddingLeft: 0,
    paddingRight: 1,
  },
  drawHorizontalLine: () => false,
};

const cQuery = async (server) => {
  const data = await GameDig.query({
    type: 'gtasao',
    host: server.ip,
    port: server.port,
    maxAttempts: 3,
  }).catch((err) => console.log(`WARNING: Failed c query at ${server.ip}:${server.port} (3 attempts)!`));

  const players = [['Name', 'Score']];
  if (data?.players?.[0]) {
    data.players.forEach((player) => {
      players.push([player.name, player.raw?.score]);
    });
  }
  return players;
};

const dQuery = async (server) => {
  const data = await GameDig.query({
    type: 'gtasam',
    host: server.ip,
    port: server.port,
    maxAttempts: 3,
  }).catch((err) => console.log(`WARNING: Failed d query at ${server.ip}:${server.port} (3 attempts)!`));

  const players = [['ID', 'Name', 'Score', 'Ping']];
  if (data?.players?.[0]) {
    data.players.forEach((player) => {
      players.push([player.raw?.id, player.name, player.raw?.score, player.raw?.ping]);
    });
  }
  return { data, players };
};

export async function getStatus(server, color) {
  let { data, players } = await dQuery(server);
  if (!data) {
    const errEmbed = new EmbedBuilder()
      .setColor('ff0000')
      .setTitle('Error')
      .setDescription(`${server.ip}:${server.port} did not respond after 3 attempts.`)
      .setTimestamp();
    return errEmbed;
  }

  if (data && !data.players?.length) players = await cQuery(server);
  const uptime = await getUptime(server);
  const websiteUrl = formatUrl(data.raw?.rules?.weburl);
  const output = table(players, tableConfig);
  const partnerServers = index.client.guildConfigs.get('subscribedServers', subscribedServers);
  const serializedPartnerServers = getPartnerServers(partnerServers);

  const serverEmbed = new EmbedBuilder()
    .setColor(color.hex)
    .setTitle(`${data.name}`)
    .setDescription(data.raw?.gamemode)
    .addFields(
      { name: 'Server IP', value: `${server.ip}:${server.port}`, inline: true },
      { name: 'Map', value: `${data.raw?.rules?.mapname}`, inline: true },
      { name: 'Uptime', value: `${uptime.emoji} ${uptime.text}`, inline: true },
      { name: 'Website', value: websiteUrl, inline: true },
      { name: 'Version', value: `${data.raw?.rules?.version}`, inline: true },
      { name: 'Players', value: `${players.length - 1}/${data.maxplayers}`, inline: true },
  )
    .setTimestamp();

  if (output.length < 1000 && players[1]?.length && players[1][1]) {
    serverEmbed.addFields({ name: 'Players List', value: `\`\`\`${output}\`\`\`` });
  }
  serverEmbed.addFields({ name: '✅ Discover Partner Servers', value: serializedPartnerServers });
  return serverEmbed;
}

export async function getPlayerCount(server) {
  const data = await GameDig.query({
    type: 'gtasam',
    host: server.ip,
    port: server.port,
    maxAttempts: 3,
  }).catch((err) => console.log(`WARNING: Failed d query at ${server.ip}:${server.port} (3 attempts)`));

  if (!data) {
    return {
      playerCount: -1,
      name: 'SAMP Server',
      maxPlayers: 50,
    };
  }

  return {
    playerCount: data.players?.length || 0,
    name: data.name,
    maxPlayers: data.maxplayers,
  };
}