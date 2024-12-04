export function createSafeLogger(logger) {
  if (!logger) {
    return {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      setDebugMode: () => {},
      setLogLevel: () => {}
    };
  }
  
  return {
    info: (message, data) => logger.info?.(message, data),
    warn: (message, data) => logger.warn?.(message, data),
    error: (message, data) => logger.error?.(message, data),
    debug: (message, data) => logger.debug?.(message, data),
    setDebugMode: (enabled) => logger.setDebugMode?.(enabled),
    setLogLevel: (level) => logger.setLogLevel?.(level)
  };
}

export function validateLogger(logger) {
  const requiredMethods = ['info', 'warn', 'error', 'debug'];
  const missingMethods = requiredMethods.filter(method => typeof logger[method] !== 'function');
  
  if (missingMethods.length > 0) {
    console.warn(`Logger is missing required methods: ${missingMethods.join(', ')}`);
    return false;
  }
  
  return true;
}