import index from '../../index.js';
const commands = index;

export default {
  name: 'guildCreate',
  execute: (guild) => {
    guild.client.application.commands.set(commands, guild.id).catch((err) => console.log(`Error: Could not create commands on guild ${guild.id}!`));
  }
}