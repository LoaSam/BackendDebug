import sharp from 'sharp';
import { saveDebugBuffer } from './debugUtils.js';
import { validateImageDimensions } from './validationUtils.js';

const MAX_RETRIES = 3;

export async function validateImageBuffer(buffer, logger) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Invalid input: Expected a Buffer');
  }

  if (buffer.length === 0) {
    throw new Error('Invalid input: Empty buffer');
  }

  try {
    // Attempt to identify the image format
    const { format, width, height } = await sharp(buffer).metadata();

    if (!format) {
      throw new Error('Unable to determine image format');
    }

    logger?.debug('Validated image buffer', { format, width, height });
    return true;
  } catch (error) {
    logger?.error('Image buffer validation failed', {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    throw new Error(`Invalid image buffer: ${error.message}`);
  }
}

export async function getImageMetadata(buffer, logger) {
  try {
    const metadata = await sharp(buffer, {
      failOnError: false,
      limitInputPixels: false,
      sequentialRead: true,
    }).metadata();

    logger?.debug('Image metadata retrieved', { metadata });
    return metadata;
  } catch (error) {
    logger?.error('Failed to get image metadata', {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    throw error;
  }
}

export async function normalizeImage(buffer, logger) {
  let retryCount = 0;
  let lastError = null;

  while (retryCount < MAX_RETRIES) {
    try {
      // Validate buffer before processing
      await validateImageBuffer(buffer, logger);

      const metadata = await getImageMetadata(buffer, logger);
      validateImageDimensions(metadata.width, metadata.height);

      // Ensure PNG format and consistent color space
      const normalizedBuffer = await sharp(buffer, {
        failOnError: false,
        sequentialRead: true,
      })
        .png()
        .toColorspace('srgb')
        .ensureAlpha() // Ensure alpha channel is present
        .raw()
        .toBuffer();

      return {
        data: normalizedBuffer,
        info: {
          width: metadata.width,
          height: metadata.height,
          channels: 4, // Ensure alpha channel included
          space: 'srgb',
        },
      };
    } catch (error) {
      lastError = error;
      await saveDebugBuffer(buffer, `normalization-failed-${retryCount}`, logger);

      logger?.warn(`Image normalization attempt ${retryCount + 1}/${MAX_RETRIES} failed`, {
        error: {
          message: error.message,
          stack: error.stack,
        },
        retryCount,
      });

      retryCount++;
      if (retryCount < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
      }
    }
  }

  throw new Error(`Image normalization failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

export async function adjustRegionToScreen(region, screenDimensions, logger) {
  const adjusted = { ...region };
  let wasAdjusted = false;

  try {
    // Ensure region stays within screen bounds
    if (adjusted.x < 0) {
      adjusted.x = 0;
      wasAdjusted = true;
    }
    if (adjusted.y < 0) {
      adjusted.y = 0;
      wasAdjusted = true;
    }

    // Adjust width and height if they exceed screen dimensions
    if (adjusted.x + adjusted.width > screenDimensions.width) {
      adjusted.width = Math.max(1, screenDimensions.width - adjusted.x);
      wasAdjusted = true;
    }
    if (adjusted.y + adjusted.height > screenDimensions.height) {
      adjusted.height = Math.max(1, screenDimensions.height - adjusted.y);
      wasAdjusted = true;
    }

    // Validate final dimensions
    validateImageDimensions(adjusted.width, adjusted.height);

    return { region: adjusted, wasAdjusted };
  } catch (error) {
    logger?.error('Failed to adjust region', {
      error: {
        message: error.message,
        stack: error.stack,
      },
      region,
      screenDimensions,
    });
    throw error;
  }
}
