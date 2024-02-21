import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoleColor } from '../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription(`Tells you how many players are online across all servers.`),
  async execute(interaction) {
    let color = getRoleColor(interaction.guild);
    const serversResponse = await fetch('http://sam.markski.ar/api/GetGlobalStats');
    const servers = await serversResponse.json();
    const infoEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .setTitle('SAMP Live Stats')
      .addFields(
        {
          name: 'Online (Populated) Servers Count',
          value: `${servers.serversOnline.toString()} (${servers.serversInhabited.toString()})`
        },
        { name: 'Players Across All Servers', value: servers.playersOnline.toString() }
      )
      .setTimestamp();
    interaction.reply({ embeds: [infoEmbed] });
  }
}