import Keyv from 'keyv';

const subscriptions = new Keyv(process.env.database, { collection: 'subscriptions' });

export default {
  name: 'entitlementDelete',
  execute: async (entitlement) => {
    let subscribedServers = await subscriptions.get('subscribedServers');
    const newSubscribedServers = subscribedServers.filter((server) => server.id !== entitlement.guildId);
    await subscriptions.set('subscribedServers', newSubscribedServers);
    entitlement.client.guildConfigs.set('subscribedServers', subscribedServers);
  }
}