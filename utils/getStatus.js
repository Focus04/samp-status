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
      maxAttempts: 5
    }).catch(() => err = 0);

    if (err === 1 || !data) {
      const errEmbed = new MessageEmbed()
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
        return false
      }
    }

    let players = [['ID', 'Name', 'Score', 'Ping']];
    data.players.forEach((player) => {
      players.push([player.id, player.name, player.score, player.ping]);
    });

    let output;
    if (players.length === 0) output = 'None';
    else output = table(players, config);

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
        { name: 'Players', value: `${data.players.length}/${data.maxplayers}`, inline: true }
      )
      .setTimestamp();
    if (output.length < 1024) serverEmbed.addField('Players List', '```' + output + '```');
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