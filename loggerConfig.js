const morgan = require('morgan');
const log4js = require('log4js');
const fs = require('fs');
const path = require('path');
const app = require('./pokemonServer');



// Define the log directory and file
const today = new Date();
const logDir = path.join(__dirname, './logs');
const logFile = path.join(logDir, `server-output-${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}.log`);
const testLogFile = path.join(logDir, `test-output-${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}.log`);

// Create the log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configure logger
log4js.configure({
  levels: {
    SUCCESS: {value: 2001, colour: 'green'}
  },
  appenders: {
    fileAppender: { type: 'file', filename: logFile },
    testAppender: { type: 'file', filename: testLogFile },
    console: { type:'console' }
  },
  categories: {
    default: { appenders: ['fileAppender', 'testAppender', 'console'], level: 'all' },
    test: { appenders: ['testAppender'], level: 'all' }
  }
});

const logger = log4js.getLogger();
const testLogger = log4js.getLogger('test');

// Configure morgan and redirect write stream to log4js
morgan.format('log4js', ':method :url :status :response-time ms - :res[content-length]');

app.use(morgan('log4js', {
  "stream": {
    write: function(str) { testLogger.info(str); }
  },
  skip: (req, res) => process.env.NODE_ENV === 'dev'
}));
app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' }));

module.exports = {
  logger,
  testLogger
}