import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { AttachmentBuilder } from 'discord.js';
import moment from 'moment';
import gamedig from 'gamedig';
import Keyv from 'keyv';
const maxPlayers = new Keyv(process.env.maxPlayers);

export async function getChart(server, color) {
  let players = [];
  let dates = [];
  const data = await maxPlayers.get(`${server.ip}:${server.port}`);
  data.days.forEach((day) => {
    players.push(day.value);
    dates.push(moment(day.date - 40000000).format('D.M'));
  });

  const liveData = await gamedig.query({
    type: 'samp',
    host: server.ip,
    port: server.port,
    maxAttempts: 5
  }).catch((err) => console.log(err));

  const canvas = new ChartJSNodeCanvas({
    width: 1280,
    height: 720
  });

  const config = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'players',
          data: players,
          backgroundColor: color.rgba,
          borderColor: color.rgb,
          tension: 0.5,
          fill: {
            target: 'origin',
            below: color.rgba
          }
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Most players per day on the server`,
          padding: { bottom: 10 },
          font: { size: 20 },
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
            font: { size: 15 }
          }
        },
        y: {
          min: 0,
          max: liveData.maxplayers,
          title: {
            display: true,
            text: 'Players',
            font: { size: 15 }
          }
        }
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
  const attachment = new AttachmentBuilder(image);
  return attachment;
}