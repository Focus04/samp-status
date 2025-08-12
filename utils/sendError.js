import config from '../config.json' assert { type: 'json' };
import index from '../index.js';

export function sendWarningLog(msg) {
  const logsChId = config.logsChId;
  index.client.channels.cache.get(logsChId).send('⚠️ ' + msg);
  console.log(msg);
}

export function sendInfoLog(msg) {
  const logsChId = config.logsChId;
  index.client.channels.cache.get(logsChId).send('ℹ️ ' + msg);
  console.log(msg);
}