import index from '../../index.js';
import { sendWarningLog } from '../../utils/sendError.js';
const commands = index.commands;

export default {
  name: 'guildCreate',
  execute: (guild) => {
    guild.client.application.commands.set(commands, guild.id).catch((err) => sendWarningLog(`Error: Could not create commands on guild ${guild.id}!`));
  }
}