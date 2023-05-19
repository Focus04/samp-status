import { EmbedBuilder } from 'discord.js';
import { getBorderCharacters, table } from 'table';
import gamedig from 'gamedig';

export async function getStatus(server, color) {
  const data = {};
  try {
    data = await gamedig.query({
      type: 'samp',
      host: server.ip,
      port: server.port,
      maxAttempts: 5
    });
  } catch {
    console.log(data.raw.gamemode)
    const errEmbed = new EmbedBuilder()
      .setColor('ff0000')
      .setTitle('Error')
      .setDescription(`${server.ip}:${server.port} did not respond after 5 attempts.`)
      .setTimestamp();
    return errEmbed;
  }

  const config = {
    border: getBorderCharacters(`void`),
    columnDefault: {
      paddingLeft: 0,
      paddingRight: 1
    },
    drawHorizontalLine: () => {
      return false;
    }
  };

  let players = [['ID', 'Name', 'Score', 'Ping']];
  data.players.forEach((player) => {
    players.push([player.raw.id, player.name, player.raw.score, player.raw.ping]);
  });

  let output;
  if (players.length === 0)
    output = 'None';
  else
    output = table(players, config);

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
  let err = 0;
  const data = await gamedig.query({
    type: 'samp',
    host: server.ip,
    port: server.port,
    maxAttempts: 10
  }).catch(() => err = 0);
  if (err === 1 || !data)
    return -1;
  else
    return data.players.length;
}