import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import Keyv from 'keyv';

const intervals = new Keyv(process.env.database, { collection: 'intervals' });
const servers = new Keyv(process.env.database, { collection: 'samp-servers' });
const maxPlayers = new Keyv(process.env.database, { collection: 'max-members' });

export default {
  data: new SlashCommandBuilder()
    .setName('setinterval')
    .setDescription('Sets a channel for status messages to be sent in')
    .addChannelOption((option) => option
      .setName('channel-name')
      .setDescription('Tag the channel you want status updates to be sent in')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel('channel-name');
    const server = await servers.get(interaction.guildId);

    if (!server) {
      return interaction.editReply({
        content: 'This server doesn\'t have a game server linked yet. Use /setguildserver to set one up.',
      });
    }

    const interval = {
      channel: channel.id,
      next: Date.now(),
      message: null,
      enabled: true,
    };

    await intervals.set(interaction.guildId, interval);

    const config = interaction.client.guildConfigs.get(interaction.guildId) || {};
    config.interval = interval;
    interaction.client.guildConfigs.set(interaction.guildId, config);

    const serverData = await maxPlayers.get(`${server.ip}:${server.port}`) || {
      maxPlayersToday: -1,
      name: 'the server',
      maxPlayers: 50,
      days: [],
    };
    await maxPlayers.set(`${server.ip}:${server.port}`, serverData);

    await interaction.editReply({
      content: `Successfully set status updates in ${channel.toString()}`,
    });
  },
};