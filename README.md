# Assistant ISO 11929 : Un Outil Complet pour l'Analyse des Mesures Nucléaires

L'Assistant ISO 11929 est une application web et de bureau conçue pour rendre la norme ISO 11929 accessible et applicable pour les étudiants, techniciens, ingénieurs et chercheurs dans le domaine du nucléaire. Il simplifie les calculs complexes des limites caractéristiques et offre des outils de visualisation et d'analyse puissants.

---

<details>
<summary><strong>English Version</strong></summary>

## ISO 11929 Assistant: A Comprehensive Tool for Nuclear Measurement Analysis

The ISO 11929 Assistant is a web and desktop application designed to make the ISO 11929 standard accessible and applicable for students, technicians, engineers, and researchers in the nuclear field. It simplifies the complex calculations of characteristic limits and provides powerful visualization and analysis tools.

### Key Features

*   **ISO 11929 Calculations**: Accurately computes decision threshold (y*), detection limit (y#), and best estimate confidence intervals.
*   **Multiple Analysis Modes**:
    *   **Standard**: For basic gross and background count measurements.
    *   **Spectrometry**: For ROI-based analysis, with background scaling.
    *   **Surface Control**: For calculations related to surface contamination checks, targeting activity per area (e.g., Bq/cm²).
    *   **Chamber/Tunnel**: For fixed measurement systems like portals with a set measurement time.
    *   **Laundry Control**: For conveyor-based systems where measurement time depends on speed and detector size.
*   **Interactive Visualization**: Dynamically generated charts display statistical distributions (H₀, H₁, and measurement) to provide a clear visual understanding of the results.
*   **Advanced Expert Mode**:
    *   **Monte Carlo Simulation**: A robust method for uncertainty propagation, ideal for low-count scenarios.
    *   **Correlation Coefficient**: Allows accounting for dependencies between background and calibration uncertainties.
*   **Advanced Spectrum Analyzer**: An innovative tool to **load a spectrum *image*** or **an ANSI N42.42 file**, perform an interactive energy calibration, and automatically detect and identify radionuclide peaks.
*   **High-Precision Gamma Library**: Peak identification is powered by a high-quality radionuclide library sourced from the **BIPM's "Table of Radionuclides"**, ensuring accurate and reliable results.
*   **Utility Tools**:
    *   **Decay Calculator**: Corrects calibration source activity over time.
    *   **Peak Identifier**: Quickly finds potential nuclides from a list of energies.
*   **Data Management**: Save and load complete measurement configurations as JSON files for reproducibility and sharing.
*   **Multilingual Support**: Fully available in English, French, German, and Spanish.

### Target Audience

*   **Students**: To learn and visualize the statistical concepts behind the standard.
*   **Technicians**: For rapid and reliable calculation of characteristic limits in daily operations.
*   **Engineers**: To design and validate measurement protocols and run advanced simulations.
*   **Researchers**: For a transparent and documented tool for data analysis and reporting.

### Getting Started

1.  **Prerequisites**: Node.js and npm installed.
2.  **Installation**: `npm install`
3.  **Run Development**: `npm run start-electron`

### Build & Deployment

*   **Deploy for Web (GitHub Pages)**: `npm run deploy`
*   **Package for Desktop (Windows, macOS, Linux)**: `npm run dist`

</details>

---

<details>
<summary><strong>Version Française</strong></summary>

## Assistant ISO 11929 : Un Outil Complet pour l'Analyse des Mesures Nucléaires

L'Assistant ISO 11929 est une application web et de bureau conçue pour rendre la norme ISO 11929 accessible et applicable pour les étudiants, techniciens, ingénieurs et chercheurs dans le domaine du nucléaire. Il simplifie les calculs complexes des limites caractéristiques et offre des outils de visualisation et d'analyse puissants.

### Fonctionnalités Clés

*   **Calculs ISO 11929**: Calcule avec précision le seuil de décision (y*), la limite de détection (y#) et les intervalles de confiance de la meilleure estimation.
*   **Modes d'Analyse Multiples**:
    *   **Standard**: Pour les mesures de base de comptage brut et de bruit de fond.
    *   **Spectrométrie**: Pour l'analyse basée sur une Région d'Intérêt (ROI), avec mise à l'échelle du bruit de fond.
    *   **Contrôle de Surface**: Pour les calculs liés au contrôle de contamination surfacique, visant une activité par surface (ex: Bq/cm²).
    *   **Chambre/Tunnel**: Pour les systèmes de mesure fixes comme les portiques, avec un temps de mesure fixe.
    *   **Contrôle Linge**: Pour les systèmes à convoyeur, où le temps de mesure dépend de la vitesse et de la taille du détecteur.
*   **Visualisation Interactive**: Des graphiques générés dynamiquement affichent les distributions statistiques (H₀, H₁ et mesure) pour une compréhension visuelle claire des résultats.
*   **Mode Expert Avancé**:
    *   **Simulation de Monte Carlo**: Une méthode robuste pour la propagation des incertitudes, idéale pour les scénarios à faible comptage.
    *   **Coefficient de Corrélation**: Permet de tenir compte des dépendances entre les incertitudes du bruit de fond et de l'étalonnage.
*   **Analyseur de Spectre Avancé**: Un outil innovant pour **charger une *image* de spectre** ou **un fichier ANSI N42.42**, effectuer un étalonnage en énergie interactif, et détecter et identifier automatiquement les pics de radionucléides.
*   **Bibliothèque Gamma de Haute Précision**: L'identification des pics est basée sur une bibliothèque de radionucléides de haute qualité provenant de la **"Table des Radionucléides" du BIPM**, garantissant des résultats précis et fiables.
*   **Outils Utilitaires**:
    *   **Calculateur de Décroissance**: Corrige l'activité des sources d'étalonnage dans le temps.
    *   **Identificateur de Pics**: Trouve rapidement les nucléides potentiels à partir d'une liste d'énergies.
*   **Gestion des Données**: Sauvegardez et chargez des configurations de mesure complètes sous forme de fichiers JSON pour la reproductibilité et le partage.
*   **Support Multilingue**: Entièrement disponible en français, anglais, allemand et espagnol.

### Public Cible

*   **Étudiants**: Pour apprendre et visualiser les concepts statistiques derrière la norme.
*   **Techniciens**: Pour un calcul rapide et fiable des limites caractéristiques dans les opérations quotidiennes.
*   **Ingénieurs**: Pour concevoir et valider des protocoles de mesure et effectuer des simulations avancées.
*   **Chercheurs**: Pour un outil transparent et documenté pour l'analyse de données et la rédaction de rapports.

### Démarrage

1.  **Prérequis**: Node.js et npm installés.
2.  **Installation**: `npm install`
3.  **Lancer en Développement**: `npm run start-electron`

### Compilation et Déploiement

*   **Déployer pour le Web (GitHub Pages)**: `npm run deploy`
*   **Créer l'exécutable (Windows, macOS, Linux)**: `npm run dist`

</details>

---

<details>
<summary><strong>Deutsche Version</strong></summary>

## ISO 11929 Assistent: Ein umfassendes Werkzeug zur Analyse nuklearer Messungen

Der ISO 11929 Assistent ist eine Web- und Desktop-Anwendung, die entwickelt wurde, um die Norm ISO 11929 für Studenten, Techniker, Ingenieure und Forscher im Nuklearbereich zugänglich und anwendbar zu machen. Sie vereinfacht die komplexen Berechnungen von charakteristischen Grenzen und bietet leistungsstarke Visualisierungs- und Analysewerkzeuge.

### Hauptmerkmale

*   **ISO 11929 Berechnungen**: Berechnet präzise die Erkennungsgrenze (y*), die Nachweisgrenze (y#) und Konfidenzintervalle für den besten Schätzwert.
*   **Mehrere Analysemodi**:
    *   **Standard**: Für einfache Brutto- und Nulleffektmessungen.
    *   **Spektrometrie**: Für ROI-basierte Analysen mit Skalierung des Hintergrunds.
    *   **Oberflächenkontrolle**: Für Berechnungen im Zusammenhang mit der Oberflächenkontaminationskontrolle, die auf eine flächenbezogene Aktivität abzielen (z. B. Bq/cm²).
    *   **Kammer/Tunnel**: Für feste Messsysteme wie Portale mit einer festgelegten Messzeit.
    *   **Wäschekontrolle**: Für förderbandbasierte Systeme, bei denen die Messzeit von der Geschwindigkeit und der Detektorgröße abhängt.
*   **Interaktive Visualisierung**: Dynamisch erzeugte Diagramme zeigen statistische Verteilungen (H₀, H₁ und Messung) für ein klares visuelles Verständnis der Ergebnisse.
*   **Erweiterter Expertenmodus**:
    *   **Monte-Carlo-Simulation**: Eine robuste Methode zur Unsicherheitsfortpflanzung, ideal für Szenarien mit niedrigen Zählraten.
    *   **Korrelationskoeffizient**: Ermöglicht die Berücksichtigung von Abhängigkeiten zwischen Hintergrund- und Kalibrierunsicherheiten.
*   **Fortschrittlicher Spektrumanalysator**: Ein innovatives Werkzeug zum **Laden eines Spektrum-*Bildes*** oder **einer ANSI N42.42-Datei**, zur interaktiven Energiekalibrierung sowie zur automatischen Erkennung und Identifizierung von Radionuklid-Peaks.
*   **Hochpräzise Gamma-Bibliothek**: Die Peak-Identifizierung wird durch eine hochwertige Radionuklid-Bibliothek unterstützt, die aus der **"Table of Radionuclides" des BIPM** stammt und genaue und zuverlässige Ergebnisse gewährleistet.
*   **Hilfswerkzeuge**:
    *   **Zerfallsrechner**: Korrigiert die Aktivität von Kalibrierquellen über die Zeit.
    *   **Peak-Identifikator**: Findet schnell potenzielle Nuklide aus einer Energieliste.
*   **Datenverwaltung**: Speichern und laden Sie vollständige Messkonfigurationen als JSON-Dateien für Reproduzierbarkeit und Austausch.
*   **Mehrsprachige Unterstützung**: Vollständig verfügbar in Englisch, Französisch, Deutsch und Spanisch.

### Zielgruppe

*   **Studenten**: Zum Erlernen und Visualisieren der statistischen Konzepte hinter der Norm.
*   **Techniker**: Für die schnelle und zuverlässige Berechnung charakteristischer Grenzen im täglichen Betrieb.
*   **Ingenieure**: Zum Entwerfen und Validieren von Messprotokollen und zur Durchführung fortgeschrittener Simulationen.
*   **Forscher**: Für ein transparentes und dokumentiertes Werkzeug zur Datenanalyse und Berichterstattung.

### Erste Schritte

1.  **Voraussetzungen**: Node.js und npm installiert.
2.  **Installation**: `npm install`
3.  **Entwicklung starten**: `npm run start-electron`

### Build & Bereitstellung

*   **Für das Web bereitstellen (GitHub Pages)**: `npm run deploy`
*   **Für den Desktop paketieren (Windows, macOS, Linux)**: `npm run dist`

</details>

---

<details>
<summary><strong>Versión en Español</strong></summary>

## Asistente ISO 11929: Una Herramienta Completa para el Análisis de Mediciones Nucleares

El Asistente ISO 11929 es una aplicación web y de escritorio diseñada para hacer que la norma ISO 11929 sea accesible y aplicable para estudiantes, técnicos, ingenieros e investigadores en el campo nuclear. Simplifica los complejos cálculos de los límites característicos y ofrece potentes herramientas de visualización y análisis.

### Características Principales

*   **Cálculos ISO 11929**: Calcula con precisión el umbral de decisión (y*), el límite de detección (y#) y los intervalos de confianza de la mejor estimación.
*   **Múltiples Modos de Análisis**:
    *   **Estándar**: Para mediciones básicas de cuentas brutas y de fondo.
    *   **Espectrometría**: Para análisis basados en una Región de Interés (ROI), con escalado del fondo.
    *   **Control de Superficie**: Para cálculos relacionados con el control de la contaminación superficial, con un objetivo de actividad por área (p. ej., Bq/cm²).
    *   **Cámara/Túnel**: Para sistemas de medición fijos como pórticos con un tiempo de medición establecido.
    *   **Control de Lavandería**: Para sistemas con cinta transportadora, donde el tiempo de medición depende de la velocidad y el tamaño del detector.
*   **Visualización Interactiva**: Gráficos generados dinámicamente que muestran las distribuciones estadísticas (H₀, H₁ y medición) para una clara comprensión visual de los resultados.
*   **Modo Experto Avanzado**:
    *   **Simulación de Monte Carlo**: Un método robusto para la propagación de incertidumbres, ideal para escenarios de bajo conteo.
    *   **Coeficiente de Correlación**: Permite tener en cuenta las dependencias entre las incertidumbres del fondo y la calibración.
*   **Analizador de Espectros Avanzado**: Una herramienta innovadora para **cargar una *imagen* de espectro** o **un archivo ANSI N42.42**, realizar una calibración de energía interactiva y detectar e identificar automáticamente picos de radionucleidos.
*   **Biblioteca Gamma de Alta Precisión**: La identificación de picos se basa en una biblioteca de radionucleidos de alta calidad extraída de la **"Table of Radionuclides" del BIPM**, garantizando resultados precisos y fiables.
*   **Herramientas de Utilidad**:
    *   **Calculadora de Decaimiento**: Corrige la actividad de las fuentes de calibración a lo largo del tiempo.
    *   **Identificador de Picos**: Encuentra rápidamente posibles nucleidos a partir de una lista de energías.
*   **Gestión de Datos**: Guarde y cargue configuraciones de medición completas como archivos JSON para reproducibilidad y fácil compartición.
*   **Soporte Multilingüe**: Totalmente disponible en español, inglés, francés y alemán.

### Público Objetivo

*   **Estudiantes**: Para aprender y visualizar los conceptos estadísticos detrás de la norma.
*   **Técnicos**: Para el cálculo rápido y fiable de los límites característicos en las operaciones diarias.
*   **Ingenieros**: Para diseñar y validar protocolos de medición y ejecutar simulaciones avanzadas.
*   **Investigadores**: Para una herramienta transparente y documentada para el análisis de datos y la elaboración de informes.

### Cómo Empezar

1.  **Requisitos**: Node.js y npm instalados.
2.  **Instalación**: `npm install`
3.  **Ejecutar en Desarrollo**: `npm run start-electron`

### Compilación y Despliegue

*   **Desplegar para la Web (GitHub Pages)**: `npm run deploy`
*   **Empaquetar para Escritorio (Windows, macOS, Linux)**: `npm run dist`

</details>