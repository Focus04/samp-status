const { SlashCommandBuilder } = require('@discordjs/builders');
const Keyv = require('keyv');
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);
const maxPlayers = new Keyv(process.env.maxPlayers);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setinterval')
    .setDescription(`Sets a channel for status messages to be sent in.`)
    .addChannelOption((option) => option
      .setName('channel-name')
      .setDescription('Tag the channel you want status updates to be sent in.')
      .setRequired(true)
    )
    .addIntegerOption((option) => option
      .setName('minutes')
      .setDescription('The interval updates will be sent at (at least 3).')
      .setRequired(true)
    ),
  requiredPerms: 'MANAGE_GUILD',
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel-name');
    if (channel.type !== 'GUILD_TEXT') {
      await interaction.reply({ content: `Invalid channel.`, ephemeral: true });
      return;
    }
    const minutes = interaction.options.getInteger('minutes');
    if (minutes < 3) {
      return interaction.reply({ content: `Minutes can't be lower than 3.`, ephemeral: true });
    }

    const server = await servers.get(interaction.guildId);
    if (!server) {
      return interaction.reply({ content: `This server doesn't have a server linked to it yet. Type /setguildserver to setup one.`, ephemeral: true });
    }

    let Interval = {};
    Interval.channel = channel.id;
    Interval.time = minutes * 60000;
    Interval.next = Date.now();
    Interval.message = 0;
    await intervals.set(interaction.guildId, Interval);
    const config = interaction.client.guildConfigs.get(interaction.guildId);
    config.interval = Interval;
    interaction.client.guildConfigs.set(interaction.guildId, config);
    const serverData = await maxPlayers.get(`${server.ip}:${server.port}`);
    if (!serverData) {
      const data = {};
      data.maxPlayersToday = -1;
      data.days = [];
      await maxPlayers.set(`${server.ip}:${server.port}`, data);
    }
    await interaction.reply({ content: `Successfully set an interval.`, ephemeral: true });
  }
}