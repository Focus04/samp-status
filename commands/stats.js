import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoleColor } from '../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription(`Tells you how many players are online across all servers.`),
  async execute(interaction) {
    let color = getRoleColor(interaction.guild);
    const serversResponse = await fetch('http://sam.markski.ar/api/GetAmountServers');
    const servers = await serversResponse.json();
    const playersResponse = await fetch('http://sam.markski.ar/api/GetTotalPlayers');
    const players = await playersResponse.json();
    const infoEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .setTitle('SAMP Live Stats')
      .addFields(
        { name: 'Online Servers Count', value: servers.toString() },
        { name: 'Players Across All Servers', value: players.toString() }
      )
      .setTimestamp();
    interaction.reply({ embeds: [infoEmbed] });
  }
}