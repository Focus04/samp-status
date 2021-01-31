const { MessageEmbed } = require('discord.js');
const { table, getBorderCharacters } = require('table');
const gamedig = require('gamedig');
const Keyv = require('keyv');
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);

module.exports = (client) => {
  console.log('I am live');
  client.user.setActivity('SA:MP');
  setInterval(() => {
    client.guilds.cache.forEach(async (guild) => {
      const time = await intervals.get(guild.id);
      if (time && time.next <= Date.now()) {
        time.next += time.time;
        const server = await servers.get(guild.id);
        const data = await gamedig.query({
          type: 'samp',
          host: server.ip,
          port: server.port
        });
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
        if (newmsg.guild.me.roles.highest.color === 0) color = '#b9bbbe';
        else color = newmsg.guild.me.roles.highest.color;
        let serverEmbed = new MessageEmbed()
          .setColor(color)
          .setTitle(`${data.name}`)
          .addFields(
            { name: 'Server IP', value: `${server.ip}:${server.port}`, inline: true },
            { name: 'Map', value: `${data.raw.rules.mapname}`, inline: true },
            { name: 'Time', value: `${data.raw.rules.worldtime}`, inline: true },
            { name: 'Forums', value: 'http://' + data.raw.rules.weburl, inline: true },
            { name: 'Version', value: `${data.raw.rules.version}`, inline: true },
            { name: 'Players', value: `${data.players.length}/${data.maxplayers}`, inline: true },
            { name: 'ID Name Score Ping', value: '```'  + output + '```' }
          )
          .setTimestamp();
        const channel = guild.channels.cache.get(time.channel);
        const oldMsg = await channel.messages.fetch(time.message).catch((err) => console.log(err));
        if (oldMsg) oldMsg.delete();
        let msg = await channel.send(serverEmbed);
        time.message = msg.id;
        await intervals.set(guild.id, time);
      }
    });
  }, 60000);
}