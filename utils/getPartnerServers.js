import Keyv from 'keyv';
import config from '../config.json' assert { type: 'json' };

const subscriptions = new Keyv(process.env.database, { collection: 'subscriptions' });

export async function getPartnerServers() {
  let serializedPartnerServers = ''
  const partnerServers = await subscriptions.get('subscribedServers');
  const { storeLink } = config;

  serializedPartnerServers = partnerServers.map((server) => `${server.name}: ${server.ip}:${server.port}`).join('\n');
  serializedPartnerServers += `\n[Become a partner now](${storeLink})`

  return serializedPartnerServers;
}

export async function updatePartnerServers(guildId, server) {
  const partnerServers = await subscriptions.get('subscribedServers');
  const found = partnerServers.filter((partnerServer) => partnerServer.id === guildId);
  if (!found[0]) return;

  server.id = guildId;
  const index = partnerServers.indexOf(found[0]);
  partnerServers[index] = server;
  await subscriptions.set('subscribedServers', partnerServers);
}