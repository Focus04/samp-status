import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import Keyv from 'keyv';
import { isServerPartner } from '../../utils/getPartnerServers.js';
import config from '../../config.json';

const servers = new Keyv(process.env.database, { collection: 'samp-servers' });

export default {
  data: new SlashCommandBuilder()
    .setName('setbanner')
    .setDescription('Sets a banner for all status messages')
    .addStringOption((option) => option
      .setName('url')
      .setDescription('The URL of the banner (e.g https://i.imgur.com/AfFp7pu.png)')
      .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const url = interaction.client.guildConfigs.get(interaction.guildId);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch((err) => {
      console.log('WARNING: Interaction expired before deferring.');
      return;
    });

    const server = await servers.get(interaction.guildId);

    if (!server) {
      return interaction.editReply({
        content: 'This server doesn\'t have a game server linked yet. Use /setguildserver to set one up.',
      });
    }

    const { storeLink } = config;
    const links = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('✅ Become a partner now')
        .setURL(storeLink)
        .setStyle(ButtonStyle.Link),
    );
    if (!isServerPartner(interaction.guildId)) {
      return interaction.editReply({
        content: 'This server isn\'t partnered yet. Become a partner ',
        components: [links]
      });
    }

    server.banner = url;
    let guildConfig = interaction.client.guildConfigs.get(interaction.guildId);
    guildConfig.server.banner = url;
    interaction.client.guildConfigs.set(interaction.guildId, guildConfig);
    await servers.set(interaction.guildId, server);

    await interaction.editReply({
      content: `Successfully set banner url to ${url}`
    });
  }
}