const Discord = require('discord.js');
const fetch = require('node-fetch');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);
const { deletionTimeout, reactionError, reactionSuccess } = require('../config.json');

module.exports = {
  name: 'status',
  description: `Tells you live information about your favourite SA-MP community!`,
  usage: 'status',
  guildOnly: true,
  async execute(message, args, prefix) {
    const server = await servers.get(message.guild.id);
    if (!server) {
      let msg = await message.channel.send(`This guild doesn't have a SA:MP Server linked to it. Use ${prefix}setguildserver to do so.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }
    
    const response = await fetch(`https://monitor.teamshrimp.com/api/fetch/all/${server.ip}/${server.port}/`);
    const data = await response.json();
    if (!data.online) {
      let msg = await message.channel.send(`${server.ip}:${server.port} is currenty down.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    let players = '```';
    data.players.map(player => {
      players = players + `${player.name}(${player.id}) - ${player.score} - ${player.ping}` + `\n`;
    });
    if (players === '```') players = '```None```';
    else players = players + '```';
    let serverEmbed = new Discord.MessageEmbed()
      .setColor('#00ffbb')
      .setTitle(`${data.servername}`)
      .addFields(
        { name: 'Server IP', value: `${data.ip}:${data.port}`, inline: true },
        { name: 'Map', value: `${data.mapname}`, inline: true },
        { name: 'Time', value: `${data.worldtime}`, inline: true },
        { name: 'Forums', value: 'http://' + data.weburl, inline: true },
        { name: 'Version', value: `${data.version}`, inline: true },
        { name: 'Players', value: `${data.num_players}/${data.max_players}`, inline: true },
        { name: 'Name(ID) - Score - Ping', value: `${players}` }
      )
      .setTimestamp();
    await message.channel.send(serverEmbed);
    message.react(reactionSuccess);
  }
}