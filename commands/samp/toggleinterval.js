import { SlashCommandBuilder } from 'discord.js';
import Keyv from 'keyv';
const intervals = new Keyv(process.env.database, { collection: 'intervals' });

export default {
  data: new SlashCommandBuilder()
    .setName('toggleinterval')
    .setDescription('Toggles server status logs on/off.'),
  execute: async (interaction) => {
    let interval = await intervals.get(interaction.guildId);
    if (!interval) {
      return interaction.reply({ content: `There is no interval on this server.`, ephemeral: true });
    }

    interval.enabled = !interval.enabled;
    if (!interval.enabled) interaction.reply({ content: `❌ Interval disabled.`, ephemeral: true });
    else interaction.reply({ content: `✅ Interval enabled.`, ephemeral: true });
    await intervals.set(interaction.guildId, interval);
  }
}