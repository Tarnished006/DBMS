export type FarmingRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type FarmingRiskType =
  | 'RAINFALL'
  | 'WIND'
  | 'HEAT'
  | 'UV'
  | 'SPRAYING'
  | 'IRRIGATION';

export interface RiskDetailDto {
  riskType: FarmingRiskType;
  score: number;
  level: FarmingRiskLevel;
  reason: string;
  recommendation: string;
}

export interface FarmingRiskDto {
  date: string;
  overallScore: number;
  overallLevel: FarmingRiskLevel;
  risks: {
    rainfall: RiskDetailDto;
    wind: RiskDetailDto;
    heat: RiskDetailDto;
    uv: RiskDetailDto;
    spraying: RiskDetailDto;
    irrigation: RiskDetailDto;
  };
  summary: string;
}

function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function determineRiskLevel(score: number): FarmingRiskLevel {
  const norm = normalizeScore(score);
  if (norm >= 80) return 'CRITICAL';
  if (norm >= 60) return 'HIGH';
  if (norm >= 30) return 'MODERATE';
  return 'LOW';
}

export function calculateRainfallScore(
  precipitationProbability: number = 0,
  precipitation: number = 0
): number {
  let probScore = 10;
  if (precipitationProbability >= 80) probScore = 100;
  else if (precipitationProbability >= 60) probScore = 80;
  else if (precipitationProbability >= 40) probScore = 55;
  else if (precipitationProbability >= 20) probScore = 30;

  let precipScore = 0;
  if (precipitation > 50) precipScore = 100;
  else if (precipitation > 25) precipScore = 90;
  else if (precipitation > 10) precipScore = 70;
  else if (precipitation > 2) precipScore = 40;
  else if (precipitation > 0) precipScore = 15;

  return normalizeScore(probScore * 0.45 + precipScore * 0.55);
}

export function calculateWindScore(windSpeed: number = 0, windGusts: number = 0): number {
  let speedScore = 10;
  if (windSpeed > 50) speedScore = 100;
  else if (windSpeed > 35) speedScore = 85;
  else if (windSpeed > 20) speedScore = 60;
  else if (windSpeed > 10) speedScore = 30;

  let gustScore = 10;
  if (windGusts > 70) gustScore = 100;
  else if (windGusts > 50) gustScore = 85;
  else if (windGusts > 35) gustScore = 65;
  else if (windGusts > 20) gustScore = 35;

  return normalizeScore(speedScore * 0.55 + gustScore * 0.45);
}

export function calculateHeatScore(
  maximumTemperature: number = 28,
  maximumApparentTemperature: number = 28
): number {
  let tempScore = 10;
  if (maximumTemperature > 40) tempScore = 100;
  else if (maximumTemperature > 35) tempScore = 80;
  else if (maximumTemperature > 30) tempScore = 55;
  else if (maximumTemperature > 25) tempScore = 25;

  let appScore = 10;
  if (maximumApparentTemperature > 44) appScore = 100;
  else if (maximumApparentTemperature > 38) appScore = 85;
  else if (maximumApparentTemperature > 32) appScore = 60;
  else if (maximumApparentTemperature > 26) appScore = 30;

  return normalizeScore(tempScore * 0.6 + appScore * 0.4);
}

export function calculateUvScore(uvIndex: number = 5): number {
  if (uvIndex > 10) return 100;
  if (uvIndex > 7) return 85;
  if (uvIndex > 5) return 60;
  if (uvIndex > 2) return 30;
  return 10;
}

export function calculateSprayingScore(
  windSpeed: number = 0,
  windGusts: number = 0,
  prob: number = 0,
  precip: number = 0,
  humidity: number = 60
): number {
  const windScore = calculateWindScore(windSpeed, windGusts);
  const rainScore = calculateRainfallScore(prob, precip);
  let humScore = 20;
  if (humidity < 40) humScore = 70; // Too dry, rapid droplet evaporation
  else if (humidity > 85) humScore = 60; // Too wet, risk of runoff

  return normalizeScore(windScore * 0.45 + rainScore * 0.45 + humScore * 0.1);
}

export function calculateIrrigationScore(
  precip: number = 0,
  prob: number = 0,
  maxTemp: number = 28,
  et0: number = 4,
  soilMoisture: number = 0.3
): number {
  const rainScore = calculateRainfallScore(prob, precip);
  const irrigationDemand = 100 - rainScore;

  let et0Score = 30;
  if (et0 > 7) et0Score = 90;
  else if (et0 > 5) et0Score = 65;
  else if (et0 > 3) et0Score = 40;

  let soilScore = 30;
  if (soilMoisture < 0.15) soilScore = 90; // Deficit
  else if (soilMoisture < 0.25) soilScore = 60;
  else if (soilMoisture > 0.45) soilScore = 15; // Waterlogged

  return normalizeScore(irrigationDemand * 0.4 + et0Score * 0.3 + soilScore * 0.3);
}

