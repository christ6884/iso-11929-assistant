
export interface Radionuclide {
  name: string;
  halfLifeSeconds: number;
}

const year = 31556926;
const day = 86400;
const hour = 3600;
const minute = 60;

// Data is grouped by primary emission type for easier selection.
// Half-life data sourced from BIPM Monographie 5 (Vol 1 & 2), NNDC, and industry standards.
export const radionuclides: Record<string, Radionuclide[]> = {
  gamma: [
    { name: 'Americium-241 (Am-241)', halfLifeSeconds: 432.2 * year },
    { name: 'Antimony-124 (Sb-124)', halfLifeSeconds: 60.20 * day },
    { name: 'Antimony-125 (Sb-125)', halfLifeSeconds: 2.75855 * year }, // BIPM-5
    { name: 'Barium-133 (Ba-133)', halfLifeSeconds: 10.540 * year }, // BIPM-5
    { name: 'Barium-140 (Ba-140)', halfLifeSeconds: 12.753 * day }, // BIPM-5
    { name: 'Beryllium-7 (Be-7)', halfLifeSeconds: 53.22 * day }, // BIPM-5
    { name: 'Bismuth-207 (Bi-207)', halfLifeSeconds: 31.55 * year },
    { name: 'Cadmium-109 (Cd-109)', halfLifeSeconds: 461.4 * day }, // BIPM-5
    { name: 'Cerium-141 (Ce-141)', halfLifeSeconds: 32.50 * day },
    { name: 'Cerium-144 (Ce-144)', halfLifeSeconds: 284.9 * day },
    { name: 'Cesium-134 (Cs-134)', halfLifeSeconds: 2.0652 * year },
    { name: 'Cesium-137 (Cs-137)', halfLifeSeconds: 30.08 * year },
    { name: 'Chromium-51 (Cr-51)', halfLifeSeconds: 27.703 * day }, // BIPM-5
    { name: 'Cobalt-56 (Co-56)', halfLifeSeconds: 77.236 * day },
    { name: 'Cobalt-57 (Co-57)', halfLifeSeconds: 271.80 * day }, // BIPM-5
    { name: 'Cobalt-58 (Co-58)', halfLifeSeconds: 70.86 * day },
    { name: 'Cobalt-60 (Co-60)', halfLifeSeconds: 5.271 * year },
    { name: 'Copper-64 (Cu-64)', halfLifeSeconds: 12.701 * hour }, // BIPM-5
    { name: 'Europium-152 (Eu-152)', halfLifeSeconds: 13.537 * year },
    { name: 'Europium-154 (Eu-154)', halfLifeSeconds: 8.60 * year },
    { name: 'Europium-155 (Eu-155)', halfLifeSeconds: 4.76 * year },
    { name: 'Fluorine-18 (F-18)', halfLifeSeconds: 1.8288 * hour }, // BIPM-5
    { name: 'Gallium-66 (Ga-66)', halfLifeSeconds: 9.49 * hour }, // BIPM-5
    { name: 'Gallium-67 (Ga-67)', halfLifeSeconds: 3.2613 * day }, // BIPM-5
    { name: 'Indium-111 (In-111)', halfLifeSeconds: 2.8049 * day },
    { name: 'Iodine-123 (I-123)', halfLifeSeconds: 13.2234 * hour }, // BIPM-5
    { name: 'Iodine-125 (I-125)', halfLifeSeconds: 59.40 * day },
    { name: 'Iodine-129 (I-129)', halfLifeSeconds: 1.57e7 * year },
    { name: 'Iodine-131 (I-131)', halfLifeSeconds: 8.0233 * day }, // BIPM-5
    { name: 'Iron-55 (Fe-55)', halfLifeSeconds: 2.737 * year },
    { name: 'Iron-59 (Fe-59)', halfLifeSeconds: 44.495 * day }, // BIPM-5
    { name: 'Krypton-85 (Kr-85)', halfLifeSeconds: 10.752 * year }, // BIPM-5
    { name: 'Lanthanum-140 (La-140)', halfLifeSeconds: 1.67850 * day }, // BIPM-5
    { name: 'Lutetium-177 (Lu-177)', halfLifeSeconds: 6.647 * day },
    { name: 'Manganese-54 (Mn-54)', halfLifeSeconds: 312.13 * day }, // BIPM-5
    { name: 'Manganese-56 (Mn-56)', halfLifeSeconds: 2.57878 * hour }, // BIPM-5
    { name: 'Molybdenum-99 (Mo-99)', halfLifeSeconds: 2.7479 * day }, // BIPM-5
    { name: 'Niobium-94 (Nb-94)', halfLifeSeconds: 2.03e4 * year },
    { name: 'Niobium-95 (Nb-95)', halfLifeSeconds: 34.991 * day },
    { name: 'Potassium-40 (K-40)', halfLifeSeconds: 1.248e9 * year },
    { name: 'Ruthenium-103 (Ru-103)', halfLifeSeconds: 39.26 * day },
    { name: 'Ruthenium-106 (Ru-106)', halfLifeSeconds: 371.8 * day },
    { name: 'Samarium-153 (Sm-153)', halfLifeSeconds: 1.928 * day },
    { name: 'Scandium-46 (Sc-46)', halfLifeSeconds: 83.788 * day }, // BIPM-5
    { name: 'Selenium-75 (Se-75)', halfLifeSeconds: 119.78 * day },
    { name: 'Silver-110m (Ag-110m)', halfLifeSeconds: 249.78 * day }, // BIPM-5
    { name: 'Sodium-22 (Na-22)', halfLifeSeconds: 2.6027 * year },
    { name: 'Sodium-24 (Na-24)', halfLifeSeconds: 14.9574 * hour }, // BIPM-5
    { name: 'Strontium-85 (Sr-85)', halfLifeSeconds: 64.850 * day }, // BIPM-5
    { name: 'Technetium-99m (Tc-99m)', halfLifeSeconds: 6.0067 * hour }, // BIPM-5
    { name: 'Thallium-201 (Tl-201)', halfLifeSeconds: 3.04 * day },
    { name: 'Xenon-133 (Xe-133)', halfLifeSeconds: 5.243 * day },
    { name: 'Yttrium-88 (Y-88)', halfLifeSeconds: 106.626 * day }, // BIPM-5
    { name: 'Zinc-65 (Zn-65)', halfLifeSeconds: 244.01 * day },
    { name: 'Zirconium-95 (Zr-95)', halfLifeSeconds: 64.032 * day },
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
    { name: 'Americium-241 (Am-241)', halfLifeSeconds: 432.2 * year },
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
    { name: 'Americium-241/Be (Am-Be)', halfLifeSeconds: 432.2 * year }, // Driven by Am-241
  ]
};
