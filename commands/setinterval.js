import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import Keyv from 'keyv';
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);
const maxPlayers = new Keyv(process.env.maxPlayers);

export default {
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
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  execute: async (interaction) => {
    await interaction.deferReply();
    const channel = interaction.options.getChannel('channel-name');
    if (channel.type !== ChannelType.GuildText) {
      return interaction.editReply({ content: `Invalid channel.`, ephemeral: true });
    }
    
    const minutes = interaction.options.getInteger('minutes');
    if (minutes < 3) {
      return interaction.editReply({ content: `Minutes can't be lower than 3.`, ephemeral: true });
    }

    const server = await servers.get(interaction.guildId);
    if (!server) {
      return interaction.editReply({ content: `This server doesn't have a server linked to it yet. Type /setguildserver to setup one.`, ephemeral: true });
    }

    let interval = {
      channel: channel.id,
      time: minutes * 60000,
      next: Date.now(),
      message: 0
    };
    await intervals.set(interaction.guildId, interval);
    const config = interaction.client.guildConfigs.get(interaction.guildId);
    config.interval = interval;
    interaction.client.guildConfigs.set(interaction.guildId, config);
    const serverData = await maxPlayers.get(`${server.ip}:${server.port}`);
    if (!serverData) {
      const data = {
        maxPlayersToday: -1,
        days: []
      };
      await maxPlayers.set(`${server.ip}:${server.port}`, data);
    }
    await interaction.editReply({ content: `Successfully set an interval.`, ephemeral: true });
  }
}