import fs from 'fs/promises';
import path from 'path';

const DEBUG_OUTPUT_DIR = 'output/failed';

export async function ensureDebugDirectory() {
  try {
    await fs.mkdir(DEBUG_OUTPUT_DIR, { recursive: true });
    return true;
  } catch (error) {
    console.error('Failed to create debug directory:', error);
    return false;
  }
}

export async function saveDebugBuffer(buffer, prefix, logger) {
  try {
    const dirCreated = await ensureDebugDirectory();
    if (!dirCreated) {
      logger?.warn('Could not save debug buffer: failed to create directory');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(DEBUG_OUTPUT_DIR, `${prefix}-${timestamp}.png`);
    
    await fs.writeFile(filename, buffer);
    logger?.debug(`Debug buffer saved`, { filename });
  } catch (error) {
    logger?.error('Failed to save debug buffer', { error });
  }
}

export async function createDebugImage(img1Buffer, img2Buffer, diffBuffer, logger) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(DEBUG_OUTPUT_DIR, `comparison-${timestamp}.png`);
    
    // Save individual images for debugging
    await Promise.all([
      saveDebugBuffer(img1Buffer, 'img1', logger),
      saveDebugBuffer(img2Buffer, 'img2', logger),
      saveDebugBuffer(diffBuffer, 'diff', logger)
    ]);

    return filename;
  } catch (error) {
    logger?.error('Failed to create debug image', { error });
    return null;
  }
}