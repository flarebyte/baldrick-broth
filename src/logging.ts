import { readFile } from 'node:fs/promises';
import winston from 'winston';
import { coloration } from './coloration.js';
import { isCI } from './is-ci.js';
import { LogMessage } from './log-model.js';

const { printf } = winston.format;
const consoleLikeFormat = printf(({ message }) => {
  return message;
});

export const currentTaskLogger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: 'temp/log/baldrick-broth-log.txt',
      options: { flags: 'w' },
      format: consoleLikeFormat,
    }),
  ],
});

export const currentTaskWarn = (content: LogMessage) => {
  if (isCI) {
    currentTaskLogger.warn(`✗ ${content.message}`);
  } else {
    currentTaskLogger.warn(coloration.warn('✗') + ' ' + content.coloredMessage);
  }
};

export const telemetryTaskLogger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: 'temp/log/baldrick-broth-telemetry.csv',
      format: consoleLikeFormat,
    }),
  ],
});

export const telemetryTaskRefLogger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: 'temp/log/baldrick-broth-telemetry-ref.csv',
      format: consoleLikeFormat,
    }),
  ],
});

export const replayLogToConsole = async () => {
  try {
    const currentLog = await readFile('temp/log/baldrick-broth-log.txt', {
      encoding: 'utf8',
    });
    console.log(['', '', currentLog].join('\n'));
  } catch (e: any) {
    console.error('Could not replay the log', e);
  }
};
