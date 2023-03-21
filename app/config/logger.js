var appRoot = require('app-root-path');
var winston = require('winston');

var option = {
    file: {
        level: 'info',
        filename: `${appRoot}/log/csye6225.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFile: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

var logger = new winston.createLogger({
    transports: [
        new winston.transports.File(option.file),
        new winston.transports.Console(option.console)
    ],
    exitOnError: false,
});

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    },
};

module.exports = logger;