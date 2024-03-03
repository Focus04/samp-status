import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import Keyv from 'keyv';
const intervals = new Keyv(process.env.database, { collection: 'intervals' });
const servers = new Keyv(process.env.database, { collection: 'samp-servers' });
const maxPlayers = new Keyv(process.env.database, { collection: 'max-members' });

export default {
  data: new SlashCommandBuilder()
    .setName('setinterval')
    .setDescription(`Sets a channel for status messages to be sent in.`)
    .addChannelOption((option) => option
      .setName('channel-name')
      .setDescription('Tag the channel you want status updates to be sent in.')
      .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  execute: async (interaction) => {
    await interaction.deferReply();
    const channel = interaction.options.getChannel('channel-name');
    if (channel.type !== ChannelType.GuildText) {
      return interaction.editReply({ content: `Invalid channel.`, ephemeral: true });
    }

    const server = await servers.get(interaction.guildId);
    if (!server) {
      return interaction.editReply({ content: `This server doesn't have a server linked to it yet. Type /setguildserver to setup one.`, ephemeral: true });
    }

    let interval = {
      channel: channel.id,
      next: Date.now(),
      message: 0,
      enabled: 1
    };
    await intervals.set(interaction.guildId, interval);
    const config = interaction.client.guildConfigs.get(interaction.guildId);
    config.interval = interval;
    interaction.client.guildConfigs.set(interaction.guildId, config);
    const serverData = await maxPlayers.get(`${server.ip}:${server.port}`);
    if (!serverData) {
      const data = {
        maxPlayersToday: -1,
        name: 'the server',
        maxPlayers: 50,
        days: []
      };
      await maxPlayers.set(`${server.ip}:${server.port}`, data);
    }
    await interaction.editReply({ content: `Successfully set an interval.`, ephemeral: true });
  }
}