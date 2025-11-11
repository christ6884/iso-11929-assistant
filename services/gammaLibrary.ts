// Fix: Corrected import path
import { NuclideData } from '../types';

// A curated and expanded library of common radionuclides and their most prominent emission lines.
// Data primarily sourced from BIPM Monographie 5, "Table of Radionuclides".
// Half-life conversion: 1 year = 31556926 seconds, 1 day = 86400 seconds.

const year = 31556926;
const day = 86400;
const hour = 3600;
const minute = 60;

export const nuclideLibrary: NuclideData[] = [
  // =======================================================================
  // I. COMMON CALIBRATION & CHECK SOURCES
  // =======================================================================
  {
    name: 'Americium-241 (Am-241)',
    halfLife_s: 432.2 * year,
    lines: [
      { energy_keV: 26.3, intensity_percent: 2.4, type: 'gamma' },
      { energy_keV: 59.54, intensity_percent: 35.9, type: 'gamma' },
      { energy_keV: 5485.6, intensity_percent: 84.8, type: 'alpha' },
      { energy_keV: 5442.8, intensity_percent: 13.1, type: 'alpha' },
      { energy_keV: 5544.5, intensity_percent: 0.37, type: 'alpha' },
    ],
  },
  {
    name: 'Barium-133 (Ba-133)',
    halfLife_s: 10.540 * year,
    lines: [
      { energy_keV: 53.1622, intensity_percent: 2.14, type: 'gamma' },
      { energy_keV: 80.9979, intensity_percent: 32.9, type: 'gamma' },
      { energy_keV: 160.6121, intensity_percent: 0.638, type: 'gamma' },
      { energy_keV: 276.3992, intensity_percent: 7.16, type: 'gamma' },
      { energy_keV: 302.8512, intensity_percent: 18.34, type: 'gamma' },
      { energy_keV: 356.0134, intensity_percent: 62.05, type: 'gamma' },
      { energy_keV: 383.8491, intensity_percent: 8.94, type: 'gamma' },
    ],
  },
  {
    name: 'Cadmium-109 (Cd-109)',
    halfLife_s: 461.4 * day,
    lines: [
      { energy_keV: 88.0337, intensity_percent: 3.626, type: 'gamma' },
    ],
  },
  {
    name: 'Cesium-137 (Cs-137)',
    halfLife_s: 30.05 * year,
    lines: [
      { energy_keV: 661.657, intensity_percent: 84.99, type: 'gamma' },
    ],
  },
  {
    name: 'Cobalt-57 (Co-57)',
    halfLife_s: 271.80 * day,
    lines: [
      { energy_keV: 122.0607, intensity_percent: 85.51, type: 'gamma' },
      { energy_keV: 136.4736, intensity_percent: 10.71, type: 'gamma' },
      { energy_keV: 692.01, intensity_percent: 0.159, type: 'gamma' },
    ],
  },
  {
    name: 'Cobalt-60 (Co-60)',
    halfLife_s: 5.2710 * year,
    lines: [
      { energy_keV: 1173.228, intensity_percent: 99.85, type: 'gamma' },
      { energy_keV: 1332.492, intensity_percent: 99.9826, type: 'gamma' },
    ],
  },
  {
    name: 'Europium-152 (Eu-152)',
    halfLife_s: 13.537 * year,
    lines: [
      { energy_keV: 121.78, intensity_percent: 28.53, type: 'gamma' },
      { energy_keV: 244.7, intensity_percent: 7.55, type: 'gamma' },
      { energy_keV: 344.28, intensity_percent: 26.5, type: 'gamma' },
      { energy_keV: 778.9, intensity_percent: 12.93, type: 'gamma' },
      { energy_keV: 964.08, intensity_percent: 14.51, type: 'gamma' },
      { energy_keV: 1085.87, intensity_percent: 10.11, type: 'gamma' },
      { energy_keV: 1112.07, intensity_percent: 13.62, type: 'gamma' },
      { energy_keV: 1408.01, intensity_percent: 20.87, type: 'gamma' },
    ],
  },
  {
    name: 'Manganese-54 (Mn-54)',
    halfLife_s: 312.13 * day,
    lines: [
      { energy_keV: 834.838, intensity_percent: 99.9746, type: 'gamma' },
    ],
  },
  {
    name: 'Sodium-22 (Na-22)',
    halfLife_s: 2.6027 * year,
    lines: [
      { energy_keV: 511.0, intensity_percent: 180.62, type: 'gamma' }, // Annihilation
      { energy_keV: 1274.537, intensity_percent: 99.94, type: 'gamma' },
    ],
  },
  {
    name: 'Yttrium-88 (Y-88)',
    halfLife_s: 106.626 * day,
    lines: [
      { energy_keV: 898.036, intensity_percent: 93.90, type: 'gamma' },
      { energy_keV: 1836.052, intensity_percent: 99.32, type: 'gamma' },
    ],
  },

  // =======================================================================
  // II. NATURAL DECAY SERIES & ENVIRONMENTAL
  // =======================================================================
  {
    name: 'Beryllium-7 (Be-7)',
    halfLife_s: 53.22 * day,
    lines: [
      { energy_keV: 477.6035, intensity_percent: 10.44, type: 'gamma' },
    ],
  },
  {
    name: 'Potassium-40 (K-40)',
    halfLife_s: 1.251e9 * year,
    lines: [
      { energy_keV: 1460.8, intensity_percent: 10.66, type: 'gamma' },
    ],
  },
  {
    name: 'Lead-212 (Pb-212)',
    halfLife_s: 10.64 * hour,
    lines: [
        { energy_keV: 238.632, intensity_percent: 43.6, type: 'gamma' },
        { energy_keV: 300.09, intensity_percent: 3.18, type: 'gamma' },
    ],
  },
  {
    name: 'Bismuth-212 (Bi-212)',
    halfLife_s: 60.55 * minute,
    lines: [
        { energy_keV: 727.33, intensity_percent: 6.74, type: 'gamma' },
        { energy_keV: 1620.74, intensity_percent: 1.51, type: 'gamma' },
    ],
  },
  {
    name: 'Thallium-208 (Tl-208)',
    halfLife_s: 3.060 * minute,
    lines: [
        { energy_keV: 583.187, intensity_percent: 85.0, type: 'gamma' },
        { energy_keV: 2614.511, intensity_percent: 99.79, type: 'gamma' },
    ],
  },
  {
    name: 'Radium-226 (Ra-226 series)',
    halfLife_s: 1600 * year,
    lines: [
      { energy_keV: 186.2, intensity_percent: 3.59, type: 'gamma' }, // Ra-226
      { energy_keV: 242.0, intensity_percent: 7.43, type: 'gamma' }, // Pb-214
      { energy_keV: 295.2, intensity_percent: 19.2, type: 'gamma' }, // Pb-214
      { energy_keV: 351.9, intensity_percent: 37.1, type: 'gamma' }, // Pb-214
      { energy_keV: 609.3, intensity_percent: 46.1, type: 'gamma' }, // Bi-214
      { energy_keV: 1120.3, intensity_percent: 15.1, type: 'gamma' }, // Bi-214
      { energy_keV: 1764.5, intensity_percent: 15.8, type: 'gamma' }, // Bi-214
      { energy_keV: 4784.3, intensity_percent: 94.45, type: 'alpha' },
    ],
  },

  // =======================================================================
  // III. FISSION & ACTIVATION PRODUCTS (Industrial, NPP, Fallout)
  // =======================================================================
  {
    name: 'Cobalt-56 (Co-56)',
    halfLife_s: 77.236 * day,
    lines: [
        { energy_keV: 511.0, intensity_percent: 39.21, type: 'gamma' },
        { energy_keV: 846.7638, intensity_percent: 99.9399, type: 'gamma' },
        { energy_keV: 1037.8333, intensity_percent: 14.03, type: 'gamma' },
        { energy_keV: 1238.2736, intensity_percent: 66.41, type: 'gamma' },
        { energy_keV: 1771.327, intensity_percent: 15.45, type: 'gamma' },
        { energy_keV: 2034.752, intensity_percent: 7.741, type: 'gamma' },
        { energy_keV: 2598.438, intensity_percent: 16.96, type: 'gamma' },
        { energy_keV: 3201.930, intensity_percent: 3.203, type: 'gamma' },
        { energy_keV: 3253.402, intensity_percent: 7.87, type: 'gamma' },
    ],
  },
  {
    name: 'Iodine-131 (I-131)',
    halfLife_s: 8.0233 * day,
    lines: [
      { energy_keV: 80.1850, intensity_percent: 2.607, type: 'gamma' },
      { energy_keV: 284.305, intensity_percent: 6.06, type: 'gamma' },
      { energy_keV: 364.489, intensity_percent: 81.5, type: 'gamma' },
      { energy_keV: 636.989, intensity_percent: 7.26, type: 'gamma' },
    ],
  },
  {
    name: 'Molybdenum-99 (Mo-99)',
    halfLife_s: 2.7479 * day,
    lines: [
        { energy_keV: 140.511, intensity_percent: 89.6, type: 'gamma' }, // includes Tc-99m daughter
        { energy_keV: 181.068, intensity_percent: 6.01, type: 'gamma' },
        { energy_keV: 739.500, intensity_percent: 12.12, type: 'gamma' },
        { energy_keV: 777.924, intensity_percent: 4.28, type: 'gamma' },
    ],
  },
  {
    name: 'Samarium-153 (Sm-153)',
    halfLife_s: 1.92849 * day,
    lines: [
        { energy_keV: 69.67300, intensity_percent: 4.691, type: 'gamma' },
        { energy_keV: 103.18012, intensity_percent: 29.19, type: 'gamma' },
    ],
  },
  {
    name: 'Technetium-99m (Tc-99m)',
    halfLife_s: 6.0067 * hour,
    lines: [
      { energy_keV: 140.511, intensity_percent: 88.5, type: 'gamma' },
    ],
  },
  {
    name: 'Zinc-65 (Zn-65)',
    halfLife_s: 244.01 * day,
    lines: [
        { energy_keV: 511.0, intensity_percent: 2.842, type: 'gamma' }, // Annihilation
        { energy_keV: 1115.539, intensity_percent: 50.22, type: 'gamma' },
    ],
  },
  
  // =======================================================================
  // IV. MEDICAL & RESEARCH ISOTOPES
  // =======================================================================
  {
    name: 'Fluorine-18 (F-18)',
    halfLife_s: 1.8288 * hour,
    lines: [
        { energy_keV: 511.0, intensity_percent: 193.72, type: 'gamma' }, // Annihilation
    ],
  },
  {
    name: 'Gallium-67 (Ga-67)',
    halfLife_s: 3.2613 * day,
    lines: [
        { energy_keV: 93.310, intensity_percent: 37.8, type: 'gamma' },
        { energy_keV: 184.576, intensity_percent: 20.9, type: 'gamma' },
        { energy_keV: 300.217, intensity_percent: 16.8, type: 'gamma' },
        { energy_keV: 393.527, intensity_percent: 4.66, type: 'gamma' },
    ],
  },
  {
    name: 'Indium-111 (In-111)',
    halfLife_s: 2.8049 * day,
    lines: [
      { energy_keV: 171.28, intensity_percent: 90.61, type: 'gamma' },
      { energy_keV: 245.35, intensity_percent: 94.12, type: 'gamma' },
    ],
  },
  {
    name: 'Iodine-123 (I-123)',
    halfLife_s: 13.2234 * hour,
    lines: [
        { energy_keV: 158.97, intensity_percent: 83.25, type: 'gamma' },
    ],
  },
  {
    name: 'Thallium-201 (Tl-201)',
    halfLife_s: 3.04 * day,
    lines: [
        { energy_keV: 135.3, intensity_percent: 2.65, type: 'gamma' },
        { energy_keV: 167.4, intensity_percent: 10.0, type: 'gamma' },
    ],
  },
  {
    name: 'Xenon-133 (Xe-133)',
    halfLife_s: 5.243 * day,
    lines: [
      { energy_keV: 81.0, intensity_percent: 38.0, type: 'gamma' },
    ],
  },

  // =======================================================================
  // V. PURE BETA EMITTERS (for Decay Calculator)
  // =======================================================================
  {
    name: 'Carbon-14 (C-14)',
    halfLife_s: 5730 * year,
    lines: [],
  },
  {
    name: 'Tritium (H-3)',
    halfLife_s: 12.312 * year,
    lines: [],
  },
  {
    name: 'Nickel-63 (Ni-63)',
    halfLife_s: 98.7 * year,
    lines: [],
  },
  {
    name: 'Phosphorus-32 (P-32)',
    halfLife_s: 14.284 * day,
    lines: [],
  },
  {
    name: 'Phosphorus-33 (P-33)',
    halfLife_s: 25.383 * day,
    lines: [],
  },
  {
    name: 'Strontium-90 (Sr-90)',
    halfLife_s: 28.80 * year,
    lines: [],
  },
  {
    name: 'Sulfur-35 (S-35)',
    halfLife_s: 87.51 * day,
    lines: [],
  },
  {
    name: 'Yttrium-90 (Y-90)',
    halfLife_s: 2.6684 * day,
    lines: [
        { energy_keV: 2186.254, intensity_percent: 0.0000014, type: 'gamma' }, // Very weak, but present
    ],
  },
  
  // =======================================================================
  // VI. COMMON ALPHA EMITTERS
  // =======================================================================
  {
    name: 'Plutonium-238 (Pu-238)',
    halfLife_s: 87.7 * year,
    lines: [
      { energy_keV: 43.5, intensity_percent: 0.038, type: 'gamma' },
      { energy_keV: 99.8, intensity_percent: 0.0074, type: 'gamma' },
      { energy_keV: 5499.0, intensity_percent: 70.9, type: 'alpha' },
      { energy_keV: 5456.3, intensity_percent: 29.0, type: 'alpha' },
    ],
  },
  {
    name: 'Plutonium-239 (Pu-239)',
    halfLife_s: 24110 * year,
    lines: [
      { energy_keV: 51.6, intensity_percent: 0.02, type: 'gamma' },
      { energy_keV: 129.3, intensity_percent: 0.0063, type: 'gamma' },
      { energy_keV: 5156.6, intensity_percent: 73.3, type: 'alpha' },
      { energy_keV: 5143.7, intensity_percent: 15.1, type: 'alpha' },
      { energy_keV: 5105.5, intensity_percent: 11.5, type: 'alpha' },
    ],
  },
  {
    name: 'Uranium-238 (U-238)',
    halfLife_s: 4.468e9 * year,
    lines: [
      { energy_keV: 4198, intensity_percent: 77, type: 'alpha' },
      { energy_keV: 4151, intensity_percent: 23, type: 'alpha' },
    ],
  },
  {
    name: 'Polonium-210 (Po-210)',
    halfLife_s: 138.376 * day,
    lines: [
      { energy_keV: 803.1, intensity_percent: 0.0012, type: 'gamma' },
      { energy_keV: 5304.3, intensity_percent: 99.99, type: 'alpha' },
    ],
  },
];