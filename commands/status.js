const Discord = require('discord.js');
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
    
    const data = await gamedig.query({
      type: 'samp',
      host: server.ip,
      port: server.port
    }).catch(async (err) => {
      let msg = await loading.edit(`${server.ip}:${server.port} is currenty down.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    });
    let players = '```';
    data.players.map(player => {
      players = players + `${player.name} - ${player.score} - ${player.ping}` + `\n`;
    });
    if (players === '```') players = '```None```';
    else players = players + '```';
    let serverEmbed = new Discord.MessageEmbed()
      .setColor('#00ffbb')
      .setTitle(`${data.name}`)
      .addFields(
        { name: 'Server IP', value: `${server.ip}:${server.port}`, inline: true },
        { name: 'Map', value: `${data.map}`, inline: true },
        { name: 'Players', value: `${data.num_players}/${data.max_players}`, inline: true },
        { name: 'Name - Score - Ping', value: `${players}` }
      )
      .setTimestamp();
    await loading.delete();
    await message.channel.send(serverEmbed);
    message.react(reactionSuccess);
  }
}