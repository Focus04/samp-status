import { SlashCommandBuilder } from 'discord.js';
import { getUptime } from '../utils/getUptime.js';
import Keyv from 'keyv';
const intervals = new Keyv(process.env.intervals);

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription(`Sends the server's uptime percent.`),
  execute: async (interaction) => {
    await interaction.deferReply();
    const interval = await intervals.get(interaction.guildId);
    if (!interval) {
      return interaction.editReply({ content: `You must set an interval to view the uptime. Set one using /setinterval`, ephemeral: true });
    }

    const { server } = interaction.client.guildConfigs.get(interaction.guildId);
    const uptime = await getUptime(server);
    console.log(uptime);
  }
}