import { EmbedBuilder } from 'discord.js';
import { getBorderCharacters, table } from 'table';
import gamedig from 'gamedig';

async function cQuery(server) {
  const response = await fetch(`https://dg-clan.com/api/players/${server.ip}:${server.port}`);
  const data = await response.json();
  let players = [['Name', 'Score']];
  data.forEach((player) => {
    players.push([player.Nickname, player.Score]);
  });
  return { data, players };
}

async function dQuery(server) {
  const data = await gamedig.query({
    type: 'samp',
    host: server.ip,
    port: server.port,
    maxAttempts: 5
  }).catch((err) => console.log(err));
  let players = [['ID', 'Name', 'Score', 'Ping']];
  data.players.forEach((player) => {
    players.push([player.raw.id, player.name, player.raw.score, player.raw.ping]);
  });
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
  let { data, players } = await dQuery(server);
  if (!data) {
    const errEmbed = new EmbedBuilder()
      .setColor('ff0000')
      .setTitle('Error')
      .setDescription(`${server.ip}:${server.port} did not respond after 5 attempts.`)
      .setTimestamp();
    return errEmbed;
  }

  if (!data.players[0]) console.log(`c query required for ${server.ip}`);
  let output;
  if (players.length === 0) output = 'None';
  else output = table(players, tableConfig);

  let serverEmbed = new EmbedBuilder()
    .setColor(color.hex)
    .setTitle(`${data.name}`)
    .setDescription(data.raw.gamemode)
    .addFields(
      { name: 'Server IP', value: `${server.ip}:${server.port}`, inline: true },
      { name: 'Map', value: `${data.raw.rules.mapname}`, inline: true },
      { name: 'Time', value: `${data.raw.rules.worldtime}`, inline: true },
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
    maxAttempts: 10
  }).catch((err) => console.log(err));
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