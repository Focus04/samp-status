import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import Keyv from 'keyv';

const intervals = new Keyv(process.env.database, { collection: 'intervals' });

export default {
  data: new SlashCommandBuilder()
    .setName('toggleinterval')
    .setDescription('Toggles server status updates on/off')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const interval = await intervals.get(interaction.guildId);
    if (!interval) {
      return interaction.reply({ content: 'No interval configured for this server', flags: MessageFlags.Ephemeral });
    }

    interval.enabled = !interval.enabled;
    const config = interaction.client.guildConfigs.get(interaction.guildId);
    config.interval.enabled = interval.enabled;

    await Promise.all([
      intervals.set(interaction.guildId, interval),
      interaction.client.guildConfigs.set(interaction.guildId, config),
    ]);

    interaction.reply({
      content: interval.enabled ? '✅ Status updates enabled' : '❌ Status updates disabled',
      flags: MessageFlags.Ephemeral,
    });
  },
};