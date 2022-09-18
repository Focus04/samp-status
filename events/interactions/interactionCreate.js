export default {
  name: 'interactionCreate',
  execute: async (interaction) => {
    if (!interaction.isCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    if (command.requiredPerms && !interaction.member.permissions.has(command.requiredPerms)) {
      return interaction.reply({ content: `You need the following permission to run this: ${'`' + command.requiredPerms + '`'}`, ephemeral: true });
    }

    await command.execute(interaction);
  }
}