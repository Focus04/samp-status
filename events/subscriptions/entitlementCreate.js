import Keyv from 'keyv';

const subscriptions = new Keyv(process.env.database, { collection: 'subscriptions' });

export default {
  name: 'entitlementCreate',
  execute: async (entitlement) => {
    const guildConfigs = client.guildConfigs.get(entitlement.guildId);
    if (!guildConfigs) return;
    let { server = {} } = guildConfigs;

    let subscribedServers = await subscriptions.get('subscribedServers');
    subscribedServers.push(server);
    await subscriptions.set('subscribedServers', subscribedServers);
  }
}