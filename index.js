import { config } from 'dotenv';
import { readdir } from 'fs';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let commands = [];
client.commands = new Collection();
readdir('./commands').forEach(folder => {
  readdir(`./commands/${folder}`).forEach(file => {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
    if (command.data.name !== 'help') commands.push(command.data.toJSON());
  });
});

readdir('./events', (err, folders) => {
  folders.forEach((folder) => {
    readdir(`./events/${folder}`, (err, files) => {
      files.forEach(async (file) => {
        const event = await import(`./events/${folder}/${file}`);
        client.on(event.default.name, (...args) => event.default.execute(...args));
      })
    })
  })
});

client.login(process.env.token);
export default commands