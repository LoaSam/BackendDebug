import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import winston from 'winston';

// Define the log file path for Winston
const logFilePath = path.join(process.cwd(), 'logs', 'server.log');

// Create Winston logger with transports for console and file
const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logFilePath }),
  ],
});

// Ensure log directory exists
async function ensureLogDirectory() {
  const logDir = path.join(process.cwd(), 'logs');
  try {
    await fs.mkdir(logDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create log directory:', error);
  }
}

await ensureLogDirectory();

export class Logger {
  constructor(options = {}) {
    this.debugMode = options.debug || false;
    this.logDir = options.logDir || 'logs';
    this.logLevel = options.logLevel || 'info';
    this.setupLogDirectory();
  }

  async setupLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  async saveDebugImage(debugImage, prefix = 'debug') {
    if (!debugImage) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${prefix}-${timestamp}.png`;
      await fs.writeFile(path.join(this.logDir, filename), debugImage);
      this.debug(`Debug image saved: ${filename}`);
    } catch (error) {
      this.error('Failed to save debug image:', error);
    }
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${level.toUpperCase()} ${timestamp}] ${message}`;

    if (data) {
      if (typeof data === 'object' && !Array.isArray(data)) {
        formattedMessage += '\n' + JSON.stringify(data, null, 2);
      } else {
        formattedMessage += ' ' + JSON.stringify(data);
      }
    }

    return formattedMessage;
  }

  log(level, message, data) {
    const formattedMessage = this.formatMessage(level, message, data);

    // Log with Winston
    winstonLogger.log(level, message);

    // Log to console with chalk
    switch (level.toLowerCase()) {
      case 'info':
        console.log(chalk.blue(formattedMessage));
        break;
      case 'warn':
        console.warn(chalk.yellow(formattedMessage));
        break;
      case 'error':
        console.error(chalk.red(formattedMessage));
        break;
      case 'debug':
        if (this.debugMode) {
          console.log(chalk.gray(formattedMessage));
          if (data?.debugImage) {
            this.saveDebugImage(data.debugImage);
          }
        }
        break;
      default:
        console.log(formattedMessage);
    }
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  setLogLevel(level) {
    this.logLevel = level;
    winstonLogger.level = level; // Update the Winston logger level dynamically
  }
}

export default new Logger();
