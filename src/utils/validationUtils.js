export function validateImageDimensions(width, height) {
  if (!Number.isInteger(width) || width <= 0) {
    throw new Error(`Invalid image width: ${width}. Must be a positive integer.`);
  }
  
  if (!Number.isInteger(height) || height <= 0) {
    throw new Error(`Invalid image height: ${height}. Must be a positive integer.`);
  }

  return true;
}

export function validateRegionBounds(region, screenDimensions) {
  const errors = [];

  if (region.x < 0) errors.push(`X coordinate (${region.x}) must be non-negative`);
  if (region.y < 0) errors.push(`Y coordinate (${region.y}) must be non-negative`);
  
  if (region.width <= 0) errors.push(`Width (${region.width}) must be positive`);
  if (region.height <= 0) errors.push(`Height (${region.height}) must be positive`);
  
  if (region.x + region.width > screenDimensions.width) {
    errors.push(`Region width (${region.width}) at x=${region.x} exceeds screen width (${screenDimensions.width})`);
  }
  
  if (region.y + region.height > screenDimensions.height) {
    errors.push(`Region height (${region.height}) at y=${region.y} exceeds screen height (${screenDimensions.height})`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid region bounds:\n${errors.join('\n')}`);
  }

  return true;
}