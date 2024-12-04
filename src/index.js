import { ScreenMonitor } from './monitor.js';
import { ScreenCapture } from './capture.js';
import { ImageComparator } from './comparator.js';
import { NotificationService } from './notification.js';
import { Logger } from './utils/logger.js';
import { DEFAULT_SETTINGS, getCurrentEnvironment } from './config/settings.js';

const logger = new Logger({ 
  debug: true,
  logDir: 'debug-logs'
});

const capture = new ScreenCapture(logger);
const comparator = new ImageComparator({ 
  logger,
  ...DEFAULT_SETTINGS
});
const notifier = new NotificationService();

const monitor = new ScreenMonitor({
  capture,
  comparator,
  notifier,
  logger,
  interval: DEFAULT_SETTINGS.interval
});

logger.info(`Starting in ${getCurrentEnvironment()} mode`);
logger.info('Monitor settings:', DEFAULT_SETTINGS);
logger.info('Monitored region:', DEFAULT_SETTINGS.region);

process.on('SIGINT', () => {
  monitor.stop();
  process.exit(0);
});

monitor.start();