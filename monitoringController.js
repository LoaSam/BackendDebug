import Logger from './src/utils/logger.js';  // Updated import path for logger

let isMonitoring = false; // Simple flag to track monitoring status

export function startMonitoring(req, res) {
  try {
    // Start monitoring (you can add your actual monitoring logic here)
    isMonitoring = true;
    Logger.info('Monitoring started');
    res.status(200).json({ message: "Monitoring started" });
  } catch (error) {
    Logger.error('Error starting monitoring:', error);
    res.status(500).json({ error: 'Failed to start monitoring' });
  }
}

export function stopMonitoring(req, res) {
  try {
    // Stop monitoring
    isMonitoring = false;
    Logger.info('Monitoring stopped');
    res.status(200).json({ message: "Monitoring stopped" });
  } catch (error) {
    Logger.error('Error stopping monitoring:', error);
    res.status(500).json({ error: 'Failed to stop monitoring' });
  }
}

export function getMonitoringStatus(req, res) {
  try {
    // Return monitoring status
    Logger.info('Fetching monitoring status...');
    res.status(200).json({ message: isMonitoring ? "Monitoring is active" : "Monitoring is inactive" });
  } catch (error) {
    Logger.error('Error getting monitoring status:', error);
    res.status(500).json({ error: 'Unable to fetch monitoring status' });
  }
}
