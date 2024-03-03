import { SlashCommandBuilder } from 'discord.js';
import Keyv from 'keyv';
const intervals = new Keyv(process.env.database, { collection: 'intervals' });

export default {
  data: new SlashCommandBuilder()
    .setName('toggleinterval')
    .setDescription('Toggles server status logs on/off.'),
  execute: async (interaction) => {
    await interaction.deferReply();
    let interval = await intervals.get(interaction.guildId);
    if (!interval) {
      return interaction.editReply({ content: `There is no interval on this server.`, ephemeral: true });
    }

    if (interval.enabled) {
      interval.enabled = 0;
      interaction.editReply({ content: `❌ Interval disabled.`, ephemeral: true });
    } else {
      interval.enabled = 1;
      interaction.editReply({ content: `✅ Interval enabled.`, ephemeral: true });
    }

    await intervals.set(interaction.guildId, interval);
  }
}