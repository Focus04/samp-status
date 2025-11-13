import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getUptime } from '../../utils/getUptime.js';
import Keyv from 'keyv';

const intervals = new Keyv(process.env.database, { collection: 'intervals' });

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Shows the server uptime percentage'),
  async execute(interaction) {
    await interaction.deferReply();
    const interval = await intervals.get(interaction.guildId);

    if (!interval) {
      return interaction.editReply({
        content: 'You must set an interval first using /setinterval', flags: MessageFlags.Ephemeral
      });
    }

    const { server } = interaction.client.guildConfigs.get(interaction.guildId);
    const uptime = await getUptime(server);

    const uptimeEmbed = new EmbedBuilder()
      .setColor(uptime.color)
      .setTitle(`${server.ip}:${server.port} - Uptime`)
      .setDescription(`${uptime.emoji} ${uptime.text}`)
      .setTimestamp();

    await interaction.editReply({ embeds: [uptimeEmbed] });
  },
};