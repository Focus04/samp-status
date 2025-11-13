import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { GameDig } from 'gamedig';
import Keyv from 'keyv';
import { updatePartnerServers } from '../../utils/getPartnerServers.js'

const servers = new Keyv(process.env.database, { collection: 'samp-servers' });

export default {
  data: new SlashCommandBuilder()
    .setName('setguildserver')
    .setDescription('Sets a per guild game server to receive updates on')
    .addStringOption((option) => option
      .setName('ip')
      .setDescription('The IP of a game server')
      .setRequired(true)
    )
    .addStringOption((option) => option
      .setName('port')
      .setDescription('The port of a game server')
      .setRequired(true)
    )
    .addStringOption((option) => option
      .setName('game')
      .setDescription('Choose the appropriate game title for your server')
      .addChoices(
        { name: 'San Andreas Multiplayer', value: 'gtasam' },
      )
      .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const ip = interaction.options.getString('ip');
    const port = interaction.options.getString('port');
    const game = interaction.options.getString('game');

    try {
      GameDig.query({
        type: game,
        host: ip,
        port: parseInt(port, 10),
        maxAttempts: 5,
      });
    } catch {
      return interaction.editReply({
        content: `Couldn't connect to server at ${ip}:${port}`,
      });
    }

    const server = { ip, port, game, name: 'SAMP Server' };
    await servers.set(interaction.guildId, server);

    const config = interaction.client.guildConfigs.get(interaction.guildId) || {};
    config.server = server;
    interaction.client.guildConfigs.set(interaction.guildId, config);

    await updatePartnerServers(interaction.guildId, server);

    await interaction.editReply({
      content: `You can now use /status to view information about ${ip}:${port}`,
    });
  },
};