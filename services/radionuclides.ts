export interface Radionuclide {
  name: string;
  halfLifeSeconds: number;
}

// Data is grouped by primary emission type for easier selection.
// Half-life data sourced from public nuclear data repositories.
export const radionuclides: Record<string, Radionuclide[]> = {
  gamma: [
    { name: 'Americium-241 (Am-241)', halfLifeSeconds: 1.364e10 }, // 432.2 years
    { name: 'Barium-133 (Ba-133)', halfLifeSeconds: 3.326e8 }, // 10.551 years
    { name: 'Cadmium-109 (Cd-109)', halfLifeSeconds: 4.00e7 }, // 462.6 days
    { name: 'Carbon-11 (C-11)', halfLifeSeconds: 1222.2 }, // 20.370 min
    { name: 'Cesium-134 (Cs-134)', halfLifeSeconds: 6.50e7 }, // 2.065 years
    { name: 'Cesium-137 (Cs-137)', halfLifeSeconds: 9.516e8 }, // 30.147 years
    { name: 'Cobalt-57 (Co-57)', halfLifeSeconds: 23482720 }, // 271.80 days
    { name: 'Cobalt-60 (Co-60)', halfLifeSeconds: 1.6635e8 }, // 5.2713 years
    { name: 'Europium-152 (Eu-152)', halfLifeSeconds: 4.272e8 }, // 13.537 years
    { name: 'Fluorine-18 (F-18)', halfLifeSeconds: 6583.7 }, // 1.8288 h
    { name: 'Iodine-125 (I-125)', halfLifeSeconds: 5.14e6 }, // 59.4 days
    { name: 'Iodine-131 (I-131)', halfLifeSeconds: 6.95e5 }, // 8.02 days
    { name: 'Manganese-54 (Mn-54)', halfLifeSeconds: 26978112 }, // 312.13 days
    { name: 'Nitrogen-13 (N-13)', halfLifeSeconds: 598.0 }, // 9.9670 min
    { name: 'Oxygen-15 (O-15)', halfLifeSeconds: 122.5 }, // 2.041 min
    { name: 'Radium-226 (Ra-226)', halfLifeSeconds: 5.05e10 }, // 1600 years
    { name: 'Scandium-46 (Sc-46)', halfLifeSeconds: 7239130 }, // 83.788 d
    { name: 'Selenium-75 (Se-75)', halfLifeSeconds: 1.03e7 }, // 119.78 days
    { name: 'Sodium-22 (Na-22)', halfLifeSeconds: 8.220e7 }, // 2.6049 years
    { name: 'Sodium-24 (Na-24)', halfLifeSeconds: 53847 }, // 14.9574 h
    { name: 'Technetium-99m (Tc-99m)', halfLifeSeconds: 2.16e4 }, // 6.01 hours
    { name: 'Yttrium-88 (Y-88)', halfLifeSeconds: 9.22e6 }, // 106.6 days
    { name: 'Zinc-65 (Zn-65)', halfLifeSeconds: 2.11e7 }, // 244.26 days
  ].sort((a, b) => a.name.localeCompare(b.name)),
  beta: [
    { name: 'Calcium-45 (Ca-45)', halfLifeSeconds: 1.42e7 }, // 162.7 days
    { name: 'Carbon-14 (C-14)', halfLifeSeconds: 1.808e11 }, // 5730 years
    { name: 'Chlorine-36 (Cl-36)', halfLifeSeconds: 9.511e12 }, // 301,300 years
    { name: 'Iron-59 (Fe-59)', halfLifeSeconds: 3.84e6 }, // 44.5 days
    { name: 'Krypton-85 (Kr-85)', halfLifeSeconds: 3.39e8 }, // 10.76 years
    { name: 'Nickel-63 (Ni-63)', halfLifeSeconds: 3.16e9 }, // 100.1 years
    { name: 'Phosphorus-32 (P-32)', halfLifeSeconds: 1234262 }, // 14.284 days
    { name: 'Phosphorus-33 (P-33)', halfLifeSeconds: 2193245 }, // 25.383 d
    { name: 'Promethium-147 (Pm-147)', halfLifeSeconds: 8.27e7 }, // 2.6234 years
    { name: 'Strontium-90 (Sr-90)', halfLifeSeconds: 9.096e8 }, // 28.82 years
    { name: 'Sulfur-35 (S-35)', halfLifeSeconds: 7.55e6 }, // 87.51 days
    { name: 'Technetium-99 (Tc-99)', halfLifeSeconds: 6.69e12 }, // 211,100 years
    { name: 'Thallium-204 (Tl-204)', halfLifeSeconds: 1.19e8 }, // 3.78 years
    { name: 'Tritium (H-3)', halfLifeSeconds: 3.888e8 }, // 12.32 years
    { name: 'Yttrium-90 (Y-90)', halfLifeSeconds: 2.31e5 }, // 2.67 days
  ].sort((a, b) => a.name.localeCompare(b.name)),
  alpha: [
    { name: 'Americium-241 (Am-241)', halfLifeSeconds: 1.364e10 }, // 432.2 years
    { name: 'Curium-244 (Cm-244)', halfLifeSeconds: 5.72e8 }, // 18.1 years
    { name: 'Plutonium-238 (Pu-238)', halfLifeSeconds: 2.77e9 }, // 87.7 years
    { name: 'Plutonium-239 (Pu-239)', halfLifeSeconds: 7.608e11 }, // 24,110 years
    { name: 'Polonium-209 (Po-209)', halfLifeSeconds: 3.25e9 }, // 103 years
    { name: 'Polonium-210 (Po-210)', halfLifeSeconds: 1.196e7 }, // 138.376 days
    { name: 'Thorium-229 (Th-229)', halfLifeSeconds: 2.32e11 }, // 7340 years
    { name: 'Uranium-233 (U-233)', halfLifeSeconds: 5.02e12 }, // 159,200 years
    { name: 'Uranium-235 (U-235)', halfLifeSeconds: 2.221e16 }, // 703.8 million years
    { name: 'Uranium-238 (U-238)', halfLifeSeconds: 1.409e17 }, // 4.468 billion years
  ].sort((a, b) => a.name.localeCompare(b.name)),
};
