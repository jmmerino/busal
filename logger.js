var winston = require('winston');

var logger = new(winston.Logger)({
  transports: [
    new(winston.transports.Console)({
      level: 'debug',
      colorize: true,
      timestamp: true
    }),
    new winston.transports.File({
      level: 'debug',
      filename: process.cwd() + '/logs/debug.log',
    })
  ],
  exceptionHandlers: [
    new(winston.transports.Console)({
      colorize: true,
      timestamp: true
    }),
    new winston.transports.File({
      filename: process.cwd() + '/logs/exceptions.log',
    })
  ],
  exitOnError: true
});

logger.info('Log Levels set to:', logger.levels);

module.exports = logger;
