// Data for gamma ray shielding calculations
// Linear attenuation coefficients (mu) are in cm^-1
// Taylor form buildup factor coefficients (A, alpha1, alpha2) are dimensionless
// B(E, µx) = A * exp(-alpha1 * µx) + (1 - A) * exp(-alpha2 * µx)
// Data is a compilation from various nuclear engineering handbooks (e.g., Lamarsh, Chilton) for common materials.

export interface ShieldingMaterial {
    name: string;
    density_g_cm3: number;
    mu: { energy_MeV: number; value: number }[];
    buildup: { energy_MeV: number; A: number; alpha1: number; alpha2: number }[];
}

export const shieldingMaterials: ShieldingMaterial[] = [
    {
        name: 'Lead (Pb)',
        density_g_cm3: 11.34,
        mu: [
            { energy_MeV: 0.1, value: 57.6 },
            { energy_MeV: 0.3, value: 3.59 },
            { energy_MeV: 0.5, value: 1.46 },
            { energy_MeV: 0.8, value: 0.89 },
            { energy_MeV: 1.0, value: 0.77 },
            { energy_MeV: 1.5, value: 0.60 },
            { energy_MeV: 2.0, value: 0.52 },
            { energy_MeV: 3.0, value: 0.49 },
        ],
        buildup: [
            { energy_MeV: 0.5, A: 2.2, alpha1: -0.07, alpha2: 0.05 },
            { energy_MeV: 1.0, A: 2.15, alpha1: -0.06, alpha2: 0.046 },
            { energy_MeV: 2.0, A: 1.95, alpha1: -0.05, alpha2: 0.038 },
            { energy_MeV: 3.0, A: 1.80, alpha1: -0.04, alpha2: 0.032 },
        ],
    },
    {
        name: 'Steel (Fe)',
        density_g_cm3: 7.87,
        mu: [
            { energy_MeV: 0.1, value: 2.76 },
            { energy_MeV: 0.3, value: 0.69 },
            { energy_MeV: 0.5, value: 0.52 },
            { energy_MeV: 0.8, value: 0.42 },
            { energy_MeV: 1.0, value: 0.37 },
            { energy_MeV: 1.5, value: 0.30 },
            { energy_MeV: 2.0, value: 0.26 },
            { energy_MeV: 3.0, value: 0.22 },
        ],
        buildup: [
            { energy_MeV: 0.5, A: 10.9, alpha1: -0.09, alpha2: 0.06 },
            { energy_MeV: 1.0, A: 8.4, alpha1: -0.1, alpha2: 0.03 },
            { energy_MeV: 2.0, A: 6.2, alpha1: -0.09, alpha2: 0.02 },
            { energy_MeV: 3.0, A: 5.1, alpha1: -0.08, alpha2: 0.015 },
        ],
    },
    {
        name: 'Concrete',
        density_g_cm3: 2.35,
        mu: [
            { energy_MeV: 0.1, value: 0.39 },
            { energy_MeV: 0.3, value: 0.22 },
            { energy_MeV: 0.5, value: 0.18 },
            { energy_MeV: 0.8, value: 0.14 },
            { energy_MeV: 1.0, value: 0.13 },
            { energy_MeV: 1.5, value: 0.10 },
            { energy_MeV: 2.0, value: 0.09 },
            { energy_MeV: 3.0, value: 0.07 },
        ],
        buildup: [
            { energy_MeV: 0.5, A: 12.5, alpha1: -0.06, alpha2: 0.03 },
            { energy_MeV: 1.0, A: 9.9, alpha1: -0.07, alpha2: 0.01 },
            { energy_MeV: 2.0, A: 7.0, alpha1: -0.06, alpha2: 0.005 },
            { energy_MeV: 3.0, A: 5.8, alpha1: -0.05, alpha2: 0.003 },
        ],
    }
];
