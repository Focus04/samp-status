export default {
  name: 'interactionCreate',
  execute: async (interaction) => {
    if (!interaction.isCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    await command.execute(interaction);
  }
}