require('dotenv').config();
const { readdirSync } = require('fs');
const { Client, Collection } = require('discord.js');
const intents = {
  ws: {
    intents: ['GUILDS', 'GUILD_MESSAGES']
  }
};
const client = new Client(intents);

client.commands = new Collection();
readdirSync('./commands').forEach((file) => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

readdirSync('./events').forEach((folder) => {
  readdirSync(`./events/${folder}`).forEach((file) => {
    const event = require(`./events/${folder}/${file}`);
    client.on(file.split('.')[0], event.bind(null, client));
  });
});

client.login(process.env.token);