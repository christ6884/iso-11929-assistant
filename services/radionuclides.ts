
import { Radionuclide } from '../types.ts';

const year = 31556926;
const day = 86400;
const hour = 3600;
const minute = 60;

// Data is grouped by primary emission type for easier selection.
// Half-life data sourced from BIPM Monographie 5 (Vol 1 & 2), NNDC, and industry standards.
// Gamma constants are approximate values in (µSv/h)/MBq @ 1m.
export const radionuclides: Record<string, Radionuclide[]> = {
  gamma: [
    { name: 'Americium-241 (Am-241)', halfLifeSeconds: 432.2 * year, gammaConstant: 3.2, effectiveEnergy_MeV: 0.060 },
    { name: 'Antimony-124 (Sb-124)', halfLifeSeconds: 60.20 * day, gammaConstant: 260, effectiveEnergy_MeV: 1.691 },
    { name: 'Antimony-125 (Sb-125)', halfLifeSeconds: 2.75855 * year, effectiveEnergy_MeV: 0.428 },
    { name: 'Barium-133 (Ba-133)', halfLifeSeconds: 10.540 * year, gammaConstant: 56.4, effectiveEnergy_MeV: 0.356 },
    { name: 'Barium-140 (Ba-140)', halfLifeSeconds: 12.753 * day, gammaConstant: 43.1, effectiveEnergy_MeV: 0.537 },
    { name: 'Beryllium-7 (Be-7)', halfLifeSeconds: 53.22 * day, gammaConstant: 4.8, effectiveEnergy_MeV: 0.477 },
    { name: 'Bismuth-207 (Bi-207)', halfLifeSeconds: 31.55 * year, gammaConstant: 200, effectiveEnergy_MeV: 0.570 },
    { name: 'Cadmium-109 (Cd-109)', halfLifeSeconds: 461.4 * day, gammaConstant: 5.9, effectiveEnergy_MeV: 0.088 },
    { name: 'Cerium-141 (Ce-141)', halfLifeSeconds: 32.50 * day, gammaConstant: 12.1, effectiveEnergy_MeV: 0.145 },
    { name: 'Cerium-144 (Ce-144)', halfLifeSeconds: 284.9 * day, gammaConstant: 5.9, effectiveEnergy_MeV: 0.133 },
    { name: 'Cesium-134 (Cs-134)', halfLifeSeconds: 2.0652 * year, gammaConstant: 230, effectiveEnergy_MeV: 0.795 },
    { name: 'Cesium-137 (Cs-137)', halfLifeSeconds: 30.08 * year, gammaConstant: 89, effectiveEnergy_MeV: 0.662 },
    { name: 'Chromium-51 (Cr-51)', halfLifeSeconds: 27.703 * day, gammaConstant: 4.6, effectiveEnergy_MeV: 0.320 },
    { name: 'Cobalt-56 (Co-56)', halfLifeSeconds: 77.236 * day, gammaConstant: 490, effectiveEnergy_MeV: 0.847 },
    { name: 'Cobalt-57 (Co-57)', halfLifeSeconds: 271.80 * day, gammaConstant: 2.5, effectiveEnergy_MeV: 0.122 },
    { name: 'Cobalt-58 (Co-58)', halfLifeSeconds: 70.86 * day, gammaConstant: 150, effectiveEnergy_MeV: 0.811 },
    { name: 'Cobalt-60 (Co-60)', halfLifeSeconds: 5.271 * year, gammaConstant: 353, effectiveEnergy_MeV: 1.25 },
    { name: 'Copper-64 (Cu-64)', halfLifeSeconds: 12.701 * hour, gammaConstant: 31.5, effectiveEnergy_MeV: 0.511 },
    { name: 'Europium-152 (Eu-152)', halfLifeSeconds: 13.537 * year, gammaConstant: 160, effectiveEnergy_MeV: 1.408 },
    { name: 'Europium-154 (Eu-154)', halfLifeSeconds: 8.60 * year, gammaConstant: 160, effectiveEnergy_MeV: 1.274 },
    { name: 'Europium-155 (Eu-155)', halfLifeSeconds: 4.76 * year, effectiveEnergy_MeV: 0.105 },
    { name: 'Fluorine-18 (F-18)', halfLifeSeconds: 1.8288 * hour, gammaConstant: 150, effectiveEnergy_MeV: 0.511 },
    { name: 'Gallium-66 (Ga-66)', halfLifeSeconds: 9.49 * hour, effectiveEnergy_MeV: 1.039 },
    { name: 'Gallium-67 (Ga-67)', halfLifeSeconds: 3.2613 * day, gammaConstant: 22.1, effectiveEnergy_MeV: 0.093 },
    { name: 'Indium-111 (In-111)', halfLifeSeconds: 2.8049 * day, gammaConstant: 43.1, effectiveEnergy_MeV: 0.245 },
    { name: 'Iodine-123 (I-123)', halfLifeSeconds: 13.2234 * hour, gammaConstant: 42.1, effectiveEnergy_MeV: 0.159 },
    { name: 'Iodine-125 (I-125)', halfLifeSeconds: 59.40 * day, gammaConstant: 40.1, effectiveEnergy_MeV: 0.035 },
    { name: 'Iodine-129 (I-129)', halfLifeSeconds: 1.57e7 * year, gammaConstant: 16.3, effectiveEnergy_MeV: 0.040 },
    { name: 'Iodine-131 (I-131)', halfLifeSeconds: 8.0233 * day, gammaConstant: 59.3, effectiveEnergy_MeV: 0.364 },
    { name: 'Iron-55 (Fe-55)', halfLifeSeconds: 2.737 * year },
    { name: 'Iron-59 (Fe-59)', halfLifeSeconds: 44.495 * day, gammaConstant: 171, effectiveEnergy_MeV: 1.099 },
    { name: 'Krypton-85 (Kr-85)', halfLifeSeconds: 10.752 * year, effectiveEnergy_MeV: 0.514 },
    { name: 'Lanthanum-140 (La-140)', halfLifeSeconds: 1.67850 * day, gammaConstant: 280, effectiveEnergy_MeV: 1.596 },
    { name: 'Lead-210 (Pb-210)', halfLifeSeconds: 22.23 * year, gammaConstant: 0.004, effectiveEnergy_MeV: 0.0465 },
    { name: 'Lutetium-177 (Lu-177)', halfLifeSeconds: 6.647 * day, effectiveEnergy_MeV: 0.208 },
    { name: 'Manganese-54 (Mn-54)', halfLifeSeconds: 312.13 * day, gammaConstant: 128.8, effectiveEnergy_MeV: 0.835 },
    { name: 'Manganese-56 (Mn-56)', halfLifeSeconds: 2.57878 * hour, effectiveEnergy_MeV: 0.847 },
    { name: 'Molybdenum-99 (Mo-99)', halfLifeSeconds: 2.7479 * day, gammaConstant: 39.5, effectiveEnergy_MeV: 0.740 },
    { name: 'Niobium-94 (Nb-94)', halfLifeSeconds: 2.03e4 * year, gammaConstant: 230, effectiveEnergy_MeV: 0.871 },
    { name: 'Niobium-95 (Nb-95)', halfLifeSeconds: 34.991 * day, gammaConstant: 110, effectiveEnergy_MeV: 0.766 },
    { name: 'Potassium-40 (K-40)', halfLifeSeconds: 1.248e9 * year, gammaConstant: 22.4, effectiveEnergy_MeV: 1.461 },
    { name: 'Ruthenium-103 (Ru-103)', halfLifeSeconds: 39.26 * day, gammaConstant: 79.5, effectiveEnergy_MeV: 0.497 },
    { name: 'Ruthenium-106 (Ru-106)', halfLifeSeconds: 371.8 * day, gammaConstant: 34.9, effectiveEnergy_MeV: 0.512 },
    { name: 'Samarium-153 (Sm-153)', halfLifeSeconds: 1.928 * day, effectiveEnergy_MeV: 0.103 },
    { name: 'Scandium-46 (Sc-46)', halfLifeSeconds: 83.788 * day, gammaConstant: 290, effectiveEnergy_MeV: 0.889 },
    { name: 'Selenium-75 (Se-75)', halfLifeSeconds: 119.78 * day, gammaConstant: 52.1, effectiveEnergy_MeV: 0.265 },
    { name: 'Silver-110m (Ag-110m)', halfLifeSeconds: 249.78 * day, gammaConstant: 390, effectiveEnergy_MeV: 0.658 },
    { name: 'Sodium-22 (Na-22)', halfLifeSeconds: 2.6027 * year, gammaConstant: 326.6, effectiveEnergy_MeV: 1.275 },
    { name: 'Sodium-24 (Na-24)', halfLifeSeconds: 14.9574 * hour, gammaConstant: 490, effectiveEnergy_MeV: 1.369 },
    { name: 'Strontium-85 (Sr-85)', halfLifeSeconds: 64.850 * day, gammaConstant: 80.8, effectiveEnergy_MeV: 0.514 },
    { name: 'Technetium-99m (Tc-99m)', halfLifeSeconds: 6.0067 * hour, gammaConstant: 20.9, effectiveEnergy_MeV: 0.140 },
    { name: 'Thallium-201 (Tl-201)', halfLifeSeconds: 3.04 * day, effectiveEnergy_MeV: 0.167 },
    { name: 'Xenon-133 (Xe-133)', halfLifeSeconds: 5.243 * day, gammaConstant: 12.3, effectiveEnergy_MeV: 0.081 },
    { name: 'Yttrium-88 (Y-88)', halfLifeSeconds: 106.626 * day, gammaConstant: 410, effectiveEnergy_MeV: 1.836 },
    { name: 'Zinc-65 (Zn-65)', halfLifeSeconds: 244.01 * day, gammaConstant: 75.3, effectiveEnergy_MeV: 1.116 },
    { name: 'Zirconium-95 (Zr-95)', halfLifeSeconds: 64.032 * day, gammaConstant: 110, effectiveEnergy_MeV: 0.757 },
  ].sort((a, b) => a.name.localeCompare(b.name)),
  
  beta: [
    { name: 'Calcium-45 (Ca-45)', halfLifeSeconds: 162.61 * day },
    { name: 'Carbon-14 (C-14)', halfLifeSeconds: 5700 * year },
    { name: 'Chlorine-36 (Cl-36)', halfLifeSeconds: 3.01e5 * year },
    { name: 'Hydrogen-3 (H-3 Tritium)', halfLifeSeconds: 12.32 * year },
    { name: 'Nickel-63 (Ni-63)', halfLifeSeconds: 100.1 * year },
    { name: 'Phosphorus-32 (P-32)', halfLifeSeconds: 14.284 * day }, // BIPM-5
    { name: 'Phosphorus-33 (P-33)', halfLifeSeconds: 25.383 * day }, // BIPM-5
    { name: 'Promethium-147 (Pm-147)', halfLifeSeconds: 2.6234 * year },
    { name: 'Strontium-89 (Sr-89)', halfLifeSeconds: 50.57 * day }, // BIPM-5
    { name: 'Strontium-90 (Sr-90)', halfLifeSeconds: 28.79 * year },
    { name: 'Sulfur-35 (S-35)', halfLifeSeconds: 87.51 * day },
    { name: 'Technetium-99 (Tc-99)', halfLifeSeconds: 2.11e5 * year },
    { name: 'Thallium-204 (Tl-204)', halfLifeSeconds: 3.78 * year },
    { name: 'Yttrium-90 (Y-90)', halfLifeSeconds: 64.10 * hour },
  ].sort((a, b) => a.name.localeCompare(b.name)),
  
  alpha: [
    { name: 'Americium-241 (Am-241)', halfLifeSeconds: 432.2 * year, gammaConstant: 3.2, effectiveEnergy_MeV: 0.060 },
    { name: 'Californium-252 (Cf-252)', halfLifeSeconds: 2.645 * year },
    { name: 'Curium-242 (Cm-242)', halfLifeSeconds: 162.8 * day },
    { name: 'Curium-243 (Cm-243)', halfLifeSeconds: 29.1 * year },
    { name: 'Curium-244 (Cm-244)', halfLifeSeconds: 18.10 * year },
    { name: 'Curium-248 (Cm-248)', halfLifeSeconds: 3.48e5 * year },
    { name: 'Einsteinium-253 (Es-253)', halfLifeSeconds: 20.5 * day },
    { name: 'Fermium-257 (Fm-257)', halfLifeSeconds: 100.5 * day },
    { name: 'Neptunium-237 (Np-237)', halfLifeSeconds: 2.144e6 * year },
    { name: 'Plutonium-238 (Pu-238)', halfLifeSeconds: 87.7 * year },
    { name: 'Plutonium-239 (Pu-239)', halfLifeSeconds: 24110 * year },
    { name: 'Plutonium-240 (Pu-240)', halfLifeSeconds: 6561 * year },
    { name: 'Plutonium-241 (Pu-241)', halfLifeSeconds: 14.35 * year },
    { name: 'Plutonium-242 (Pu-242)', halfLifeSeconds: 3.73e5 * year },
    { name: 'Polonium-210 (Po-210)', halfLifeSeconds: 138.376 * day },
    { name: 'Protactinium-231 (Pa-231)', halfLifeSeconds: 3.28e4 * year },
    { name: 'Radium-226 (Ra-226)', halfLifeSeconds: 1600 * year },
    { name: 'Thorium-228 (Th-228)', halfLifeSeconds: 1.91 * year },
    { name: 'Thorium-229 (Th-229)', halfLifeSeconds: 7880 * year },
    { name: 'Thorium-232 (Th-232)', halfLifeSeconds: 1.405e10 * year },
    { name: 'Thorium-234 (Th-234)', halfLifeSeconds: 24.1 * day },
    { name: 'Uranium-233 (U-233)', halfLifeSeconds: 1.592e5 * year },
    { name: 'Uranium-234 (U-234)', halfLifeSeconds: 2.455e5 * year },
    { name: 'Uranium-235 (U-235)', halfLifeSeconds: 7.04e8 * year },
    { name: 'Uranium-238 (U-238)', halfLifeSeconds: 4.468e9 * year },
  ].sort((a, b) => a.name.localeCompare(b.name)),

  neutron: [
    { name: 'Californium-252 (Cf-252)', halfLifeSeconds: 2.645 * year },
    { name: 'Americium-241/Be (Am-Be)', halfLifeSeconds: 432.2 * year, gammaConstant: 3.2, effectiveEnergy_MeV: 4.4 }, // Driven by Am-241 for half-life, effective energy from neutron emission
  ]
};