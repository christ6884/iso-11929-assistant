import { Point } from '../types';

/**
 * Calculates the Full Width at Half Maximum (FWHM) for a given peak.
 * @param peakChannel The channel number (x-coordinate) of the peak maximum.
 * @param spectrumData The full spectrum data, where y is counts.
 * @param slope The calibration slope (e.g., keV/channel) to convert FWHM in channels to energy units.
 * @returns The FWHM in energy units (e.g., keV), or null if it cannot be calculated.
 */
export function calculateFWHM(
  peakChannel: number,
  spectrumData: Point[],
  slope: number
): number | null {
  if (spectrumData.length === 0 || !isFinite(slope) || Math.abs(slope) < 1e-9) {
    return null;
  }

  // Find the point corresponding to the peak channel. Need to handle non-integer channels.
  const peakIndex = spectrumData.findIndex(p => p.x >= peakChannel);
  if (peakIndex === -1) return null;
  
  // Simple approach: find the peak point by max y value around the given channel
  let peakPoint = spectrumData[peakIndex];
  // Look in a small window around the provided channel for the true maximum
  const searchWindow = 5;
  let localMaxY = -Infinity;
  let localMaxIndex = -1;
  for(let i = Math.max(0, peakIndex - searchWindow); i < Math.min(spectrumData.length, peakIndex + searchWindow); i++) {
    if(spectrumData[i] && spectrumData[i].y > localMaxY) {
      localMaxY = spectrumData[i].y;
      localMaxIndex = i;
    }
  }

  if (localMaxIndex !== -1) {
    peakPoint = spectrumData[localMaxIndex];
  } else {
    return null; // No peak found near this channel
  }
  
  const peakY = peakPoint.y;

  // Estimate baseline by looking at the minimum on either side of the peak
  const baselineWindow = Math.min(Math.round(peakPoint.x), spectrumData.length - Math.round(peakPoint.x) - 1, 50);
  const leftSlice = spectrumData.slice(Math.max(0, Math.round(peakPoint.x) - baselineWindow), Math.round(peakPoint.x));
  const rightSlice = spectrumData.slice(Math.round(peakPoint.x) + 1, Math.min(spectrumData.length, Math.round(peakPoint.x) + baselineWindow + 1));
  
  const leftMin = leftSlice.length > 0 ? Math.min(...leftSlice.map(p => p.y)) : peakY;
  const rightMin = rightSlice.length > 0 ? Math.min(...rightSlice.map(p => p.y)) : peakY;
  
  const baseline = (leftMin + rightMin) / 2;
  
  const halfMax = baseline + (peakY - baseline) / 2;

  // Find left and right points where the curve crosses the half-maximum.
  let leftX: number | null = null;
  let rightX: number | null = null;

  // Search left from the peak
  for (let i = Math.round(peakPoint.x); i > 0; i--) {
    const currentPoint = spectrumData[i];
    const prevPoint = spectrumData[i - 1];
    if (currentPoint && prevPoint && currentPoint.y >= halfMax && prevPoint.y < halfMax) {
      // Linear interpolation
      leftX = prevPoint.x + (halfMax - prevPoint.y) * (currentPoint.x - prevPoint.x) / (currentPoint.y - prevPoint.y);
      break;
    }
  }

  // Search right from the peak
  for (let i = Math.round(peakPoint.x); i < spectrumData.length - 1; i++) {
    const currentPoint = spectrumData[i];
    const nextPoint = spectrumData[i + 1];
    if (currentPoint && nextPoint && currentPoint.y >= halfMax && nextPoint.y < halfMax) {
      // Linear interpolation
      rightX = currentPoint.x + (halfMax - currentPoint.y) * (nextPoint.x - currentPoint.x) / (nextPoint.y - currentPoint.y);
      break;
    }
  }

  if (leftX !== null && rightX !== null) {
    const fwhmInChannels = rightX - leftX;
    return Math.abs(fwhmInChannels * slope);
  }

  return null;
}
