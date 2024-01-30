const morgan = require('morgan');
const log4js = require('log4js');
const fs = require('fs');
const path = require('path');
const app = require('./pokemonServer');



// Define the log directory and file
const logDir = path.join(__dirname, './logs');
const logFile = path.join(logDir, 'server-output.log');

// Create the log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Rename the existing log file if it exists
if (fs.existsSync(logFile)) {
  const timestamp = new Date();
  fs.renameSync(logFile, path.join(logDir, `server-output-${timestamp.getFullYear()}${timestamp.getMonth() + 1}${timestamp.getDate()}.log`));
}

// Configure logger
log4js.configure({
  levels: {
    SUCCESS: {value: 2001, colour: 'green'}
  },
  appenders: {
    fileAppender: { type: 'file', filename: './logs/server-output.log' },
    console: { type:'console' }
  },
  categories: {
    default: { appenders: ['fileAppender', 'console'], level: 'all' },
    file: { appenders: ['fileAppender'], level: 'all' }
  }
});

const logger = log4js.getLogger();
const loggerFile = log4js.getLogger('file');

// Configure morgan and redirect write stream to log4js
morgan.format('log4js', ':method :url :status :response-time ms - :res[content-length]');

app.use(morgan('log4js', {
  "stream": {
    write: function(str) { loggerFile.info(str); }
  },
  skip: (req, res) => process.env.NODE_ENV === 'dev'
}));
app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' }));

module.exports = {
  logger
}