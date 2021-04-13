const { MessageAttachment } = require('discord.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const moment = require('moment');
const Keyv = require('keyv');
const servers = new Keyv(process.env.servers);
const intervals = new Keyv(process.env.intervals);
const maxPlayers = new Keyv(process.env.maxPlayers);
const { reactionError, reactionSuccess, deletionTimeout, chartWidth, chartHeight } = require('../config.json');
const testData = require('./testData.json');

module.exports = {
  name: 'serverchart',
  description: 'Sends a chart displaying server statistics for each day.',
  usage: 'serverchart',
  async execute(message, prefix) {
    let loadingMsg = await message.channel.send('Fetching server info...');
    const interval = await intervals.get(message.guild.id);
    if (!interval) {
      let msg = await loadingMsg.edit(`You must set an interval to view statistics. Set one using ${prefix}setinterval`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    let roleHexColor;
    if (message.guild.me.roles.highest.color === 0) roleHexColor = '#b9bbbe';
    else roleHexColor = '#' + message.guild.me.roles.highest.color.toString(16);
    let r = parseInt(roleHexColor.slice(1, 3), 16);
    let g = parseInt(roleHexColor.slice(3, 5), 16);
    let b = parseInt(roleHexColor.slice(5, 7), 16);
    let roleRgbColor = `rgb(${r}, ${g}, ${b})`;
    let roleRgbaColor = `rgba(${r}, ${g}, ${b}, 0.1)`
    const serverAddress = await servers.get(message.guild.id);
    const data = await maxPlayers.get(`${serverAddress.ip}:${serverAddress.port}`);
    let players = [];
    let dates = [];
    /* testData.forEach((i) => {
      players.push(i.members);
      dates.push(i.date);
    }); */
    data.days.forEach((day) => {
      players.push(day.value);
      dates.push(moment(day.date - 40000000).format('D.M'));
    });
    const canvas = new ChartJSNodeCanvas({
      width: chartWidth,
      height: chartHeight
    });
    const config = {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'players',
            data: players,
            backgroundColor: roleRgbaColor,
            borderWidth: 1,
            borderColor: roleRgbColor,
            fill: {
              target: 'origin',
              below: roleRgbaColor
            }
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `Most players per day on ${serverAddress.ip}:${serverAddress.port}`,
            padding: { bottom: 10 }
          }
        },
        elements: {
          line: { tension: 0.5 }
        },
        layout: { padding: 20 }
      },
      plugins: [
        {
          id: 'background-color',
          beforeDraw: (chart) => {
            const ctx = chart.canvas.getContext('2d');
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#eeeeee';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          }
        }
      ]
    };
    const image = await canvas.renderToBuffer(config);
    const attachment = new MessageAttachment(image);
    await loadingMsg.delete();
    await message.channel.send(attachment);
    message.react(reactionSuccess);
  }
}