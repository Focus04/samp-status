import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoleColor } from '../../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Shows player count across all SA-MP servers'),
  async execute(interaction) {
    const color = getRoleColor(interaction.guild);
    const response = await fetch('http://sam.markski.ar/api/GetGlobalStats');
    const { serversOnline, serversInhabited, playersOnline } = await response.json();

    const statsEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .setTitle('🟢 SA-MP Global Stats')
      .addFields(
        { name: 'Online Servers', value: `${serversOnline} (${serversInhabited} populated)` },
        { name: 'Total Players Online', value: playersOnline.toString() }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [statsEmbed] });
  },
};