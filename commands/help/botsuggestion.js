import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import config from '../../config.json' assert { type: 'json' };

export default {
  data: new SlashCommandBuilder()
    .setName('botsuggestion')
    .setDescription('Submits a suggestion directly to the bot\'s Discord server')
    .addStringOption((option) => option
      .setName('suggestion')
      .setDescription('The suggestion you want to send')
      .setRequired(true)
    ),
  async execute(interaction) {
    const { suggestionChId, discordInviteLink } = config;
    const author = interaction.member.user.tag;
    const suggestion = interaction.options.getString('suggestion');

    interaction.client.channels.cache
      .get(suggestionChId)
      .send(`# Suggestion by ${author}\n\n${suggestion}`)
      .then((msg) => {
        msg.react('👍');
        msg.react('👎');
      });

    interaction.reply({
      content: `Your suggestion has been successfully submitted to our server and is now awaiting a review from the developer's side. You can join our Discord server anytime using this link: ${discordInviteLink}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};