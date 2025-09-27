/**
 * Responsibilities: Logging and telemetry utilities.
 * - Provides file-backed logger, console replay, and CSV telemetry outputs
 */
import { readFile } from 'node:fs/promises';
import winston from 'winston';
import { coloration } from './coloration.js';
import { isCI } from './is-ci.js';
import type { LogMessage } from './log-model.js';

const { printf } = winston.format;
const consoleLikeFormat = printf((info) => {
  return String(info.message);
});

class BrothLogger {
  thatLogger: winston.Logger;
  constructor() {
    this.thatLogger = winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.File({
          filename: `temp/log/baldrick-broth-log.txt`,
          options: { flags: 'a' },
          format: consoleLikeFormat,
        }),
      ],
    });
  }

  info(message: string | Record<string, unknown>) {
    this.thatLogger.info(message);
  }

  warn(message: string | Record<string, unknown>) {
    this.thatLogger.warn(message);
  }

  error(message: string | Record<string, unknown>) {
    this.thatLogger.error(message);
  }
}

/**
 * Warning: despite expectation the currentTaskLogger is instanciated multiple times,
 * possibly because the file is imported multiple times.
 */
export const currentTaskLogger = new BrothLogger();

export const currentTaskWarn = (content: LogMessage) => {
  if (isCI) {
    currentTaskLogger.warn(`✗ ${content.message}`);
  } else {
    currentTaskLogger.warn(`${coloration.warn('✗')} ${content.coloredMessage}`);
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
  } catch (error: unknown) {
    console.error('Could not replay the log', error);
  }
};
