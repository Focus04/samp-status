const fs = require('fs');
const { Client, Collection } = require('discord.js');
const client = new Client();

client.commands = new Collection();
fs.readdirSync('./commands').forEach((file) => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

fs.readdirSync('./events').forEach((folder) => {
  fs.readdirSync(`./events/${folder}`).forEach((file) => {
    const event = require(`./events/${folder}/${file}`);
    client.on(file.split('.')[0], event.bind(null, client));
  });
});

client.login(process.env.token);