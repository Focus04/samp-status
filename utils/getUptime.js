import Keyv from 'keyv';

const uptimes = new Keyv(process.env.database, { collection: 'uptime' });

export async function getUptime(server) {
  let onlineStats = await uptimes.get(`${server.ip}:${server.port}`);
  let percent;
  if (!onlineStats) {
    onlineStats = {
      uptime: 0,
      downtime: 0,
    };
  }

  const uptime = {
    color: '',
    emoji: '',
    text: '',
  };

  if (onlineStats.uptime === 0 && onlineStats.downtime === 0) {
    uptime.text = 'N/A';
  } else {
    percent = (onlineStats.uptime / (onlineStats.uptime + onlineStats.downtime)) * 100;
    uptime.text = `${percent.toFixed(2)}%`;
  }

  switch (true) {
    case percent >= 99:
      uptime.color = '#339933';
      uptime.emoji = ':green_circle:';
      break;
    case percent >= 96 && percent < 99:
      uptime.color = '#ffff00';
      uptime.emoji = ':yellow_circle:';
      break;
    case percent >= 90 && percent < 95:
      uptime.color = '#ff9900';
      uptime.emoji = ':orange_circle:';
      break;
    case percent < 90:
      uptime.color = '#ff0000';
      uptime.emoji = ':red_circle:';
      break;
    default:
      uptime.color = '#cccccc';
      uptime.emoji = ':white_circle:';
  }

  return uptime;
}

export function formatUrl(url) {
  if (!url?.trim()) return 'N/A';
  return url.startsWith('http') ? url : `https://${url.trim()}`;
}