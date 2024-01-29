const morgan = require('morgan');
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

// Create a write stream in append mode
const accessLogStream = fs.createWriteStream(logFile, {flags: 'a'});

// Setup the logger
app.use(morgan('combined', { 
  stream: accessLogStream,
  skip: (req, res) => process.env.NODE_ENV === 'dev'
}));
app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' }));