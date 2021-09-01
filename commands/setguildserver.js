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
  usage: 'setguildserver `ip` `port`',
  requiredPerms: 'MANAGE_GUILD',
  permError: 'You require the Manage Server permission in order to run this command.',
  async execute(interaction) {
    let err = 0;
    await gamedig.query({
      type: 'samp',
      host: args[0],
      port: args[1]
    }).catch(async (error) => {
      let msg = await interaction.reply(`Couldn't find ${args[0]}:${args[1]}`);
      err = 1;
    });
    if (err === 1) return;
    let Server = {};
    Server.ip = args[0];
    Server.port = args[1];
    await servers.set(message.guild.id, Server);
    const config = message.client.guildConfigs.get(message.guild.id);
    config.server = Server;
    message.client.guildConfigs.set(message.guild.id, config);
    await interaction.reply(`You can now use ${prefix}status to view information about ${args[0]}:${args[1]}`);
  }
}