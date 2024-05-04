import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import gamedig from 'gamedig';
import Keyv from 'keyv';
const servers = new Keyv(process.env.database, { collection: 'samp-servers' });

export default {
  data: new SlashCommandBuilder()
    .setName('setguildserver')
    .setDescription(`Sets a per guild game server to receive updates on.`)
    .addStringOption((option) => option
      .setName('ip')
      .setDescription('The IP of a game server.')
      .setRequired(true)
    )
    .addStringOption((option) => option
      .setName('port')
      .setDescription('The port of a game server.')
      .setRequired(true)
    )
    .addStringOption((option) => option
      .setName('game')
      .setDescription('Choose the appropriate game title for your server.')
      .addChoices(
        { name: 'San Andreas Multiplayer', value: 'gtasam' }
      )
      .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  execute: async (interaction) => {
    await interaction.deferReply();
    const args = interaction.options.data.map((option) => option.value);
    try {
      await gamedig.query({
        type: 'samp',
        host: args[0],
        port: args[1],
        maxAttempts: 5
      });
    } catch {
      return await interaction.editReply({ content: `Couldn't find ${args[0]}:${args[1]}`, ephemeral: true });
    }
    let server = {
      ip: args[0],
      port: args[1],
      game: args[2]
    };
    await servers.set(interaction.guildId, server);
    const config = interaction.client.guildConfigs.get(interaction.guildId);
    config.server = server;
    interaction.client.guildConfigs.set(interaction.guildId, config);
    await interaction.editReply({ content: `You can now use /status to view information about ${args[0]}:${args[1]}`, ephemeral: true });
  }
}