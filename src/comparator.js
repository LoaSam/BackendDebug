import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import { normalizeImage } from './utils/imageUtils.js';
import { createDebugImage } from './utils/debugUtils.js';
import { DEFAULT_SETTINGS } from './config/settings.js';
import { createSafeLogger } from './utils/loggerUtils.js';

export class ImageComparator {
  constructor(options = {}) {
    this.settings = { ...DEFAULT_SETTINGS, ...options };
    this.logger = createSafeLogger(options.logger);
  }

  async compare(previous, current) {
    try {
      this.logger.debug('Starting image comparison');

      // Normalize both images to ensure consistent format
      const [img1, img2] = await Promise.all([
        normalizeImage(previous, this.logger),
        normalizeImage(current, this.logger),
      ]);

      this.logger.debug('Images normalized', {
        img1: `${img1.info.width}x${img1.info.height}`,
        img2: `${img2.info.width}x${img2.info.height}`,
      });

      // Resize images to match dimensions and ensure consistent channels
      const maxWidth = Math.max(img1.info.width, img2.info.width);
      const maxHeight = Math.max(img1.info.height, img2.info.height);
      const channels = 4; // Ensure alpha channel is included

      const resizedImages = await Promise.all([
        sharp(img1.data, {
          raw: {
            width: img1.info.width,
            height: img1.info.height,
            channels: img1.info.channels,
          },
        })
          .resize(maxWidth, maxHeight, {
            fit: 'fill',
            kernel: 'cubic',
          })
          .ensureAlpha()
          .raw()
          .toBuffer(),
        sharp(img2.data, {
          raw: {
            width: img2.info.width,
            height: img2.info.height,
            channels: img2.info.channels,
          },
        })
          .resize(maxWidth, maxHeight, {
            fit: 'fill',
            kernel: 'cubic',
          })
          .ensureAlpha()
          .raw()
          .toBuffer(),
      ]);

      const resizedImg1 = resizedImages[0];
      const resizedImg2 = resizedImages[1];

      this.logger.debug('Resized images to match dimensions and channels', {
        newDimensions: `${maxWidth}x${maxHeight}`,
      });

      // Create difference buffer for pixelmatch
      const diffBuffer = Buffer.alloc(maxWidth * maxHeight * channels);

      // Compare images using pixelmatch
      const diffPixels = pixelmatch(
        resizedImg1,
        resizedImg2,
        diffBuffer,
        maxWidth,
        maxHeight,
        {
          threshold: this.settings.threshold,
          includeAA: !this.settings.ignoreAntialiasing,
        }
      );

      const totalPixels = maxWidth * maxHeight;
      const diffPercentage = (diffPixels / totalPixels) * 100;

      // Create debug image if in debug mode
      if (this.logger.debugMode) {
        const debugImage = await createDebugImage(
          previous,
          current,
          await sharp(diffBuffer, {
            raw: {
              width: maxWidth,
              height: maxHeight,
              channels: channels,
            },
          }).png().toBuffer(),
          this.logger
        );

        this.logger.debug('Comparison results', {
          diffPixels,
          diffPercentage,
          totalPixels,
          debugImage,
        });
      } else {
        this.logger.debug('Comparison results', {
          diffPixels,
          diffPercentage,
          totalPixels,
        });
      }

      return {
        hasChanges: diffPixels >= this.settings.minChangedPixels,
        differences: {
          diffPixels,
          diffPercentage,
          totalPixels,
        },
      };
    } catch (error) {
      this.logger.error('Image comparison failed', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }

  setThreshold(threshold) {
    this.logger.debug('Updating comparison threshold', {
      previous: this.settings.threshold,
      new: threshold,
    });
    this.settings.threshold = threshold;
  }

  setMinChangedPixels(pixels) {
    this.logger.debug('Updating minimum changed pixels', {
      previous: this.settings.minChangedPixels,
      new: pixels,
    });
    this.settings.minChangedPixels = pixels;
  }
}