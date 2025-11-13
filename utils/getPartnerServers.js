import Keyv from 'keyv';

const subscriptions = new Keyv(process.env.database, { collection: 'subscriptions' });

export async function getPartnerServers() {
  let serializedPartnerServers = ''
  partnerServers = await subscriptions.get('subscribedServers');

  if (!partnerServers[0]) serializedPartnerServers = 'Coming soon...'
  else serializedPartnerServers = partnerServers.map((server) => `${server.name}: ${server.ip}`).join('\n');
  
  return serializedPartnerServers;
}