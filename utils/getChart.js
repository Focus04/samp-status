import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { AttachmentBuilder } from 'discord.js';
import moment from 'moment';

export async function getChart(data, color) {
  const players = [];
  const dates = [];

  data.days?.forEach((day) => {
    players.push(day.value);
    dates.push(moment(day.date - 40000000).format('D.M'));
  });

  const maxDataValue = Math.max(...players);
  const dynamicYMax = maxDataValue > 0 ? Math.ceil(maxDataValue * 1.2) : 10

  const canvas = new ChartJSNodeCanvas({
    width: 1280,
    height: 720,
    backgroundColour: '#2b2d31',
  });

  const config = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Players',
        data: players,
        backgroundColor: color.rgba,
        borderColor: color.rgb,
        pointRadius: 2,
        pointBackgroundColor: color.rgb,
        borderWidth: 4,
        tension: 0.4,
        fill: {
          target: 'origin',
          below: color.rgba,
        },
      }],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Most players per day on ${data.name}`,
          color: '#ffffff',
          font: { size: 28, weight: 'bold' },
          padding: { bottom: 20 },
        },
        legend: {
          align: 'end',
          labels: {
            color: '#dcddde',
            usePointStyle: true,
            boxHeight: 10,
            font: { size: 16 },
          },
        },
      },
      layout: { padding: 30 },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#b5bac1',
            font: { size: 16 },
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          min: 0,
          suggestedMax: dynamicYMax,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            lineWidth: 1,
            drawBorder: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: '#b5bac1',
            font: { size: 16 },
            stepSize: Math.ceil(dynamicYMax / 5),
          },
        },
      },
    },
  };

  const image = await canvas.renderToBuffer(config);
  return new AttachmentBuilder(image);
}