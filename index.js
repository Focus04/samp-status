import { config } from 'dotenv';
import { readdir } from 'fs';
import { Client, Collection } from 'discord.js';

config();
const client = new Client();

let commands = [];
client.commands = new Collection();
readdir('./commands', (err, files) => {
  files.forEach(async (file) => {
    const command = await import(`./commands/${file}`);
    client.commands.set(command.default.data.name, command.default);
    if (command.default.data.name !== 'help') commands.push(command.default.data.toJSON());
  })
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