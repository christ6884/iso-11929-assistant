import { ParsedN42Data, N42Spectrum, N42Metadata } from '../types';

function parseDuration(isoDuration: string | null): string {
  if (!isoDuration) return 'N/A';
  // More robust ISO 8601 duration parsing for PT...S format
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d{1,9})?)S)?/;
  const matches = isoDuration.match(regex);
  if (!matches) return isoDuration;
  
  const hours = parseFloat(matches[1] || '0');
  const minutes = parseFloat(matches[2] || '0');
  const seconds = parseFloat(matches[3] || '0');
  
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return `${totalSeconds.toFixed(2)} s`;
}

export async function parseN42File(file: File, t: (key: string) => string): Promise<ParsedN42Data> {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");

    // Check for XML parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error(`XML Parsing Error: ${parserError.textContent}`);
    }

    // Root element can be RadInstrumentData
    const instrument = xmlDoc.querySelector('RadInstrumentInformation RadInstrumentModelName, InstrumentInformation InstrumentModelName');
    const measurement = xmlDoc.querySelector('RadMeasurement, Measurement');
    const timestamp = measurement?.querySelector('StartDateTime');
    // Overall RealTime from measurement block, LiveTime will be per-spectrum
    const realTime = measurement?.querySelector('RealTimeDuration');

    const metadata: N42Metadata = {
        instrument: instrument?.textContent || 'Unknown',
        timestamp: timestamp?.textContent ? new Date(timestamp.textContent).toLocaleString() : 'N/A',
        liveTime: 'N/A', // Will be set from the first spectrum as a default
        realTime: parseDuration(realTime?.textContent || null),
    };

    const spectrumElements = xmlDoc.querySelectorAll('RadMeasurement Spectrum, Measurement Spectrum');
    const spectra: N42Spectrum[] = [];

    if (spectrumElements.length === 0) {
      throw new Error('No <Spectrum> tags found inside <RadMeasurement> or <Measurement>.');
    }

    spectrumElements.forEach((specEl, index) => {
        try {
            const channelDataEl = specEl.querySelector('ChannelData');
            if (!channelDataEl) return;

            const channelData = channelDataEl.textContent?.trim().split(/\s+/).map(Number);
            if (!channelData || channelData.some(isNaN)) return;
            
            // --- Find Calibration data (either inline or by reference) ---
            let calibration = specEl.querySelector('EnergyCalibration');
            if (!calibration) {
                const calibRef = specEl.getAttribute('energyCalibrationReference');
                if (calibRef) {
                    // Use a query that finds the element by its id attribute
                    calibration = xmlDoc.querySelector(`EnergyCalibration[id="${calibRef}"]`);
                }
            }
            if (!calibration) return; // Cannot proceed without calibration

            const coeffs = calibration.querySelector('Coefficients, CoefficientValues')?.textContent?.trim().split(/\s+/).map(Number);
            if (!coeffs || coeffs.length < 2) return;
            
            // --- Determine a descriptive ID for the spectrum ---
            const remark = calibration.querySelector('Remark')?.textContent;
            const description = specEl.querySelector('SpectrumDescription')?.textContent;
            const idAttr = specEl.getAttribute('id');
            const specId = remark || description || idAttr || `${t('spectrum')} ${index + 1}`;
            
            // Per-spectrum live time is more accurate
            const liveTimeEl = specEl.querySelector('LiveTimeDuration');
            if (index === 0) { // Use the first spectrum's live time for the overall metadata display
                metadata.liveTime = parseDuration(liveTimeEl?.textContent || null);
            }

            spectra.push({
                id: specId,
                channelData,
                calibration: {
                    a: coeffs[0] || 0, // Intercept
                    b: coeffs[1] || 0, // Slope
                    c: coeffs[2] || 0, // Quadratic
                }
            });

        } catch (e) {
            console.warn("Could not parse a spectrum block:", e);
        }
    });
    
    if (spectra.length === 0) {
      throw new Error('Could not parse any valid spectra from the file.');
    }

    return { metadata, spectra };
}