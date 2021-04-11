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
  async execute(message, args, prefix) {
    const interval = await intervals.get(message.guild.id);
    if (!interval) {
      let msg = await message.channel.send(`You must set an interval to view this. Set one using ${prefix}setinterval`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    let roleColor;
    if (message.guild.me.roles.highest.color === 0) roleColor = '#b9bbbe';
    else roleColor = message.guild.me.roles.highest.color;
    const serverAddress = await servers.get(message.guild.id);
    const data = await maxPlayers.get(`${serverAddress.ip}:${serverAddress.port}`);
    let players = [];
    let dates = [];
    data.forEach((day) => {
      players.push(day.value);
      dates.push(moment(day.date).format('LL'));
    });
    let chartCallback = (ChartJS) => {
      ChartJS.plugins.register({
        beforeDraw: (chartInstance) => {
          const { chart } = chartInstance
          const { ctx } = chart
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, chart.width, chart.height)
        },
      })
    }
    const canvas = new ChartJSNodeCanvas({
      width: chartWidth,
      height: chartHeight,
      chartCallback
      /* chartCallback: (chartJS) => {
        chartJS.plugins.register(
          {
            beforeDraw: (chartInstance) => {
              chartInstance.chart.ctx.fillStyle = 'white';
              chartInstance.chart.ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
            }
          }
        )
      } */
    });
    const config = {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: `Most players per day on ${serverAddress.ip}:${serverAddress.port}`,
            data: players,
            backgroundColor: roleColor
          }
        ]
      }
    };
    const image = await canvas.renderToBuffer(config);
    const attachment = new MessageAttachment(image);
    await message.channel.send(attachment);
    message.react(reactionSuccess);
  }
}