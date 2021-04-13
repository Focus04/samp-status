const { MessageAttachment } = require('discord.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const moment = require('moment');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);
const intervals = new Keyv(process.env.intervals);
const maxPlayers = new Keyv(process.env.maxPlayers);
const { reactionError, reactionSuccess, deletionTimeout, chartWidth, chartHeight } = require('../config.json');

module.exports = {
  name: 'serverchart',
  description: 'Sends a chart displaying maximum players for each day.',
  usage: 'serverchart',
  async execute(message, prefix) {
    const interval = await intervals.get(message.guild.id);
    if (!interval) {
      let msg = await message.channel.send(`You must set an interval to view this. Set one using ${prefix}setinterval`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    let roleColor;
    if (message.guild.me.roles.highest.color === 0) roleColor = '#b9bbbe';
    else roleColor = '#' + message.guild.me.roles.highest.color.toString(16);
    const serverAddress = await servers.get(message.guild.id);
    const data = await maxPlayers.get(`${serverAddress.ip}:${serverAddress.port}`);
    let players = [];
    let dates = [];
    data.days.forEach((day) => {
      players.push(day.value);
      dates.push(moment(day.date - 40000000).format('D.M.YYYY'));
    });
    const canvas = new ChartJSNodeCanvas({
      width: chartWidth,
      height: chartHeight
    });
    const config = {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'player count',
            data: players,
            backgroundColor: roleColor,
            borderWidth: 2,
            borderColor: '#777777'
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `Most players per day on ${serverAddress.ip}:${serverAddress.port}`,
            padding: {
              top: 30,
              bottom: 30
            }
          },
          legend: { display: false }
        }
      },
      plugins: [
        {
          id: 'background-color',
          beforeDraw: (chart) => {
            const ctx = chart.canvas.getContext('2d');
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(0, 0, chart.width + 30, chart.height + 30);
            ctx.restore();
          }
        }
      ]
    };
    const image = await canvas.renderToBuffer(config);
    const attachment = new MessageAttachment(image);
    await message.channel.send(attachment);
    message.react(reactionSuccess);
  }
}