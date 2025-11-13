import Keyv from 'keyv';
import config from '../config.json' assert { type: 'json' };

const subscriptions = new Keyv(process.env.database, { collection: 'subscriptions' });

export async function getPartnerServers() {
  let serializedPartnerServers = ''
  const partnerServers = await subscriptions.get('subscribedServers');
  const { storeLink } = config;

  if (!partnerServers[0]) serializedPartnerServers = `[Become a partner now](${storeLink})`
  else serializedPartnerServers = partnerServers.map((server) => `${server.name}: ${server.ip}:${server.port}`).join('\n');

  return serializedPartnerServers;
}