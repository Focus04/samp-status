require('dotenv').config();
const { readdirSync } = require('fs');
const { Client, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId } = require('./config.json');

const client = new Client({ intents: ['GUILD_MESSAGES', 'GUILDS'] });

const loadCommands = (async () => {
  let commands = [];
  client.commands = new Collection();
  readdirSync('./commands').forEach((file) => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  });
  const rest = new REST({ version: '9' }).setToken(process.env.token);
  await rest.put(
    Routes.applicationCommands('786612528951197726'),
    { body: commands },
  );
})();

const loadEvents = (() => {
  readdirSync('./events').forEach((folder) => {
    readdirSync(`./events/${folder}`).forEach((file) => {
      const event = require(`./events/${folder}/${file}`);
      client.on(file.split('.')[0], event.bind(null, client));
    });
  });
})();

client.login(process.env.token);