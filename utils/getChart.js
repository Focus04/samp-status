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
          // backgroundColor: color.rgba,
          borderColor: color.rgb,
          pointRadius: 5,
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
          font: { size: 27 }
        },
        legend: {
          align: 'end',
          labels: {
            usePointStyle: true,
            boxHeight: 8,
            font: { size: 17 }
          }
        }
      },
      elements: {
        line: {
          borderWidth: 5
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            font: { size: 17 }
          }
        },
        y: {
          min: 0,
          max: data.maxPlayers,
          grid: {
            borderDash: [10],
            lineWidth: 2,
            drawBorder: false
          },
          ticks: {
            font: { size: 17 }
          }
        }
      },
      layout: { padding: 20 }
    },
    plugins: [
      {
        id: 'background-gradient',
        beforeDraw: (chart) => {
          const ctx = chart.canvas.getContext('2d');
          ctx.save();
          const gradient = ctx.createLinearGradient(0, 0, 0, 100);
          gradient.addColorStop(0.5, 'transparent');
          gradient.addColorStop(1, color.rgba);
          chart.data.datasets[0].backgroundColor = gradient;
        }
      }
    ]
  };

  const image = await canvas.renderToBuffer(config);
  const attachment = new AttachmentBuilder(image);
  return attachment;
}