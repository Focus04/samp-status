import Keyv from 'keyv';
import config from '../config.json' assert { type: 'json' };
import index from '../index.js';

const subscriptions = new Keyv(process.env.database, { collection: 'subscriptions' });

export function getPartnerServers(partnerServers) {
  let serializedPartnerServers = '';
  const { storeLink } = config;

  serializedPartnerServers = partnerServers.map((server) => `✓${server.name}\n  ⤷ ${server.ip}:${server.port}`).join('\n');
  serializedPartnerServers += `\n[Become a partner now](${storeLink})`

  return serializedPartnerServers;
}

export async function updatePartnerServers(guildId, server) {
  const partnerServers = await subscriptions.get('subscribedServers');
  const found = partnerServers.filter((partnerServer) => partnerServer.id === guildId);
  if (!found[0]) return;

  server.id = guildId;
  const idx = partnerServers.indexOf(found[0]);
  partnerServers[idx] = server;
  await subscriptions.set('subscribedServers', partnerServers);
  index.client.guildConfigs.set('subscribedServers', partnerServers);
}