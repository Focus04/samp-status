const { MessageEmbed } = require('discord.js');
const { getBorderCharacters, table } = require('table');
const gamedig = require('gamedig');

module.exports = {
  getStatus: async (server, color) => {
    let err = 0;
    const data = await gamedig.query({
      type: 'samp',
      host: server.ip,
      port: server.port,
      maxAttempts: 10
    }).catch(() => err = 0);
    if (err === 1 || !data)  return `${server.ip}:${server.port} did not respond after 10 attempts.`;
    const config = {
      border: getBorderCharacters(`void`),
      columnDefault: {
        paddingLeft: 0,
        paddingRight: 1
      },
      drawHorizontalLine: () => {
        return false
      }
    }
    let players = [['ID', 'Name', 'Score', 'Ping']];
    data.players.forEach((player) => {
      players.push([player.id, player.name, player.score, player.ping]);
    });
    data.players.forEach((player) => {
      players.push([player.id, player.name, player.score, player.ping]);
    });
    let output;
    if (players.length === 1) output = 'None';
    else output = table(players, config);
    if (output.length > 1024) {
      players = [['ID', 'Name']];
      data.players.forEach((player) => {
        players.push([player.id, player.name]);
      });
      data.players.forEach((player) => {
        players.push([player.id, player.name]);
      });
      output = table(players, config);
      console.log(output.length);
    }
    let serverEmbed = new MessageEmbed()
      .setColor(color.hex)
      .setTitle(`${data.name}`)
      .setDescription(data.raw.gamemode)
      .addFields(
        { name: 'Server IP', value: `${server.ip}:${server.port}`, inline: true },
        { name: 'Map', value: `${data.raw.rules.mapname}`, inline: true },
        { name: 'Time', value: `${data.raw.rules.worldtime}`, inline: true },
        { name: 'Forums', value: 'http://' + data.raw.rules.weburl, inline: true },
        { name: 'Version', value: `${data.raw.rules.version}`, inline: true },
        { name: 'Players', value: `${data.players.length}/${data.maxplayers}`, inline: true },
        { name: 'Player List', value: '```' + output + '```' }
      )
      .setTimestamp();
    return serverEmbed;
  },

  getPlayerCount: async (server, gamedig) => {
    let err = 0;
    const data = await gamedig.query({
      type: 'samp',
      host: server.ip,
      port: server.port,
      maxAttempts: 10
    }).catch(() => err = 0);
    if (err === 1 || !data) return -1;
    else return data.players.length;
  }
}