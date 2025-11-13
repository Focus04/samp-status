import Keyv from 'keyv';

const subscriptions = new Keyv(process.env.database, { collection: 'subscriptions' });

export default {
  name: 'entitlementCreate',
  execute: async (entitlement) => {
    const guildConfigs = entitlement.client.guildConfigs.get(entitlement.guildId);
    if (!guildConfigs) return;
    let { server = {}, interval = {} } = guildConfigs;
    server.id = entitlement.guildId;

    let subscribedServers = await subscriptions.get('subscribedServers');
    subscribedServers.push(server);
    await subscriptions.set('subscribedServers', subscribedServers);

    const channel = await entitlement.client.channels
      .fetch(interval.channel)
      .catch((err) => console.log(`WARNING: Could not fetch channel ${interval.channel} in guild ${server.id}!`));
    if (!channel) return;
    channel
      .send(`✅ Congratulations! ${server.name} is now a partner.`)
      .catch((err) => console.log(`WARNING: Could not send message in channel ${interval.channel} in guild ${server.id}!`));
  }
}