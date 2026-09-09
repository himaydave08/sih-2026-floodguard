import { SectorData } from '../types';
import { ASSAM_SECTORS } from '../data/assamData';

export const riskService = {
  getAllSectors: (): Record<string, SectorData> => {
    return ASSAM_SECTORS;
  },

  getSectorRisk: async (sectorId: string, forecastHour: number = 0): Promise<SectorData> => {
    // Simulate brief network / model inference delay when switching
    await new Promise((resolve) => setTimeout(resolve, 250));

    const baseSector = ASSAM_SECTORS[sectorId] || ASSAM_SECTORS['dhemaji'];
    if (forecastHour === 0) {
      return baseSector;
    }

    const step = baseSector.timeline.find((t) => t.hour === forecastHour);
    if (!step) return baseSector;

    return {
      ...baseSector,
      vulnerabilityIndex: step.riskScore,
      hazardLevel: step.riskLevel,
      floodProb: step.floodProbability,
      inundationAreaKm2: step.inundationAreaKm2,
      populationAtRisk: step.populationAtRisk,
      stageAbsolute: step.riverStageM,
    };
  },

  getGlobalRiskStats: () => {
    const sectors = Object.values(ASSAM_SECTORS);
    const criticalCount = sectors.filter((s) => s.hazardLevel === 'CRITICAL' || s.hazardLevel === 'HIGH').length;
    const totalPopAtRisk = sectors.reduce((acc, s) => acc + s.populationAtRisk, 0);
    const totalInundationKm2 = sectors.reduce((acc, s) => acc + s.inundationAreaKm2, 0);
    return {
      activeSectorsCount: sectors.length,
      highRiskDistricts: criticalCount,
      totalPopAtRisk,
      totalInundationKm2: Math.round(totalInundationKm2),
      cwcMonitoringStations: 10,
    };
  }
};
