const { table, getBorderCharacters } = require('table');
const { MessageEmbed } = require('discord.js');
const gamedig = require('gamedig');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);
const { deletionTimeout, reactionError, reactionSuccess } = require('../config.json');

module.exports = {
  name: 'status',
  description: `Tells you live information about your favourite SA-MP community!`,
  usage: 'status',
  guildOnly: true,
  async execute(message, args, prefix) {
    let loading = await message.channel.send('Fetching server info...');
    const server = await servers.get(message.guild.id);
    if (!server) {
      let msg = await loading.edit(`This guild doesn't have a SA:MP Server linked to it. Use ${prefix}setguildserver to do so.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }
    
    let err = 0;
    const data = await gamedig.query({
      type: 'samp',
      host: server.ip,
      port: server.port,
      maxAttempts: 10
    }).catch(async (error) => err = 0);
    if (err === 1 || !data) {
      let msg = await loading.edit(`${server.ip}:${server.port} did not respond after 10 attempts.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
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
    let players = [];
    data.players.forEach(player => {
      let p = [];
      p[0] = player.id;
      p[1] = player.name;
      p[2] = player.score;
      p[3] = player.ping;
      players.push(p);
    });
    let output;
    if (!players.length) output = 'None';
    else output = table(players, config);
    let color;
    if (message.guild.me.roles.highest.color === 0) color = '#b9bbbe';
    else color = message.guild.me.roles.highest.color;
    let serverEmbed = new MessageEmbed()
      .setColor(color)
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
    if (data.players.length > 0) serverEmbed.addField('ID Name Score Ping', '```' + output + '```');
    await loading.delete();
    await message.channel.send(serverEmbed);
    message.react(reactionSuccess);
  }
}