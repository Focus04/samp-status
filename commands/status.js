import { SlashCommandBuilder } from 'discord.js';
import { getStatus } from '../utils/getStatus.js';
import { getRoleColor } from '../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription(`Tells you live information about your favourite SA-MP community!`),
  execute: async (interaction) => {
    await interaction.deferReply();
    const { server } = interaction.client.guildConfigs.get(interaction.guildId);
    if (!server) {
      return interaction.reply({ content: `This server doesn't have a SA:MP Server linked to it. Use /setguildserver to do so.`, ephemeral: true });
    }

    const color = getRoleColor(interaction.guild);
    const serverEmbed = await getStatus(server, color);
    await interaction.editReply({ embeds: [serverEmbed] });
  }
}