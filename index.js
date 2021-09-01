require('dotenv').config();
const { readdirSync, cp } = require('fs');
const { Client } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({ intents: ['GUILD_MESSAGES', 'GUILDS'] });

let commands = [];
readdirSync('./commands').forEach((file) => {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
});
const rest = new REST({ version: '9' }).setToken(process.env.token);
(async () => {
  await rest.put(Routes.applicationGuildCommands(client.user.id, '729313166835712033'), { body: commands });
})();

readdirSync('./events').forEach((folder) => {
  readdirSync(`./events/${folder}`).forEach((file) => {
    const event = require(`./events/${folder}/${file}`);
    client.on(file.split('.')[0], event.bind(null, client));
  });
});

client.login(process.env.token);