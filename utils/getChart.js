import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { AttachmentBuilder } from 'discord.js';
import moment from 'moment';

export async function getChart(data, color) {
  let players = [];
  let dates = [];
  data.days.forEach((day) => {
    players.push(day.value);
    dates.push(moment(day.date - 40000000).format('D.M'));
  });

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
          text: `Most players per day on ${data.name}`,
          padding: { bottom: 10 },
          font: { size: 20 },
        }
      },
      scales: {
        x: {
          grid: { display: false },
          title: {
            display: true,
            text: 'Date',
            font: { size: 15 }
          }
        },
        y: {
          min: 0,
          max: data.maxPlayers,
          grid: {
            borderDash: [10]
          },
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
        // id: 'background-color',
        // beforeDraw: (chart) => {
        //   const ctx = chart.canvas.getContext('2d');
        //   ctx.save();
        //   ctx.globalCompositeOperation = 'destination-over';
        //   ctx.fillStyle = '#eeeeee';
        //   ctx.fillRect(0, 0, chart.width, chart.height);
        //   ctx.restore();
        }
      }
    ]
  };

  const image = await canvas.renderToBuffer(config);
  const attachment = new AttachmentBuilder(image);
  return attachment;
}