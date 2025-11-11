// services/spectrumAnalyzerService.ts

import { Point, AnalysisResult, DetectedPeak } from '../types';

// Helper to get image data from a data URL
async function getImageData(imageDataUrl: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Could not get canvas context"));
            }
            ctx.drawImage(image, 0, 0);
            resolve(ctx.getImageData(0, 0, image.width, image.height));
        };
        image.onerror = () => reject(new Error("invalidImageFormat"));
        image.src = imageDataUrl;
    });
}

// Heuristic to find the dominant color of the spectrum trace, ignoring background
function findTraceColor(imageData: ImageData): [number, number, number] {
    const colorCounts: { [key: string]: number } = {};
    const { data } = imageData;
    const ignoredColors = new Set(['0,0,0', '255,255,255']); // Ignore pure black and white

    // Sample a subset of pixels for performance
    const step = 4 * 5; // Check every 5th pixel
    for (let i = 0; i < data.length; i += step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        // Ignore very dark and very bright pixels (likely background/grid/text)
        if (brightness > 20 && brightness < 235) {
            const key = `${r},${g},${b}`;
            if (!ignoredColors.has(key)) {
               colorCounts[key] = (colorCounts[key] || 0) + 1;
            }
        }
    }
    
    if (Object.keys(colorCounts).length === 0) {
      // Fallback: try to find any non-black/white color if the first pass fails
      for (let i = 0; i < data.length; i += step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const key = `${r},${g},${b}`;
        if (!ignoredColors.has(key)) {
            colorCounts[key] = (colorCounts[key] || 0) + 1;
        }
      }
      if (Object.keys(colorCounts).length === 0) {
        throw new Error("noTraceFound");
      }
    }

    const dominantColor = Object.entries(colorCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return dominantColor.split(',').map(Number) as [number, number, number];
}

// Function to extract the curve points from the image data
function extractCurveFromImage(imageData: ImageData, traceColor: [number, number, number]): Point[] {
    const { data, width, height } = imageData;
    const curve: Point[] = [];
    const colorThreshold = 60; // Increased tolerance for color variations

    for (let x = 0; x < width; x++) {
        let y_coords: number[] = [];
        for (let y = 0; y < height; y++) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            const distance = Math.sqrt(
                Math.pow(r - traceColor[0], 2) +
                Math.pow(g - traceColor[1], 2) +
                Math.pow(b - traceColor[2], 2)
            );
            
            if (distance < colorThreshold) {
                y_coords.push(y);
            }
        }

        if (y_coords.length > 0) {
            const avgY = y_coords.reduce((sum, val) => sum + val, 0) / y_coords.length;
            curve.push({ x, y: avgY });
        }
    }

    if (curve.length < 10) { // Need a minimum number of points to be a valid curve
        throw new Error("curveExtractionFailed");
    }

    return curve;
}

// Basic peak finding algorithm
function findPeaks(curveData: Point[]): DetectedPeak[] {
    const peaks: DetectedPeak[] = [];
    if (curveData.length < 5) return peaks;
    
    // Use the inverted y-values since image coords are top-down
    const naturalHeight = Math.max(...curveData.map(p => p.y));
    const data = curveData.map(p => ({ x: p.x, y: naturalHeight - p.y }));

    // Calculate baseline stats for thresholding
    const yValues = data.map(p => p.y);
    const mean = yValues.reduce((a, b) => a + b) / yValues.length;
    const stdDev = Math.sqrt(yValues.map(y => Math.pow(y - mean, 2)).reduce((a, b) => a + b) / yValues.length);

    const prominence = stdDev * 1.5;
    const threshold = Math.max(mean, stdDev * 2.0); // Peaks must be significantly above noise
    
    for (let i = 2; i < data.length - 2; i++) {
        const p = data[i];
        
        // Is it a local maximum?
        if (p.y > threshold && p.y > data[i - 1].y && p.y >= data[i + 1].y && p.y > data[i - 2].y && p.y >= data[i + 2].y) {
            
            // Check prominence
            let leftMin = p.y;
            for (let j = i - 1; j >= 0 && i - j < 50; j--) { // Look back 50 points
                leftMin = Math.min(leftMin, data[j].y);
                if (data[j].y > p.y) break; // Stop if we go up again
            }
            
            let rightMin = p.y;
            for (let j = i + 1; j < data.length && j - i < 50; j++) { // Look forward 50 points
                rightMin = Math.min(rightMin, data[j].y);
                if (data[j].y > p.y) break; // Stop if we go up again
            }

            if (p.y - leftMin > prominence && p.y - rightMin > prominence) {
                // Find original point from curveData based on x
                const originalPoint = curveData.find(op => op.x === p.x);
                if (originalPoint) {
                    peaks.push({ ...originalPoint, energy: 0 }); // energy to be calculated later
                }
            }
        }
    }
    
    return peaks;
}

export async function analyzeSpectrum(
    imageDataUrl: string, 
    setStatus: (status: 'extracting' | 'detecting') => void
): Promise<{ curveData: Point[], analysisResult: AnalysisResult }> {
    
    setStatus('extracting');
    const imageData = await getImageData(imageDataUrl);
    const traceColor = findTraceColor(imageData);
    const curveData = extractCurveFromImage(imageData, traceColor);

    setStatus('detecting');
    const detectedPeaks = findPeaks(curveData);

    return {
        curveData,
        analysisResult: {
            detectedPeaks: detectedPeaks,
            nuclideMatches: new Map(),
        }
    };
}