export function computeDailyFarmingRisk(
  date: string,
  data: {
    precipitationProbability?: number;
    precipitation?: number;
    windSpeed?: number;
    windGusts?: number;
    maxTemperature?: number;
    maxApparentTemperature?: number;
    uvIndex?: number;
    humidity?: number;
    et0?: number;
    soilMoisture?: number;
  }
): FarmingRiskDto {
  const rainScore = calculateRainfallScore(data.precipitationProbability, data.precipitation);
  const rainLevel = determineRiskLevel(rainScore);
  const rainfallRisk: RiskDetailDto = {
    riskType: 'RAINFALL',
    score: rainScore,
    level: rainLevel,
    reason:
      rainLevel === 'CRITICAL' || rainLevel === 'HIGH'
        ? 'Heavy rainfall forecast likely to cause field waterlogging and nutrient runoff.'
        : 'Favorable precipitation conditions with minimal flood risk.',
    recommendation:
      rainLevel === 'CRITICAL' || rainLevel === 'HIGH'
        ? 'Clear drainage channels and suspend scheduled fertilizer applications.'
        : 'Proceed with normal fieldwork and standard soil maintenance.',
  };

  const windScore = calculateWindScore(data.windSpeed, data.windGusts);
  const windLevel = determineRiskLevel(windScore);
  const windRisk: RiskDetailDto = {
    riskType: 'WIND',
    score: windScore,
    level: windLevel,
    reason:
      windLevel === 'CRITICAL' || windLevel === 'HIGH'
        ? 'Strong winds and gusts could cause crop lodging and physical branch damage.'
        : 'Gentle air movement conducive to canopy aeration without crop stress.',
    recommendation:
      windLevel === 'CRITICAL' || windLevel === 'HIGH'
        ? 'Stake tall crops and secure nursery greenhouses immediately.'
        : 'Safe for open-field operations.',
  };

  const heatScore = calculateHeatScore(data.maxTemperature, data.maxApparentTemperature);
  const heatLevel = determineRiskLevel(heatScore);
  const heatRisk: RiskDetailDto = {
    riskType: 'HEAT',
    score: heatScore,
    level: heatLevel,
    reason:
      heatLevel === 'CRITICAL' || heatLevel === 'HIGH'
        ? 'High temperatures create thermal stress and accelerate evapotranspiration.'
        : 'Optimal thermal range for active photosynthesis and crop growth.',
    recommendation:
      heatLevel === 'CRITICAL' || heatLevel === 'HIGH'
        ? 'Apply light evening irrigation or shade netting for vulnerable seedlings.'
        : 'Normal crop development conditions.',
  };

  const uvScore = calculateUvScore(data.uvIndex);
  const uvLevel = determineRiskLevel(uvScore);
  const uvRisk: RiskDetailDto = {
    riskType: 'UV',
    score: uvScore,
    level: uvLevel,
    reason:
      uvLevel === 'CRITICAL' || uvLevel === 'HIGH'
        ? 'Intense solar radiation may cause leaf scorch and heat shock.'
        : 'Healthy solar irradiation suitable for vegetative growth.',
    recommendation:
      uvLevel === 'CRITICAL' || uvLevel === 'HIGH'
        ? 'Schedule manual fieldwork during early mornings or late afternoons.'
        : 'No specific solar protection required.',
  };

  const sprayScore = calculateSprayingScore(
    data.windSpeed,
    data.windGusts,
    data.precipitationProbability,
    data.precipitation,
    data.humidity
  );
  const sprayLevel = determineRiskLevel(sprayScore);
  const sprayingRisk: RiskDetailDto = {
    riskType: 'SPRAYING',
    score: sprayScore,
    level: sprayLevel,
    reason:
      sprayLevel === 'CRITICAL' || sprayLevel === 'HIGH'
        ? 'Weather conditions will cause chemical drift or immediate rain wash-off.'
        : 'Favorable calm window for efficient pesticide and foliar spraying.',
    recommendation:
      sprayLevel === 'CRITICAL' || sprayLevel === 'HIGH'
        ? 'Postpone chemical spraying until wind subsides and rain clears.'
        : 'Optimal window for foliar feeding and pest management.',
  };

  const irrigScore = calculateIrrigationScore(
    data.precipitation,
    data.precipitationProbability,
    data.maxTemperature,
    data.et0,
    data.soilMoisture
  );
  const irrigLevel = determineRiskLevel(irrigScore);
  const irrigationRisk: RiskDetailDto = {
    riskType: 'IRRIGATION',
    score: irrigScore,
    level: irrigLevel,
    reason:
      irrigScore > 65
        ? 'High moisture deficit: crops require immediate supplementary water.'
        : irrigScore < 30
        ? 'Sufficient soil moisture available from natural precipitation.'
        : 'Moderate moisture levels.',
    recommendation:
      irrigScore > 65
        ? 'Schedule drip or furrow irrigation to replenish root-zone moisture.'
        : irrigScore < 30
        ? 'Pause irrigation to conserve power and avoid root waterlogging.'
        : 'Monitor topsoil moisture before next watering cycle.',
  };

  // Weighted overall calculation
  let weighted = Math.round(
    rainScore * 0.2 +
      windScore * 0.15 +
      heatScore * 0.15 +
      uvScore * 0.1 +
      sprayScore * 0.2 +
      irrigScore * 0.2
  );

  // Critical overrides
  const maxIndividual = Math.max(rainScore, windScore, heatScore, uvScore, sprayScore);
  if (maxIndividual >= 90) {
    weighted = Math.max(weighted, 85);
  } else if (maxIndividual >= 75) {
    weighted = Math.max(weighted, 65);
  }

  const overallScore = normalizeScore(weighted);
  const overallLevel = determineRiskLevel(overallScore);

  let summary = 'General agricultural conditions are favorable across the region.';
  if (overallLevel === 'CRITICAL') {
    summary = 'Severe weather risks detected. Take immediate preventative protective measures.';
  } else if (overallLevel === 'HIGH') {
    summary = 'Elevated operational farming risks. Adjust spraying and irrigation plans accordingly.';
  } else if (overallLevel === 'MODERATE') {
    summary = 'Moderate conditions. Routine agronomic monitoring advised.';
  }

  return {
    date,
    overallScore,
    overallLevel,
    risks: {
      rainfall: rainfallRisk,
      wind: windRisk,
      heat: heatRisk,
      uv: uvRisk,
      spraying: sprayingRisk,
      irrigation: irrigationRisk,
    },
    summary,
  };
}
