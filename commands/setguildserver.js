const gamedig = require('gamedig');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setguildserver')
    .setDescription(`Sets a per guild SA:MP server to receive updates on.`)
    .addStringOption((option) => option
      .setName('ip')
      .setDescription('The IP of a SA:MP server.')
      .setRequired(true)
    )
    .addStringOption((option) => option
      .setName('port')
      .setDescription('The port of a SA:MP server.')
      .setRequired(true)
    ),
  requiredPerms: 'MANAGE_GUILD',
  async execute(interaction) {
    const args = interaction.options.data.map((option) => option.value);
    let err = 0;
    await gamedig.query({
      type: 'samp',
      host: args[0],
      port: args[1]
    }).catch(async () => {
      await interaction.reply({ content: `Couldn't find ${args[0]}:${args[1]}`, ephemeral: true });
      err = 1;
    });
    if (err === 1) return;
    let Server = {};
    Server.ip = args[0];
    Server.port = args[1];
    await servers.set(interaction.guildId, Server);
    const config = interaction.client.guildConfigs.get(interaction.guildId);
    config.server = Server;
    interaction.client.guildConfigs.set(interaction.guildId, config);
    await interaction.reply({ content: `You can now use /status to view information about ${args[0]}:${args[1]}`, ephemeral: true });
  }
}