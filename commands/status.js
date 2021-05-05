const { table, getBorderCharacters } = require('table');
const { MessageEmbed } = require('discord.js');
const gamedig = require('gamedig');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);
const { deletionTimeout, reactionError, reactionSuccess } = require('../config.json');
const { getStatus } = require('../utils/getStatus');
const { getRoleColor } = require('../utils/getRoleColor');

module.exports = {
  name: 'status',
  description: `Tells you live information about your favourite SA-MP community!`,
  usage: 'status',
  guildOnly: true,
  async execute(message, prefix) {
    let loading = await message.channel.send('Fetching server info...');
    const { server } = message.client.guildConfigs.get(message.guild.id);
    if (!server) {
      let msg = await loading.edit(`This guild doesn't have a SA:MP Server linked to it. Use ${prefix}setguildserver to do so.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }
    
    const color = getRoleColor(message.guild);
    const status = await getStatus(server, color, MessageEmbed, getBorderCharacters, gamedig, table);
    await loading.delete();
    await message.channel.send(status);
    message.react(reactionSuccess);
  }
}