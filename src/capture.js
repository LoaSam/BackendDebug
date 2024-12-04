import screenshot from 'screenshot-desktop';
import sharp from 'sharp';
import { getCurrentEnvironment, ENVIRONMENTS, DEFAULT_SETTINGS } from './config/settings.js';
import { getImageMetadata, adjustRegionToScreen, validateImageBuffer } from './utils/imageUtils.js';
import { createSafeLogger } from './utils/loggerUtils.js';

export class ScreenCapture {
  constructor(logger = null) {
    this.region = DEFAULT_SETTINGS.region;
    this.fallbackRegion = DEFAULT_SETTINGS.fallbackRegion;
    this.mockMode = getCurrentEnvironment() !== ENVIRONMENTS.PRODUCTION;
    this.counter = 0;
    this.mockSettings = DEFAULT_SETTINGS;
    this.logger = createSafeLogger(logger);
    this.screenDimensions = null;
  }

  async takeScreenshot() {
    try {
      this.logger.debug('Starting screenshot capture', {
        mode: this.mockMode ? 'mock' : 'production',
        region: this.region,
        counter: this.counter
      });

      let screenshotBuffer;
      
      if (this.mockMode) {
        screenshotBuffer = await this.generateMockScreenshot();
      } else {
        this.logger.debug('Capturing full screenshot');
        screenshotBuffer = await screenshot({ format: 'png' });
      }

      // Validate buffer before processing
      await validateImageBuffer(screenshotBuffer, this.logger);

      const metadata = await getImageMetadata(screenshotBuffer, this.logger);
      this.logger.debug('Screenshot captured', { metadata });

      if (!this.screenDimensions) {
        this.screenDimensions = {
          width: metadata.width,
          height: metadata.height
        };
      }

      const { region: adjustedRegion, wasAdjusted } = 
        await adjustRegionToScreen(this.region, this.screenDimensions, this.logger);

      if (wasAdjusted) {
        this.logger.warn('Region was adjusted', {
          original: this.region,
          adjusted: adjustedRegion
        });
        this.region = adjustedRegion;
      }

      // Convert to PNG before extraction to ensure format consistency
      const pngBuffer = await sharp(screenshotBuffer)
        .png()
        .toBuffer();

      const croppedBuffer = await sharp(pngBuffer, {
        failOnError: false,
        limitInputPixels: false
      })
        .extract({
          left: adjustedRegion.x,
          top: adjustedRegion.y,
          width: adjustedRegion.width,
          height: adjustedRegion.height
        })
        .png()
        .toBuffer();

      const croppedMetadata = await getImageMetadata(croppedBuffer, this.logger);
      this.logger.debug('Region extracted successfully', { 
        metadata: croppedMetadata,
        regionDimensions: adjustedRegion
      });

      return croppedBuffer;
    } catch (error) {
      this.logger.error('Screenshot capture failed', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code
        },
        context: {
          region: this.region,
          screenDimensions: this.screenDimensions,
          mode: this.mockMode ? 'mock' : 'production'
        }
      });
      throw error;
    }
  }

  async generateMockScreenshot() {
    try {
      this.logger.debug('Generating mock screenshot', {
        counter: this.counter,
        mockSettings: this.mockSettings
      });

      const width = 1920;
      const height = 1080;
      const shouldChange = this.counter % this.mockSettings.mockChangeInterval === 0;

      // Create a solid background
      const image = await sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
        .png()
        .toBuffer();

      // Add visual elements if change is needed
      if (shouldChange) {
        const overlay = await sharp({
          create: {
            width,
            height,
            channels: 3,
            background: { r: 0, g: 0, b: 0 }
          }
        })
          .composite([{
            input: Buffer.from(`<svg>
              <rect x="${Math.random() * width}" y="${Math.random() * height}"
                    width="100" height="100" fill="rgb(255,0,0)"/>
            </svg>`),
            top: 0,
            left: 0
          }])
          .png()
          .toBuffer();

        return overlay;
      }

      this.counter++;
      return image;
    } catch (error) {
      this.logger.error('Mock screenshot generation failed', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        context: {
          counter: this.counter,
          mockSettings: this.mockSettings
        }
      });
      throw error;
    }
  }

  setRegion(region) {
    this.logger.debug('Setting new region', {
      previous: this.region,
      new: region
    });
    this.region = region;
  }
}