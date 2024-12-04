import { MockScreenCapture } from './capture.js';
import { ImageComparator } from './comparator.js';
import { NotificationService } from './notification.js';
import { Logger } from './utils/logger.js';

async function runTests() {
  const logger = new Logger();
  logger.info('Starting tests...');

  // Test MockScreenCapture
  const capture = new MockScreenCapture();
  const screenshot1 = await capture.takeScreenshot();
  const screenshot2 = await capture.takeScreenshot();
  console.assert(screenshot1 !== screenshot2, 'MockScreenCapture should return different values');

  // Test ImageComparator
  const comparator = new ImageComparator();
  const result = comparator.compare('test1', 'test2');
  console.assert(result.hasChanges === true, 'Comparator should detect changes');

  // Test NotificationService
  const notifier = new NotificationService();
  notifier.notify('Test Notification', 'This is a test notification');

  logger.info('All tests completed!');
}

runTests();