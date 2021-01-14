const Discord = require('discord.js');
const table = require('table');
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
    let players = [
      ['Name', 'ID', 'Score', 'Ping']
    ];
    data.players.forEach(player => {
      player[0] = player.id;
      player[1] = player.name;
      player[2] = player.score;
      player[3] = player.ping;
      players.push(player);
    });
    console.log(players);
    let output;
    if (players.length === 1) output = 'None';
    else output = table(players); 
    let serverEmbed = new Discord.MessageEmbed()
      .setColor('#00ffbb')
      .setTitle(`${data.name}`)
      .addFields(
        { name: 'Server IP', value: `${server.ip}:${server.port}`, inline: true },
        { name: 'Map', value: `${data.raw.rules.mapname}`, inline: true },
        { name: 'Time', value: `${data.raw.rules.worldtime}`, inline: true },
        { name: 'Forums', value: 'http://' + data.raw.rules.weburl, inline: true },
        { name: 'Version', value: `${data.raw.rules.version}`, inline: true },
        { name: 'Players', value: `${data.players.length}/${data.maxplayers}`, inline: true },
        { name: 'Name(ID) - Score - Ping', value: '```' + output + '```' }
      )
      .setTimestamp();
    await loading.delete();
    await message.channel.send(serverEmbed);
    message.react(reactionSuccess);
  }
}