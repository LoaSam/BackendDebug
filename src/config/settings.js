export const DEFAULT_SETTINGS = {
  // Screen region settings
  region: {
    x: 725,
    y: 243,
    width: 593,
    height: 736
  },
  
  // Fallback region if primary region is invalid
  fallbackRegion: {
    x: 100,
    y: 100,
    width: 800,
    height: 600
  },
  
  // Image comparison settings
  threshold: 0.1,           // Default threshold for pixel differences (0-1)
  minChangedPixels: 100,    // Minimum number of pixels that must change to trigger detection
  ignoreAntialiasing: true, // Whether to ignore anti-aliasing artifacts
  
  // Monitoring settings
  interval: 2000,           // Screenshot interval in milliseconds
  
  // Mock environment settings
  mockChangeInterval: 5,    // Number of iterations before mock image changes
  mockChangePercent: 0.2,   // Percentage of mock image that changes (0-1)
  
  // Image capture settings
  maintainAspectRatio: true, // Whether to maintain aspect ratio when resizing
  resizeMode: 'contain',    // 'contain' | 'cover' | 'fill'
};

export const ENVIRONMENTS = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
};

export function getCurrentEnvironment() {
  return process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;
}

export function validateRegion(region, screenDimensions) {
  const { width: screenWidth, height: screenHeight } = screenDimensions;
  
  // Check if region is within screen bounds
  if (region.x < 0 || region.y < 0) {
    throw new Error(`Invalid region coordinates: (${region.x}, ${region.y}). Coordinates must be non-negative.`);
  }
  
  if (region.width <= 0 || region.height <= 0) {
    throw new Error(`Invalid region dimensions: ${region.width}x${region.height}. Dimensions must be positive.`);
  }
  
  if (region.x + region.width > screenWidth || region.y + region.height > screenHeight) {
    throw new Error(
      `Region (${region.x},${region.y},${region.width},${region.height}) ` +
      `exceeds screen bounds (${screenWidth}x${screenHeight})`
    );
  }
  
  return true;
}