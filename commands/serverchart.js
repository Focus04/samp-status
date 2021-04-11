const moment = require('moment');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);
const intervals = new Keyv(process.env.intervals);
const maxPlayers = new Keyv(process.env.maxPlayers);
const { reactionError, reactionSuccess, deletionTimeout } = require('../config.json');

module.exports = {
  name: 'serverchart',
  description: 'Sends a chart displaying maximum players for each day.',
  usage: 'serverchart',
  async execute(message, args, prefix) {
    const interval = await intervals.get(message.guild.id);
    if (!interval) {
      let msg = await message.channel.send(`You must set an interval to view this. Set one using ${prefix}setinterval`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    const serverAddress = await servers.get(message.guild.id);
    const data = await maxPlayers.get(`${serverAddress.ip}:${serverAddress.port}`);
    let players = [];
    let dates = [];
    
  }
}