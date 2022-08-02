const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const { getStatus } = require('../utils/getStatus');
const { getRoleColor } = require('../utils/getRoleColor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription(`Tells you live information about your favourite SA-MP community!`),
  async execute(interaction) {
    const { server } = interaction.client.guildConfigs.get(interaction.guildId);
    if (!server) {
      return interaction.reply({ content: `This server doesn't have a SA:MP Server linked to it. Use /setguildserver to do so.`, ephemeral: true });
    }

    const color = getRoleColor(interaction.guild);
    const serverEmbed = await getStatus(server, color);
    await interaction.reply({ embeds: [serverEmbed] });
  }
}