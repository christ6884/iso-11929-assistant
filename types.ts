// Enums
export enum Language {
    FR = 'fr',
    EN = 'en',
    DE = 'de',
    ES = 'es',
}

export type View = 'calculator' | 'spectro' | 'sources' | 'history';

export type AnalysisMode = 'standard' | 'spectrometry' | 'surface' | 'chambre' | 'linge';

export enum CountUnit {
    COUNTS = 'COUNTS',
    CPS = 'CPS',
    CPM = 'CPM',
    C_02S = 'C_02S',
}

export enum TargetUnit {
    BQ = 'Bq',
    BQ_CM2 = 'Bq/cm²',
    DPM = 'dpm',
    DPM_CM2 = 'dpm/cm²',
    UCI = 'µCi',
    UCI_CM2 = 'µCi/cm²',
}

export type DetectionLimitMode = 'calculate' | 'target';


// Data structures
export interface Detector {
    efficiency: number;
    background: number;
    backgroundUnit: CountUnit;
    type: 'beta' | 'gamma';
    length: number;
    width: number;
    enabled: boolean;
}

export interface Inputs {
    grossCount: number;
    grossCountUnit: CountUnit;
    grossTime: number;
    backgroundCount: number;
    backgroundCountUnit: CountUnit;
    backgroundTime: number;
    roiGrossCount: number;
    roiChannels: number;
    backgroundTotalCount: number;
    backgroundChannels: number;
    probeEfficiency: number;
    probeArea: number;
    estimatedBackgroundRate: number;
    targetValue: number;
    targetUnit: TargetUnit;
    conveyorSpeed: number;
    conveyorSpeedUnit: string;
    chamberLength: number;
    chamberWidth: number;
    chamberHeight: number;
    detectors: Detector[];
    chambreLingeTime: number;
    chambreLingeTarget: number;
    chambreLingeTargetUnit: TargetUnit;
    calibrationFactor: number;
    calibrationFactorUnit: string;
    calibrationFactorUncertainty: number;
    k1alpha: number;
    k1beta: number;
    correlationCoefficient: number;
    monteCarloMode: boolean;
    useBayesianMode: boolean;
    numSimulations: number;
}

export interface MeanTime {
    years: number;
    months: number;
    days: number;
    hours: number;
}

export interface Results {
    calculationMethod: 'analytical' | 'monteCarlo' | 'bayesian';
    currentMode: AnalysisMode;
    primaryResult: number;
    primaryUncertainty: number;
    decisionThreshold: number | string;
    detectionLimit: number | string;
    isEffectPresent: boolean;
    bestEstimate: number | null;
    bestEstimateUncertainty: number | null;
    confidenceIntervalLower: number | null;
    confidenceIntervalUpper: number | null;
    k1alpha: number;
    k1beta: number;
    alphaProbability: number;
    betaProbability: number;
    probabilityEffectPresent?: number;
    meanTimeBetweenFalseAlarms: MeanTime;
    uncertaintyAtZero: number;
    uncertaintyAtDetectionLimit: number;
    varianceComponents: {
        grossCount: number;
        backgroundCount: number;
        calibrationFactor: number;
        covariance: number;
        total: number;
    } | null;
    histogramData?: number[];
    numSimulations?: number;
    monteCarloStats?: {
        mean: number;
        stdDev: number;
        median: number;
        min: number;
        max: number;
        skewness: number;
        kurtosis: number;
        confidenceIntervalPercentileLower: number;
        confidenceIntervalPercentileUpper: number;
    };
}

// For Spectrum Analyzer
export interface Point {
    x: number;
    y: number;
}

export interface CalibrationPoint extends Point {
    energy: number;
    uncertainty?: number;
}

export interface CalibrationFunction {
    slope: number;
    intercept: number;
    rSquared?: number;
}

export interface DetectedPeak extends Point {
    energy: number;
    manual?: boolean;
    fwhm_keV?: number;
    group?: 'A' | 'B';
}

export interface AnalysisResult {
    detectedPeaks: DetectedPeak[];
    nuclideMatches: Map<number, PeakIdentificationMatch[]>;
}

export interface InteractivePeak {
    point: Point;
    eventCoords: Point;
    topMatch: PeakIdentificationMatch | null;
}

// For Gamma Library & Peak Identifier
export interface EmissionLine {
    energy_keV: number;
    intensity_percent: number;
    type: 'gamma' | 'alpha' | 'beta';
}

export interface NuclideData {
    name: string;
    halfLife_s: number;
    lines: EmissionLine[];
}

export interface PeakIdentificationMatch {
    nuclide: NuclideData;
    line: EmissionLine;
    delta_keV: number;
}

export interface PeakIdentificationResult {
    inputEnergy_keV: number;
    matches: PeakIdentificationMatch[];
}


// For Source Management
export interface Source {
    id: string;
    name: string;
    location?: string;
    casier?: string;
    nuclide: string;
    referenceActivity: number;
    referenceActivityUncertainty: number;
    referenceDate: string;
    certificateNumber?: string;
    type?: string;
}

export interface SourceType {
    key: string;
    description: string;
    nuclide: string;
    minActivityBq: number;
    maxActivityBq: number;
}


// For N42 Analyzer
export interface N42Metadata {
    instrument: string;
    timestamp: string;
    realTime: string;
    realTimeSeconds?: number;
}

export interface N42Spectrum {
    id: string;
    channelData: number[];
    calibration: {
        a: number;
        b: number;
        c: number;
    };
    liveTimeSeconds?: number;
}

export interface ParsedN42Data {
    metadata: N42Metadata;
    spectra: N42Spectrum[];
}

export interface N42AnalysisResult {
    peaks: DetectedPeak[];
    nuclideMatches: Map<number, PeakIdentificationMatch[]>;
}

export interface ROI {
    startChannel: number;
    endChannel: number;
}

// For Analysis History / Lab Book
export interface N42AnalysisData {
  parsedData: ParsedN42Data;
  selectedSpectrumId: string;
  analysisResult: N42AnalysisResult;
}

export interface ImageAnalysisData {
  imageDataUrl: string;
  spectrumPoints: Point[];
  calibrationPoints: CalibrationPoint[];
  calibrationFunction: CalibrationFunction;
  analysisResult: AnalysisResult;
}

// Fix: Changed AnalysisRecord to a discriminated union type to allow for proper type narrowing based on analysisType.
export type AnalysisRecord =
  | {
      id: string;
      name: string;
      date: string; // ISO string
      sourceId?: string;
      analysisType: 'n42';
      data: N42AnalysisData;
    }
  | {
      id: string;
      name: string;
      date: string;
      sourceId?: string;
      analysisType: 'image';
      data: ImageAnalysisData;
    };