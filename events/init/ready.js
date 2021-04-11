const { MessageEmbed } = require('discord.js');
const { table, getBorderCharacters } = require('table');
const gamedig = require('gamedig');
const Keyv = require('keyv');
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);
const maxPlayers = new Keyv(process.env.maxPlayers);

module.exports = (client) => {
  console.log('I am live');
  client.user.setActivity('SA:MP');
  setInterval(() => {
    client.guilds.cache.forEach(async (guild) => {
      const time = await intervals.get(guild.id);
      if (time && Date.now() >= time.next) {
        let err = 0;
        time.next += time.time;
        const server = await servers.get(guild.id);
        const channel = guild.channels.cache.get(time.channel);
        const data = await gamedig.query({
          type: 'samp',
          host: server.ip,
          port: server.port,
          maxAttempts: 10
        }).catch(async (error) => err = 1);
        if (err === 1 || !data) {
          return channel.send(`${server.ip}:${server.port} did not respond after 10 attempts.`);
        }
        if (data.players.length > time.maxMembersToday) time.maxMembersToday = data.players.length;
        const config = {
          border: getBorderCharacters('void'),
          columnDefault: {
            paddingLeft: 0,
            paddingRight: 1
          },
          drawHorizontalLine: () => {
            return false
          }
        }
        let players = [];
        data.players.forEach(player => {
          let p = [];
          p[0] = player.id;
          p[1] = player.name;
          p[2] = player.score;
          p[3] = player.ping;
          players.push(p);
        });
        let output;
        if (!players.length) output = 'None';
        else output = table(players, config);
        let color;
        if (guild.me.roles.highest.color === 0) color = '#b9bbbe';
        else color = guild.me.roles.highest.color;
        let serverEmbed = new MessageEmbed()
          .setColor(color)
          .setTitle(`${data.name}`)
          .setDescription(data.raw.gamemode)
          .addFields(
            { name: 'Server IP', value: `${server.ip}:${server.port}`, inline: true },
            { name: 'Map', value: `${data.raw.rules.mapname}`, inline: true },
            { name: 'Time', value: `${data.raw.rules.worldtime}`, inline: true },
            { name: 'Forums', value: 'http://' + data.raw.rules.weburl, inline: true },
            { name: 'Version', value: `${data.raw.rules.version}`, inline: true },
            { name: 'Players', value: `${data.players.length}/${data.maxplayers}`, inline: true }
          )
          .setTimestamp();
        if (data.players.length > 0) serverEmbed.addField('ID Name Score Ping', '```' + output + '```');
        const oldMsg = await channel.messages.fetch(time.message).catch((err) => console.log(err));
        if (oldMsg) oldMsg.delete();
        let msg = await channel.send(serverEmbed);
        time.message = msg.id;
        await intervals.set(guild.id, time);
      }
    });
  }, 60000);
  setInterval(async () => {
    const nextCheck = await maxPlayers.get('next');
    if (Date.now() >= nextCheck) {
      await maxPlayers.set('next', nextCheck + 86400000);
      client.guilds.cache.forEach(async (guild) => {
        const time = await intervals.get(guild.id);
        if (!time.maxMembersToday) return;
        let maxPlayers = {};
        maxPlayers.date = Date.now();
        maxPlayers.value = time.maxMembersToday;
        await maxPlayers.set(guild.id, maxPlayers);
      });
    }
  }, 3600000);
}