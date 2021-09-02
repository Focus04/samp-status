const { SlashCommandBuilder } = require('@discordjs/builders');
const { getChart } = require('../utils/getChart');
const { getRoleColor } = require('../utils/getRoleColor')
const Keyv = require('keyv');
const intervals = new Keyv(process.env.intervals);
const maxPlayers = new Keyv(process.env.maxPlayers);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverchart')
    .setDescription('Sends a chart displaying server statistics for each day.'),
  async execute(interaction) {
    const interval = await intervals.get(interaction.guildId);
    if (!interval) return interaction.reply({ content: `You must set an interval to view statistics. Set one using /setinterval`, ephemeral: true });
    const { server } = interaction.client.guildConfigs.get(interaction.guildId);
    const data = await maxPlayers.get(`${server.ip}:${server.port}`);
    const color = getRoleColor(interaction.guild);
    const chart = await getChart(data, color);
    await interaction.reply({ files: [chart] });
  }
}
