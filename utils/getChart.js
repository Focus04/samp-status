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
    height: 720,
    backgroundColour: 'white'
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
          align: 'start',
          text: `Most players per day on ${data.name}`,
          font: { size: 20 }
        },
        legend: {
          align: 'end',
          labels: {
            usePointStyle: true,
            boxHeight: 3
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false }
        },
        y: {
          min: 0,
          max: data.maxPlayers,
          grid: {
            borderDash: [10],
            lineWidth: 3
          },
          border: { display: false }
        }
      },
      layout: { padding: 20 }
    }
  };

  const image = await canvas.renderToBuffer(config);
  const attachment = new AttachmentBuilder(image);
  return attachment;
}