import { SlashCommandBuilder } from 'discord.js';
import { getStatus } from '../../utils/getStatus.js';
import { getRoleColor } from '../../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Shows live information about your favorite community'),
  async execute(interaction) {
    await interaction.deferReply();
    const { server } = interaction.client.guildConfigs.get(interaction.guildId) || {};

    if (!server) {
      return interaction.editReply({
        content: 'This server isn\'t linked to any game server. Use /setguildserver to set one up.', ephemeral: true
      });
    }

    const color = getRoleColor(interaction.guild);
    const serverEmbed = await getStatus(server, color);
    await interaction.editReply({ embeds: [serverEmbed] });
  },
};