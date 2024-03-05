import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import Keyv from 'keyv';
const intervals = new Keyv(process.env.database, { collection: 'intervals' });

export default {
  data: new SlashCommandBuilder()
    .setName('toggleinterval')
    .setDescription('Toggles server status logs on/off.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  execute: async (interaction) => {
    let interval = await intervals.get(interaction.guildId);
    if (!interval) {
      return interaction.reply({ content: `There is no interval on this server.`, ephemeral: true });
    }

    interval.enabled = !interval.enabled;
    const config = interaction.client.guildConfigs.get(interaction.guildId);
    config.interval.enabled = interval.enabled;
    interaction.client.guildConfigs.set(interaction.guildId, config);
    await intervals.set(interaction.guildId, interval);
    if (!interval.enabled) interaction.reply({ content: `❌ Interval disabled.`, ephemeral: true });
    else interaction.reply({ content: `✅ Interval enabled.`, ephemeral: true });
  }
}