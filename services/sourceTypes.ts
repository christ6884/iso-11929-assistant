import { SourceType } from '../types';

// Based on D455019010306 - TYPOLOGIE ET UTILISATION DES SOURCES METROLOGIE SUR CNPE
// Bq values are derived from kBq/MBq in the document.

export const sourceTypes: SourceType[] = [
    {
        key: 'S1',
        description: 'S1 - Étalonnage détecteurs gamma (50-150 kBq)',
        nuclide: 'Cobalt-60 (Co-60)',
        minActivityBq: 50000,
        maxActivityBq: 150000,
    },
    {
        key: 'S2',
        description: 'S2 - Étalonnage détecteurs gamma (10-30 kBq)',
        nuclide: 'Cobalt-60 (Co-60)',
        minActivityBq: 10000,
        maxActivityBq: 30000,
    },
    {
        key: 'S3',
        description: 'S3 - Étalonnage contaminamètres beta (1-4 kBq)',
        nuclide: 'Cobalt-60 (Co-60)',
        minActivityBq: 1000,
        maxActivityBq: 4000,
    },
    {
        key: 'S4',
        description: 'S4 - Étalonnage contaminamètres beta (2-8 kBq)',
        nuclide: 'Cobalt-60 (Co-60)',
        minActivityBq: 2000,
        maxActivityBq: 8000,
    },
    {
        key: 'S5',
        description: 'S5 - Étalonnage C3 piétons (3-6 kBq)',
        nuclide: 'Cobalt-60 (Co-60)',
        minActivityBq: 3000,
        maxActivityBq: 6000,
    },
    {
        key: 'S6',
        description: 'S6 - Test alarmes portiques véhicules C3 (0.5-1.5 MBq)',
        nuclide: 'Cobalt-60 (Co-60)',
        minActivityBq: 500000,
        maxActivityBq: 1500000,
    },
    {
        key: 'S7',
        description: 'S7 - Test déclenchement contaminamètres (1-4 kBq)',
        nuclide: 'Cobalt-60 (Co-60)',
        minActivityBq: 1000,
        maxActivityBq: 4000,
    },
    {
        key: 'S14',
        description: 'S14 - Contrôle réjection beta contaminamètres alpha (2-8 kBq)',
        nuclide: 'Strontium-90 (Sr-90)',
        minActivityBq: 2000,
        maxActivityBq: 8000,
    },
    {
        key: 'S15',
        description: 'S15 - Étalonnage détecteurs scintillation (10-100 kBq)',
        nuclide: 'Barium-133 (Ba-133)',
        minActivityBq: 10000,
        maxActivityBq: 100000,
    },
     {
        key: 'S16',
        description: 'S16 - Étalonnage détecteurs scintillation (10-40 kBq)',
        nuclide: 'Cesium-137 (Cs-137)',
        minActivityBq: 10000,
        maxActivityBq: 40000,
    }
];