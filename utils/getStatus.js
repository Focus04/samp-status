import { EmbedBuilder } from 'discord.js';
import { getBorderCharacters, table } from 'table';
import gamedig from 'gamedig';
import Keyv from 'keyv';
const uptimes = new Keyv(process.env.uptime);

let cQuery = async (server) => {
  const response = await fetch(`https://dg-clan.com/api/players/?ip=${server.ip}:${server.port}`);
  const data = await response.json().catch((err) => console.log(`Error: Failed c query at ${server.ip}:${server.port} (1 attempt)!`));
  let players = [['Name', 'Score']];
  if (data && data[0]) {
    data.forEach((player) => {
      players.push([player.nickname, player.score]);
    });
  }
  return players;
}

let dQuery = async (server) => {
  const data = await gamedig.query({
    type: 'samp',
    host: server.ip,
    port: server.port,
    maxAttempts: 5
  }).catch((err) => console.log(`Error: Failed d query at ${server.ip}:${server.port} (5 attempts)!`));
  let players = [['ID', 'Name', 'Score', 'Ping']];
  if (data && data.players && data.players[0]) {
    data.players.forEach((player) => {
      players.push([player.raw.id, player.name, player.raw.score, player.raw.ping]);
    });
  }
  return { data, players };
}

const tableConfig = {
  border: getBorderCharacters(`void`),
  columnDefault: {
    paddingLeft: 0,
    paddingRight: 1
  },
  drawHorizontalLine: () => {
    return false;
  }
};

export async function getStatus(server, color) {
  let onlineStats = await uptimes.get(`${server.ip}:${server.port}`);
  if (!onlineStats) {
    onlineStats = {
      uptime: 0,
      downtime: 0
    }
  }
  let { data, players } = await dQuery(server);
  if (!data) {
    onlineStats.downtime++;
    await uptimes.set(`${server.ip}:${server.port}`, onlineStats);
    const errEmbed = new EmbedBuilder()
      .setColor('ff0000')
      .setTitle('Error')
      .setDescription(`${server.ip}:${server.port} did not respond after 5 attempts.`)
      .setTimestamp();
    return errEmbed;
  }

  if (data.players[0] && !data.players[0].name) players = await cQuery(server);
  let output = table(players, tableConfig);
  onlineStats.uptime++;
  await uptimes.set(`${server.ip}:${server.port}`, onlineStats);
  const percent = onlineStats.uptime / (onlineStats.uptime + onlineStats.downtime) * 100;
  let serverEmbed = new EmbedBuilder()
    .setColor(color.hex)
    .setTitle(`${data.name}`)
    .setDescription(data.raw.gamemode)
    .addFields(
      { name: 'Server IP', value: `${server.ip}:${server.port}`, inline: true },
      { name: 'Map', value: `${data.raw.rules.mapname}`, inline: true },
      { name: 'Uptime', value: `${percent.toFixed(2)}%`, inline: true },
      { name: 'Forums', value: 'http://' + data.raw.rules.weburl, inline: true },
      { name: 'Version', value: `${data.raw.rules.version}`, inline: true },
      { name: 'Players', value: `${data.players.length}/${data.maxplayers}`, inline: true }
    )
    .setTimestamp();

  if (output.length < 1024 && players[1] && players[1].length) {
    if (players[1][1])
      serverEmbed.addFields({ name: 'Players List', value: '```' + output + '```' });
  }
  return serverEmbed;
}

export async function getPlayerCount(server) {
  const data = await gamedig.query({
    type: 'samp',
    host: server.ip,
    port: server.port,
    maxAttempts: 5
  }).catch((err) => console.log(`Error: Failed d query at ${server.ip}:${server.port} (5 attempts)`));
  let info;
  if (!data) {
    info = {
      playerCount: -1,
      name: 'the server',
      maxPlayers: 50
    }
  }
  else {
    info = {
      playerCount: data.players.length,
      name: data.name,
      maxPlayers: data.maxplayers
    }
  }
  return info;
}