import winston from 'winston';

export const currentTaskLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'temp/log/baldrick-broth.log' }),
  ],
});

export const createLineActionLogger = (opts: { command: string }) => {
  const { command } = opts;
  return currentTaskLogger.child({
    command,
  });
};
