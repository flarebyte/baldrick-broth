import { readFile } from 'node:fs/promises';
import winston from 'winston';

const { printf } = winston.format;
const consoleLikeFormat = printf(({ message }) => {
  return message;
});

export const currentTaskLogger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({
      filename: 'temp/log/baldrick-broth-log.json',
      options: { flags: 'w' },
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: 'temp/log/baldrick-broth-log.txt',
      options: { flags: 'w' },
      format: consoleLikeFormat,
    }),
  ],
});

export const createLineActionLogger = (opts: {
  name: string;
  command: string;
}) => {
  const { name, command } = opts;
  return currentTaskLogger.child({
    name,
    command,
  });
};

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
