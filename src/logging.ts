/**
 * Responsibilities: Logging and telemetry utilities.
 * - Provides file-backed logger, console replay, and CSV telemetry outputs
 */
/**
 * Responsibilities: Logging and telemetry utilities.
 * - Provides file-backed logger, console replay, and centralized telemetry outputs
 */

import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
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

// Centralized telemetry directory under user home: ~/.baldrick-broth/telemetry
const telemetryDir = path.join(os.homedir(), '.baldrick-broth', 'telemetry');
try {
  fs.mkdirSync(telemetryDir, { recursive: true });
} catch {}

const telemetryFile = path.join(telemetryDir, 'baldrick-broth-telemetry.csv');
const telemetryRefFile = path.join(
  telemetryDir,
  'baldrick-broth-telemetry-ref.csv',
);

export const telemetryTaskLogger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: telemetryFile,
      format: consoleLikeFormat,
      maxsize: 1_048_576, // ~1 MB rotation threshold
      maxFiles: 5,
    }),
  ],
});

export const telemetryTaskRefLogger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: telemetryRefFile,
      format: consoleLikeFormat,
      maxsize: 1_048_576, // ~1 MB rotation threshold
      maxFiles: 5,
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
