import Keyv from 'keyv';

const subscriptions = new Keyv(process.env.database, { collection: 'subscriptions' });

export default {
  name: 'entitlementCreate',
  execute: async (entitlement) => {
    let subscribedServers = await subscriptions.get('subscribedServers');
    const guildConfigs = client.guildConfigs.get(guild.id);
    if (!guildConfigs) return;

    let { server = {} } = guildConfigs;
    subscribedServers.push(server);
    await subscriptions.set('subscribedServers', []);
  }
}