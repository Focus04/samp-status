module.exports = {
  getStatus: async (server, color, MessageEmbed, getBorderCharacters, gamedig, table) => {
    let err = 0;
    const data = await gamedig.query({
      type: 'samp',
      host: server.ip,
      port: server.port,
      maxAttempts: 10
    }).catch(() => err = 0);
    if (err === 1 || !data)  return `${server.ip}:${server.port} did not respond after 10 attempts.`;
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
    let players = [['ID', 'Name    Test', 'Score', 'Ping']];
    data.players.forEach((player) => {
      players.push([player.id.toString(), player.name, player.score.toString(), player.ping.toString()]);
    });
    console.log(players);
    let output;
    if (!data.players.length) output = 'None';
    else output = table(players, config);
    let serverEmbed = new MessageEmbed()
      .setColor(color.hex)
      .setTitle(`${data.name} - Online Players`)
      .setDescription(output)
      .addFields(
        { name: 'Server IP', value: `${server.ip}:${server.port}`, inline: true },
        { name: 'Gamemode', value: `${data.raw.gamemode}`, inline: true },
        { name: 'Time', value: `${data.raw.rules.worldtime}`, inline: true },
        { name: 'Forums', value: 'http://' + data.raw.rules.weburl, inline: true },
        { name: 'Version', value: `${data.raw.rules.version}`, inline: true },
        { name: 'Players', value: `${data.players.length}/${data.maxplayers}`, inline: true }
      )
      .setTimestamp();
    return serverEmbed;
  },

  getPlayerCount: async (server, gamedig) => {
    let err = 0;
    const data = await gamedig.query({
      type: 'samp',
      host: server.ip,
      port: server.port,
      maxAttempts: 10
    }).catch(() => err = 0);
    if (err === 1 || !data) return -1;
    else return data.players.length;
  }
}