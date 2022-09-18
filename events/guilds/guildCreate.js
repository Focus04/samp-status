import index from '../../index.js';
const commands = index;

export default {
  name: 'guildCreate',
  execute: (guild) => {
    guild.client.application.commands.set(commands, guild.id).catch((err) => console.log(err));
  }
}