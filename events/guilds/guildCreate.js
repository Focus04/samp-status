import index from '../../index.js';
const commands = index.commands;

export default {
  name: 'guildCreate',
  execute: (guild) => {
    guild.client.application.commands.set(commands, guild.id).catch((err) => console.log(`WARNING: Could not create commands on guild ${guild.id}!`));
  }
}