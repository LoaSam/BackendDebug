# Screen Monitor

A Node.js application that monitors screen changes in a specified region.

## Features

- Screenshot capture of specific screen regions
- Image comparison to detect changes
- Desktop notifications for detected changes
- Configurable monitoring intervals and sensitivity
- Automatic fallback to safe region if specified region is invalid

## Configuration

The monitor is configured to watch the following screen region by default:
- X: 725 pixels from left
- Y: 243 pixels from top
- Width: 593 pixels
- Height: 736 pixels

You can modify these settings in `src/config/settings.js`.

## Development Mode

The application runs in development mode by default, using a mock screenshot implementation that generates synthetic images for testing. This allows you to develop and test the application without requiring system-level screenshot capabilities.

```bash
npm run start
```

## Production Mode

To run in production mode with actual screenshot capabilities:

1. Install system dependencies (Linux):
   ```bash
   sudo apt-get install xrandr
   ```

2. Run with production environment:
   ```bash
   NODE_ENV=production npm run start
   ```

## Configuration Options

Edit `src/config/settings.js` to modify:
- Screen region coordinates and dimensions
- Monitoring interval
- Change detection threshold
- Mock environment settings
- Image processing options

## Error Handling

The application includes robust error handling:
- Validates screen regions against actual screen dimensions
- Falls back to safe default region if specified region is invalid
- Detailed logging of all operations and errors
- Debug image generation for visual verification