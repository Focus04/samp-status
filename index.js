import { config } from 'dotenv';
import { readdir } from 'fs/promises';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [];
client.commands = new Collection();

async function loadCommands() {
  const commandFolders = await readdir('./commands');

  await Promise.all(commandFolders.map(async (folder) => {
    const commandFiles = await readdir(`./commands/${folder}`);

    await Promise.all(commandFiles.map(async (file) => {
      const command = await import(`./commands/${folder}/${file}`);
      client.commands.set(command.default.data.name, command.default);
      if (command.default.data.name !== 'help') {
        commands.push(command.default.data.toJSON());
      }
    }));
  }));
}

async function loadEvents() {
  const eventFolders = await readdir('./events');

  await Promise.all(eventFolders.map(async (folder) => {
    const eventFiles = await readdir(`./events/${folder}`);

    await Promise.all(eventFiles.map(async (file) => {
      const event = await import(`./events/${folder}/${file}`);
      client.on(event.default.name, (...args) => event.default.execute(...args));
    }));
  }));
}

(async function initialize() {
  await loadCommands();
  await loadEvents();
  await client.login(process.env.token);
}) ();

export default { client, commands };