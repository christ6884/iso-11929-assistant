
import { NuclideData } from '../types.ts';

// A curated and expanded library of common radionuclides and their most prominent emission lines.
// Data sourced from BIPM Monographie 5, "Table of Radionuclides" (Vol 1 & 2), NNDC, and industry standards (CEA/EDF).
// Half-life conversion: 1 year = 31556926 seconds, 1 day = 86400 seconds.

const year = 31556926;
const day = 86400;
const hour = 3600;
const minute = 60;

export const nuclideLibrary: NuclideData[] = [
  // =======================================================================
  // I. CALIBRATION & CHECK SOURCES (Standard Labs)
  // =======================================================================
  {
    name: 'Americium-241 (Am-241)',
    halfLife_s: 432.2 * year,
    lines: [
      { energy_keV: 59.5409, intensity_percent: 35.9, type: 'gamma' },
      { energy_keV: 26.3, intensity_percent: 2.4, type: 'gamma' },
      { energy_keV: 5485.6, intensity_percent: 84.8, type: 'alpha' },
      { energy_keV: 5442.8, intensity_percent: 13.1, type: 'alpha' },
    ],
  },
  {
    name: 'Barium-133 (Ba-133)',
    halfLife_s: 10.540 * year, // BIPM-5
    lines: [
      { energy_keV: 80.9979, intensity_percent: 32.9, type: 'gamma' },
      { energy_keV: 356.013, intensity_percent: 62.05, type: 'gamma' },
      { energy_keV: 302.851, intensity_percent: 18.34, type: 'gamma' },
      { energy_keV: 276.399, intensity_percent: 7.16, type: 'gamma' },
      { energy_keV: 383.849, intensity_percent: 8.94, type: 'gamma' },
      { energy_keV: 53.162, intensity_percent: 2.14, type: 'gamma' },
      { energy_keV: 160.612, intensity_percent: 0.64, type: 'gamma' },
    ],
  },
  {
    name: 'Bismuth-207 (Bi-207)',
    halfLife_s: 31.55 * year,
    lines: [
      { energy_keV: 569.702, intensity_percent: 97.75, type: 'gamma' },
      { energy_keV: 1063.66, intensity_percent: 74.5, type: 'gamma' },
    ],
  },
  {
    name: 'Cadmium-109 (Cd-109)',
    halfLife_s: 461.4 * day, // BIPM-5
    lines: [
      { energy_keV: 22.1, intensity_percent: 83.0, type: 'gamma' }, // Ag Ka X-ray
      { energy_keV: 88.0336, intensity_percent: 3.63, type: 'gamma' },
    ],
  },
  {
    name: 'Cesium-137 (Cs-137)',
    halfLife_s: 30.05 * year,
    lines: [
      { energy_keV: 661.657, intensity_percent: 84.99, type: 'gamma' },
      { energy_keV: 32.1, intensity_percent: 5.8, type: 'gamma' }, // Ba Ka X-ray
    ],
  },
  {
    name: 'Cobalt-57 (Co-57)',
    halfLife_s: 271.80 * day, // BIPM-5
    lines: [
      { energy_keV: 122.0607, intensity_percent: 85.51, type: 'gamma' },
      { energy_keV: 136.4736, intensity_percent: 10.71, type: 'gamma' },
      { energy_keV: 14.4, intensity_percent: 9.16, type: 'gamma' },
    ],
  },
  {
    name: 'Cobalt-60 (Co-60)',
    halfLife_s: 5.2710 * year,
    lines: [
      { energy_keV: 1173.228, intensity_percent: 99.85, type: 'gamma' },
      { energy_keV: 1332.492, intensity_percent: 99.98, type: 'gamma' },
    ],
  },
  {
    name: 'Europium-152 (Eu-152)',
    halfLife_s: 13.537 * year,
    lines: [
      { energy_keV: 121.78, intensity_percent: 28.53, type: 'gamma' },
      { energy_keV: 344.28, intensity_percent: 26.5, type: 'gamma' },
      { energy_keV: 1408.01, intensity_percent: 20.87, type: 'gamma' },
      { energy_keV: 964.08, intensity_percent: 14.51, type: 'gamma' },
      { energy_keV: 1112.07, intensity_percent: 13.62, type: 'gamma' },
      { energy_keV: 778.9, intensity_percent: 12.93, type: 'gamma' },
      { energy_keV: 1085.87, intensity_percent: 10.11, type: 'gamma' },
      { energy_keV: 244.7, intensity_percent: 7.55, type: 'gamma' },
    ],
  },
  {
    name: 'Europium-154 (Eu-154)',
    halfLife_s: 8.60 * year,
    lines: [
      { energy_keV: 123.07, intensity_percent: 40.4, type: 'gamma' },
      { energy_keV: 1274.43, intensity_percent: 34.8, type: 'gamma' },
      { energy_keV: 723.30, intensity_percent: 20.06, type: 'gamma' },
      { energy_keV: 1004.76, intensity_percent: 18.01, type: 'gamma' },
      { energy_keV: 873.18, intensity_percent: 12.14, type: 'gamma' },
    ],
  },
  {
    name: 'Iron-59 (Fe-59)',
    halfLife_s: 44.495 * day,
    lines: [
      { energy_keV: 1099.25, intensity_percent: 56.5, type: 'gamma' },
      { energy_keV: 1291.60, intensity_percent: 43.2, type: 'gamma' },
    ],
  },
  {
    name: 'Manganese-54 (Mn-54)',
    halfLife_s: 312.13 * day, // BIPM-5
    lines: [
      { energy_keV: 834.838, intensity_percent: 99.97, type: 'gamma' },
    ],
  },
  {
    name: 'Sodium-22 (Na-22)',
    halfLife_s: 2.6027 * year,
    lines: [
      { energy_keV: 511.0, intensity_percent: 180.6, type: 'gamma' }, // Annihilation
      { energy_keV: 1274.537, intensity_percent: 99.94, type: 'gamma' },
    ],
  },
  {
    name: 'Yttrium-88 (Y-88)',
    halfLife_s: 106.626 * day, // BIPM-5
    lines: [
      { energy_keV: 898.036, intensity_percent: 93.90, type: 'gamma' },
      { energy_keV: 1836.052, intensity_percent: 99.32, type: 'gamma' },
    ],
  },
  {
    name: 'Zinc-65 (Zn-65)',
    halfLife_s: 244.01 * day,
    lines: [
        { energy_keV: 1115.539, intensity_percent: 50.22, type: 'gamma' },
        { energy_keV: 511.0, intensity_percent: 2.84, type: 'gamma' }, // Annihilation
    ],
  },

  // =======================================================================
  // II. ACTIVATION & FISSION PRODUCTS (NPP / Fuel Cycle / Waste)
  // =======================================================================
  {
    name: 'Silver-110m (Ag-110m)',
    halfLife_s: 249.78 * day, // BIPM-5
    lines: [
        { energy_keV: 657.760, intensity_percent: 94.68, type: 'gamma' },
        { energy_keV: 884.682, intensity_percent: 74.1, type: 'gamma' },
        { energy_keV: 937.485, intensity_percent: 34.56, type: 'gamma' },
        { energy_keV: 1384.293, intensity_percent: 24.7, type: 'gamma' },
        { energy_keV: 763.945, intensity_percent: 22.36, type: 'gamma' },
        { energy_keV: 1505.028, intensity_percent: 13.16, type: 'gamma' },
        { energy_keV: 620.357, intensity_percent: 2.73, type: 'gamma' },
        { energy_keV: 446.81, intensity_percent: 3.68, type: 'gamma' },
    ],
  },
  {
    name: 'Antimony-124 (Sb-124)',
    halfLife_s: 60.20 * day,
    lines: [
        { energy_keV: 602.73, intensity_percent: 97.8, type: 'gamma' },
        { energy_keV: 1690.98, intensity_percent: 47.6, type: 'gamma' },
        { energy_keV: 722.78, intensity_percent: 10.8, type: 'gamma' },
    ],
  },
  {
    name: 'Antimony-125 (Sb-125)',
    halfLife_s: 2.75855 * year, // BIPM-5
    lines: [
        { energy_keV: 427.87, intensity_percent: 29.6, type: 'gamma' },
        { energy_keV: 600.60, intensity_percent: 17.6, type: 'gamma' },
        { energy_keV: 635.95, intensity_percent: 11.2, type: 'gamma' },
        { energy_keV: 176.31, intensity_percent: 6.8, type: 'gamma' },
        { energy_keV: 671.44, intensity_percent: 1.8, type: 'gamma' },
    ],
  },
  {
    name: 'Barium-140 (Ba-140)',
    halfLife_s: 12.753 * day, // BIPM-5
    lines: [
        { energy_keV: 537.30, intensity_percent: 24.4, type: 'gamma' },
        { energy_keV: 162.66, intensity_percent: 6.2, type: 'gamma' },
        { energy_keV: 304.87, intensity_percent: 4.3, type: 'gamma' },
        { energy_keV: 423.72, intensity_percent: 3.1, type: 'gamma' },
        { energy_keV: 437.57, intensity_percent: 1.9, type: 'gamma' },
    ],
  },
  {
    name: 'Lanthanum-140 (La-140)',
    halfLife_s: 1.67850 * day, // BIPM-5
    lines: [
        { energy_keV: 1596.2, intensity_percent: 95.4, type: 'gamma' },
        { energy_keV: 487.02, intensity_percent: 45.5, type: 'gamma' },
        { energy_keV: 815.78, intensity_percent: 23.3, type: 'gamma' },
        { energy_keV: 328.76, intensity_percent: 20.3, type: 'gamma' },
        { energy_keV: 1596.2, intensity_percent: 95.4, type: 'gamma' },
    ],
  },
  {
    name: 'Cerium-141 (Ce-141)',
    halfLife_s: 32.50 * day,
    lines: [
        { energy_keV: 145.44, intensity_percent: 48.2, type: 'gamma' },
    ],
  },
  {
    name: 'Cerium-144 (Ce-144)',
    halfLife_s: 284.9 * day,
    lines: [
        { energy_keV: 133.51, intensity_percent: 11.1, type: 'gamma' },
        { energy_keV: 80.1, intensity_percent: 1.36, type: 'gamma' },
        { energy_keV: 696.5, intensity_percent: 1.3, type: 'gamma' }, // Pr-144m
    ],
  },
  {
    name: 'Cesium-134 (Cs-134)',
    halfLife_s: 2.0652 * year,
    lines: [
        { energy_keV: 604.72, intensity_percent: 97.6, type: 'gamma' },
        { energy_keV: 795.86, intensity_percent: 85.5, type: 'gamma' },
        { energy_keV: 569.33, intensity_percent: 15.4, type: 'gamma' },
        { energy_keV: 801.95, intensity_percent: 8.7, type: 'gamma' },
        { energy_keV: 563.25, intensity_percent: 8.3, type: 'gamma' },
        { energy_keV: 1365.19, intensity_percent: 3.0, type: 'gamma' },
    ],
  },
  {
    name: 'Cobalt-58 (Co-58)',
    halfLife_s: 70.86 * day,
    lines: [
        { energy_keV: 810.76, intensity_percent: 99.45, type: 'gamma' },
        { energy_keV: 511.0, intensity_percent: 29.8, type: 'gamma' },
        { energy_keV: 863.9, intensity_percent: 0.68, type: 'gamma' },
    ],
  },
  {
    name: 'Iodine-129 (I-129)',
    halfLife_s: 1.57e7 * year,
    lines: [
      { energy_keV: 39.58, intensity_percent: 7.42, type: 'gamma' },
      { energy_keV: 29.5, intensity_percent: 54.0, type: 'gamma' }, // Xe Ka X-ray
    ],
  },
  {
    name: 'Iodine-131 (I-131)',
    halfLife_s: 8.0233 * day, // BIPM-5
    lines: [
      { energy_keV: 364.49, intensity_percent: 81.2, type: 'gamma' },
      { energy_keV: 636.99, intensity_percent: 7.26, type: 'gamma' },
      { energy_keV: 284.31, intensity_percent: 6.06, type: 'gamma' },
      { energy_keV: 80.19, intensity_percent: 2.61, type: 'gamma' },
    ],
  },
  {
    name: 'Niobium-95 (Nb-95)',
    halfLife_s: 34.991 * day,
    lines: [
        { energy_keV: 765.80, intensity_percent: 99.8, type: 'gamma' },
    ],
  },
  {
    name: 'Promethium-147 (Pm-147)',
    halfLife_s: 2.6234 * year,
    lines: [
        { energy_keV: 121.2, intensity_percent: 0.00285, type: 'gamma' },
    ],
  },
  {
    name: 'Ruthenium-103 (Ru-103)',
    halfLife_s: 39.26 * day,
    lines: [
        { energy_keV: 497.08, intensity_percent: 91.0, type: 'gamma' },
        { energy_keV: 610.33, intensity_percent: 5.76, type: 'gamma' },
    ],
  },
  {
    name: 'Ruthenium-106 (Ru-106 / Rh-106)',
    halfLife_s: 371.8 * day,
    lines: [
        { energy_keV: 511.85, intensity_percent: 20.4, type: 'gamma' }, // Rh-106
        { energy_keV: 621.93, intensity_percent: 9.9, type: 'gamma' },  // Rh-106
        { energy_keV: 1050.4, intensity_percent: 1.5, type: 'gamma' },  // Rh-106
    ],
  },
  {
    name: 'Zirconium-95 (Zr-95)',
    halfLife_s: 64.032 * day,
    lines: [
        { energy_keV: 724.19, intensity_percent: 44.2, type: 'gamma' },
        { energy_keV: 756.72, intensity_percent: 54.3, type: 'gamma' },
    ],
  },
  
  // =======================================================================
  // III. MEDICAL, SHORT LIVED & OTHERS
  // =======================================================================
  {
    name: 'Beryllium-7 (Be-7)',
    halfLife_s: 53.22 * day, // BIPM-5
    lines: [
        { energy_keV: 477.60, intensity_percent: 10.44, type: 'gamma' },
    ],
  },
  {
    name: 'Carbon-11 (C-11)',
    halfLife_s: 20.37 * minute, // BIPM-5
    lines: [
        { energy_keV: 511.0, intensity_percent: 199.5, type: 'gamma' }, // Annihilation
    ],
  },
  {
    name: 'Chromium-51 (Cr-51)',
    halfLife_s: 27.703 * day, // BIPM-5
    lines: [
        { energy_keV: 320.08, intensity_percent: 9.89, type: 'gamma' },
    ],
  },
  {
    name: 'Copper-64 (Cu-64)',
    halfLife_s: 12.701 * hour,
    lines: [
        { energy_keV: 511.0, intensity_percent: 35.0, type: 'gamma' }, // Annihilation
        { energy_keV: 1345.77, intensity_percent: 0.47, type: 'gamma' },
    ],
  },
  {
    name: 'Fluorine-18 (F-18)',
    halfLife_s: 1.8288 * hour, // BIPM-5
    lines: [
        { energy_keV: 511.0, intensity_percent: 193.7, type: 'gamma' }, // Annihilation
    ],
  },
  {
    name: 'Gallium-67 (Ga-67)',
    halfLife_s: 3.2613 * day, // BIPM-5
    lines: [
        { energy_keV: 93.31, intensity_percent: 37.8, type: 'gamma' },
        { energy_keV: 184.58, intensity_percent: 20.9, type: 'gamma' },
        { energy_keV: 300.22, intensity_percent: 16.8, type: 'gamma' },
        { energy_keV: 393.53, intensity_percent: 4.66, type: 'gamma' },
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
    halfLife_s: 13.2234 * hour, // BIPM-5
    lines: [
        { energy_keV: 158.97, intensity_percent: 83.3, type: 'gamma' },
    ],
  },
  {
    name: 'Iodine-125 (I-125)',
    halfLife_s: 59.40 * day,
    lines: [
        { energy_keV: 35.49, intensity_percent: 6.68, type: 'gamma' },
        { energy_keV: 27.5, intensity_percent: 74.0, type: 'gamma' }, // Te Ka X-ray
    ],
  },
  {
    name: 'Krypton-85 (Kr-85)',
    halfLife_s: 10.752 * year, // BIPM-5
    lines: [
        { energy_keV: 514.0, intensity_percent: 0.43, type: 'gamma' },
    ],
  },
  {
    name: 'Manganese-56 (Mn-56)',
    halfLife_s: 2.57878 * hour, // BIPM-5
    lines: [
        { energy_keV: 846.78, intensity_percent: 98.9, type: 'gamma' },
        { energy_keV: 1810.79, intensity_percent: 26.9, type: 'gamma' },
        { energy_keV: 2113.15, intensity_percent: 14.2, type: 'gamma' },
    ],
  },
  {
    name: 'Molybdenum-99 (Mo-99)',
    halfLife_s: 2.7479 * day, // BIPM-5
    lines: [
        { energy_keV: 739.50, intensity_percent: 12.12, type: 'gamma' },
        { energy_keV: 181.07, intensity_percent: 6.01, type: 'gamma' },
        { energy_keV: 777.92, intensity_percent: 4.28, type: 'gamma' },
        { energy_keV: 140.51, intensity_percent: 89.6, type: 'gamma' }, // Tc-99m equilibrium
    ],
  },
  {
    name: 'Sodium-24 (Na-24)',
    halfLife_s: 14.9574 * hour, // BIPM-5
    lines: [
        { energy_keV: 1368.67, intensity_percent: 100.0, type: 'gamma' },
        { energy_keV: 2754.01, intensity_percent: 99.87, type: 'gamma' },
    ],
  },
  {
    name: 'Potassium-40 (K-40)',
    halfLife_s: 1.248e9 * year,
    lines: [
        { energy_keV: 1460.82, intensity_percent: 10.66, type: 'gamma' },
    ],
  },
  {
    name: 'Technetium-99m (Tc-99m)',
    halfLife_s: 6.0067 * hour, // BIPM-5
    lines: [
      { energy_keV: 140.51, intensity_percent: 88.5, type: 'gamma' },
    ],
  },
  {
    name: 'Thallium-201 (Tl-201)',
    halfLife_s: 3.04 * day,
    lines: [
        { energy_keV: 167.43, intensity_percent: 10.0, type: 'gamma' },
        { energy_keV: 135.34, intensity_percent: 2.65, type: 'gamma' },
        { energy_keV: 70.8, intensity_percent: 46.0, type: 'gamma' }, // Hg X-ray
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
  // IV. ACTINIDES & ALPHA EMITTERS (Fuel Cycle)
  // =======================================================================
  {
    name: 'Californium-252 (Cf-252)',
    halfLife_s: 2.645 * year,
    lines: [
      { energy_keV: 6118, intensity_percent: 81.6, type: 'alpha' },
      { energy_keV: 6076, intensity_percent: 15.2, type: 'alpha' },
    ],
  },
  {
    name: 'Curium-242 (Cm-242)',
    halfLife_s: 162.8 * day,
    lines: [
      { energy_keV: 6113, intensity_percent: 74.0, type: 'alpha' },
      { energy_keV: 6070, intensity_percent: 26.0, type: 'alpha' },
    ],
  },
  {
    name: 'Curium-243 (Cm-243)',
    halfLife_s: 29.1 * year,
    lines: [
      { energy_keV: 5785, intensity_percent: 73.0, type: 'alpha' },
      { energy_keV: 5742, intensity_percent: 11.0, type: 'alpha' },
      { energy_keV: 277.6, intensity_percent: 14.1, type: 'gamma' },
    ],
  },
  {
    name: 'Curium-248 (Cm-248)',
    halfLife_s: 3.48e5 * year,
    lines: [
      { energy_keV: 5075, intensity_percent: 75.0, type: 'alpha' },
      { energy_keV: 5034, intensity_percent: 25.0, type: 'alpha' },
    ],
  },
  {
    name: 'Einsteinium-253 (Es-253)',
    halfLife_s: 20.5 * day,
    lines: [
      { energy_keV: 6633, intensity_percent: 90.0, type: 'alpha' },
      { energy_keV: 6592, intensity_percent: 6.6, type: 'alpha' },
    ],
  },
  {
    name: 'Fermium-257 (Fm-257)',
    halfLife_s: 100.5 * day,
    lines: [
      { energy_keV: 6834, intensity_percent: 100.0, type: 'alpha' },
    ],
  },
  {
    name: 'Neptunium-237 (Np-237)',
    halfLife_s: 2.14e6 * year,
    lines: [
      { energy_keV: 4788, intensity_percent: 47.0, type: 'alpha' },
      { energy_keV: 4766, intensity_percent: 23.0, type: 'alpha' },
      { energy_keV: 86.5, intensity_percent: 12.4, type: 'gamma' },
    ],
  },
  {
    name: 'Plutonium-238 (Pu-238)',
    halfLife_s: 87.7 * year,
    lines: [
      { energy_keV: 5499.0, intensity_percent: 70.9, type: 'alpha' },
      { energy_keV: 5456.3, intensity_percent: 29.0, type: 'alpha' },
      { energy_keV: 43.5, intensity_percent: 0.038, type: 'gamma' },
    ],
  },
  {
    name: 'Plutonium-239 (Pu-239)',
    halfLife_s: 24110 * year,
    lines: [
      { energy_keV: 5156.6, intensity_percent: 73.3, type: 'alpha' },
      { energy_keV: 5143.7, intensity_percent: 15.1, type: 'alpha' },
      { energy_keV: 129.3, intensity_percent: 0.0063, type: 'gamma' },
    ],
  },
  {
    name: 'Plutonium-241 (Pu-241)',
    halfLife_s: 14.35 * year,
    lines: [
      { energy_keV: 4896, intensity_percent: 0.002, type: 'alpha' }, // Primary decay is Beta to Am-241
    ],
  },
  {
    name: 'Plutonium-242 (Pu-242)',
    halfLife_s: 3.73e5 * year,
    lines: [
      { energy_keV: 4901, intensity_percent: 77.5, type: 'alpha' },
      { energy_keV: 4856, intensity_percent: 22.4, type: 'alpha' },
    ],
  },
  {
    name: 'Protactinium-231 (Pa-231)',
    halfLife_s: 3.28e4 * year,
    lines: [
      { energy_keV: 5057, intensity_percent: 11.0, type: 'alpha' }, // User value
      { energy_keV: 5013, intensity_percent: 25.4, type: 'alpha' },
      { energy_keV: 27.4, intensity_percent: 10.0, type: 'gamma' },
    ],
  },
  {
    name: 'Thorium-228 (Th-228)',
    halfLife_s: 1.91 * year,
    lines: [
      { energy_keV: 5423, intensity_percent: 72.2, type: 'alpha' },
      { energy_keV: 5340, intensity_percent: 27.2, type: 'alpha' },
    ],
  },
  {
    name: 'Thorium-229 (Th-229)',
    halfLife_s: 7880 * year,
    lines: [
      { energy_keV: 4845, intensity_percent: 56.2, type: 'alpha' },
      { energy_keV: 4901, intensity_percent: 10.2, type: 'alpha' },
    ],
  },
  {
    name: 'Thorium-234 (Th-234)',
    halfLife_s: 24.1 * day,
    lines: [
      { energy_keV: 4770, intensity_percent: 100.0, type: 'alpha' }, // Note: Physcially Th-234 is Beta emitter. This energy usually corresponds to U-234. Added per user request.
      { energy_keV: 63.3, intensity_percent: 4.8, type: 'gamma' },
    ],
  },
  {
    name: 'Uranium-235 (U-235)',
    halfLife_s: 7.04e8 * year,
    lines: [
        { energy_keV: 185.72, intensity_percent: 57.2, type: 'gamma' },
        { energy_keV: 143.76, intensity_percent: 10.96, type: 'gamma' },
        { energy_keV: 163.33, intensity_percent: 5.08, type: 'gamma' },
        { energy_keV: 205.31, intensity_percent: 5.01, type: 'gamma' },
    ],
  },
  {
    name: 'Uranium-238 (U-238) / Pa-234m',
    halfLife_s: 4.468e9 * year,
    lines: [
      { energy_keV: 1001.03, intensity_percent: 0.84, type: 'gamma' }, // Pa-234m
      { energy_keV: 766.36, intensity_percent: 0.21, type: 'gamma' }, // Pa-234m
      { energy_keV: 4198, intensity_percent: 77, type: 'alpha' },
      { energy_keV: 4151, intensity_percent: 23, type: 'alpha' },
    ],
  },
];
