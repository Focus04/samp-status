import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} from 'discord.js';
import Keyv from 'keyv';
import { isServerPartner } from '../../utils/getPartnerServers.js';
import config from '../../config.json' assert { type: 'json' };

const servers = new Keyv(process.env.database, { collection: 'samp-servers' });

export default {
  data: new SlashCommandBuilder()
    .setName('removebanner')
    .setDescription('Removes the banner from status messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const url = interaction.options.getString('url');
    await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch((err) => {
      console.log('WARNING: Interaction expired before deferring.');
      return;
    });

    const server = await servers.get(interaction.guildId);

    const { storeLink } = config;
    const links = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('✅ Become a partner now')
        .setURL(storeLink)
        .setStyle(ButtonStyle.Link),
    );
    if (!isServerPartner(interaction.guildId)) {
      return interaction.editReply({
        content: 'This server isn\'t partnered yet. Become a partner to gain access to this command.',
        components: [links]
      });
    }

    if (!server?.banner) {
      return interaction.editReply({
        content: 'This server doesn\'t have a banner set yet. Use /setbanner to set one up.'
      });
    }

    server.banner = '';
    await servers.set(interaction.guildId, server);

    const guildConfig = interaction.client.guildConfigs.get(interaction.guildId) || {};
    guildConfig.server = server;
    interaction.client.guildConfigs.set(interaction.guildId, guildConfig);

    await interaction.editReply({
      content: `Successfully removed server banner.`
    });
  }
}