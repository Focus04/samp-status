const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const Keyv = require('keyv');
const intervals = new Keyv(process.env.intervals);
const servers = new Keyv(process.env.servers);

module.exports = (client) => {
  console.log('I am live');
  client.user.setActivity('SA:MP');
  setInterval(() => {
    client.guilds.cache.forEach(async (guild) => {
      const time = await intervals.get(guild.id);
      if (time && Date.now() <= time.next) {
        time.next += time.time;
        await intervals.set(guild.id, time);
        const server = await servers.get(guild.id);
        const response = await fetch(`https://monitor.teamshrimp.com/api/fetch/all/${server.ip}/${server.port}/`);
        const data = await response.json();
        let players = '```';
        data.players.map(player => {
          players = players + `${player.name}(${player.id}) - ${player.score} - ${player.ping}` + `\n`;
        });
        if (players === '```') players = '```None```';
        else players = players + '```';
        let serverEmbed = new MessageEmbed()
          .setColor('#00ffbb')
          .setTitle(`${data.servername}`)
          .addFields(
            { name: 'Server IP', value: `${data.ip}:${data.port}`, inline: true },
            { name: 'Map', value: `${data.mapname}`, inline: true },
            { name: 'Time', value: `${data.worldtime}`, inline: true },
            { name: 'Forums', value: 'http://' + data.weburl, inline: true },
            { name: 'Version', value: `${data.version}`, inline: true },
            { name: 'Players', value: `${data.num_players}/${data.max_players}`, inline: true },
            { name: 'Name(ID) - Score - Ping', value: `${players}` }
          )
          .setTimestamp();
        const channel = guild.channels.cache.get(time.channel);
        channel.send(serverEmbed);
      }
    });
  }, 60000);

}