const { defaultPrefix } = require('../../config.json');

module.exports = async (client, message) => {
  if (message.author.bot || !message.channel.type === 'GUILD_TEXT') return;

  const { prefix = defaultPrefix } = client.guildConfigs.get(message.guild.id);
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = client.commands.get(args.shift().toLowerCase());
  if (!command) return;

  if (command.requiredPerms && !message.member.permissions.has(command.requiredPerms)) {
    let msg = await message.channel.send(command.permError);
  }

  command.execute(message, args, prefix);
}