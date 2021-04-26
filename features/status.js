module.exports = {
  getStatus: async (guild, server, MessageEmbed, getBorderCharacters, gamedig, table) => {
    let err = 0;
    const data = await gamedig.query({
      type: 'samp',
      host: server.ip,
      port: server.port,
      maxAttempts: 10
    }).catch(() => err = 0);
    if (err === 1 || !data) {
      return `${server.ip}:${server.port} did not respond after 10 attempts.`;
    }

    const config = {
      border: getBorderCharacters(`void`),
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
    return serverEmbed;
  }
}