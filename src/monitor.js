import { DEFAULT_SETTINGS } from './config/settings.js';
import { createSafeLogger } from './utils/loggerUtils.js';

export class ScreenMonitor {
  constructor({ capture, comparator, notifier, logger, interval = DEFAULT_SETTINGS.interval }) {
    this.capture = capture;
    this.comparator = comparator;
    this.notifier = notifier;
    this.logger = createSafeLogger(logger);
    this.interval = interval;
    this.previousData = null;
    this.isRunning = false;
    this.iterationCount = 0;
  }

  async start() {
    try {
      this.isRunning = true;
      this.logger.info('Starting screen monitoring', {
        interval: this.interval,
        settings: DEFAULT_SETTINGS
      });
      
      while (this.isRunning) {
        await this.runMonitoringIteration();
        await new Promise(resolve => setTimeout(resolve, this.interval));
      }
    } catch (error) {
      this.logger.error('Fatal error in monitoring loop', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code
        },
        context: {
          isRunning: this.isRunning,
          iterationCount: this.iterationCount,
          interval: this.interval
        }
      });
      this.stop();
      throw error;
    }
  }

  async runMonitoringIteration() {
    try {
      this.iterationCount++;
      this.logger.debug('Starting monitoring iteration', {
        iteration: this.iterationCount
      });

      const currentData = await this.capture.takeScreenshot();
      
      if (this.previousData) {
        this.logger.debug('Comparing screenshots');
        const changes = await this.comparator.compare(this.previousData, currentData);
        
        if (changes.hasChanges) {
          this.logger.info('Changes detected', {
            differences: changes.differences,
            iteration: this.iterationCount
          });
          
          this.notifier.notify(
            'Screen Change Detected',
            `Changes found: ${changes.differences.diffPixels} pixels ` +
            `(${changes.differences.diffPercentage.toFixed(2)}%)`
          );
        } else {
          this.logger.debug('No changes detected', {
            iteration: this.iterationCount
          });
        }
      } else {
        this.logger.debug('First screenshot captured, storing as baseline');
      }
      
      this.previousData = currentData;
    } catch (error) {
      this.logger.error('Error during monitoring iteration', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code
        },
        context: {
          iteration: this.iterationCount,
          hasBaseline: !!this.previousData
        }
      });
      // Continue monitoring despite errors in individual iterations
    }
  }

  stop() {
    this.isRunning = false;
    this.logger.info('Stopping screen monitoring', {
      totalIterations: this.iterationCount
    });
  }

  setInterval(interval) {
    this.logger.debug('Updating monitoring interval', {
      previous: this.interval,
      new: interval
    });
    this.interval = interval;
  }
}