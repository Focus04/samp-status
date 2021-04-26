module.exports =  {
  getChart: async (guild, data, ChartJSNodeCanvas, MessageAttachment, moment) => {
    let roleHexColor;
    if (guild.me.roles.highest.color === 0) roleHexColor = '#b9bbbe';
    else roleHexColor = '#' + guild.me.roles.highest.color.toString(16);
    let r = parseInt(roleHexColor.slice(1, 3), 16);
    let g = parseInt(roleHexColor.slice(3, 5), 16);
    let b = parseInt(roleHexColor.slice(5, 7), 16);
    let roleRgbColor = `rgb(${r}, ${g}, ${b})`;
    let roleRgbaColor = `rgba(${r}, ${g}, ${b}, 0.1)`;
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
            backgroundColor: roleRgbaColor,
            borderColor: roleRgbColor,
            tension: 0.5,
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
            font: { size: 20 },
            padding: { bottom: 10 }
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
            max: 100,
            title: {
              display: true,
              text: 'Players',
              font: { size: 15 }
            }
          }
        },
        elements: {
          point: { radius: (ctx) => ctx.parsed.y / 3 }
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
    return attachment;
  }
}