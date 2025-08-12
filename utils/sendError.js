import { logsChId } from '../config.json' assert { type: 'json' };
import index from '../index';

export function sendWarningLog(msg) {
  index.client.channels.cache.get(logsChId).send('⚠️ ' + msg);
  console.log(msg);
}

export function sendInfoLog(msg) {
  index.client.channels.cache.get(logsChId).send('ℹ️ ' + msg);
  console.log(msg);
}