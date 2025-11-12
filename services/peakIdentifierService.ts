import { PeakIdentificationResult, PeakIdentificationMatch } from '../types.ts';
import { nuclideLibrary } from './gammaLibrary.ts';

export function identifyPeaks(
  peakEnergies: number[],
  tolerance_keV: number,
  analysisType: 'gamma' | 'alpha'
): PeakIdentificationResult[] {
  const results: PeakIdentificationResult[] = [];

  for (const inputEnergy of peakEnergies) {
    if (isNaN(inputEnergy) || inputEnergy <= 0) continue;

    const matches: PeakIdentificationMatch[] = [];
    const lowerBound = inputEnergy - tolerance_keV;
    const upperBound = inputEnergy + tolerance_keV;

    for (const nuclide of nuclideLibrary) {
      const relevantLines = nuclide.lines.filter(line => line.type === analysisType);
      for (const line of relevantLines) {
        if (line.energy_keV >= lowerBound && line.energy_keV <= upperBound) {
          matches.push({
            nuclide: nuclide,
            line: line,
            delta_keV: line.energy_keV - inputEnergy,
          });
        }
      }
    }

    // Sort matches by the absolute difference in energy (closest match first)
    matches.sort((a, b) => Math.abs(a.delta_keV) - Math.abs(b.delta_keV));

    results.push({
      inputEnergy_keV: inputEnergy,
      matches: matches,
    });
  }

  return results;
}