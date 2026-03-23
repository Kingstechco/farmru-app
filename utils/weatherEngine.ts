// ============================================================
// Farmru Weather Advisory Engine
// Provides 7-day forecast data enriched with rainfall (mm),
// humidity, wind speed, and a predictive advisory generator
// that converts weather patterns into actionable farm guidance.
// ============================================================

export type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'light-rain' | 'moderate-rain' | 'heavy-rain' | 'thunderstorm';

export interface ForecastDay {
  day: string;
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: WeatherCondition;
  rainMm: number;          // Expected rainfall in millimetres
  rainProbability: number; // 0-100 %
  humidity: number;        // 0-100 %
  windKph: number;
  icon: string;            // MaterialIcon name
  iconColor: string;
}

export type AdvisoryUrgency = 'critical' | 'warning' | 'info' | 'positive';

export interface Advisory {
  id: string;
  urgency: AdvisoryUrgency;
  icon: string;
  title: string;
  detail: string;
  dayReference?: string;   // e.g. "Thursday"
  actions: string[];       // Concrete recommended steps
}

// ── 7-day forecast data ─────────────────────────────────────
export const WEATHER_FORECAST: ForecastDay[] = [
  {
    day: 'Mon', date: '24 Mar',
    tempHigh: 24, tempLow: 16,
    condition: 'sunny',
    rainMm: 0, rainProbability: 5,
    humidity: 45, windKph: 12,
    icon: 'wb-sunny', iconColor: '#fbbf24',
  },
  {
    day: 'Tue', date: '25 Mar',
    tempHigh: 26, tempLow: 17,
    condition: 'partly-cloudy',
    rainMm: 2, rainProbability: 20,
    humidity: 52, windKph: 15,
    icon: 'wb-cloudy', iconColor: '#94a3b8',
  },
  {
    day: 'Wed', date: '26 Mar',
    tempHigh: 22, tempLow: 15,
    condition: 'cloudy',
    rainMm: 8, rainProbability: 50,
    humidity: 68, windKph: 18,
    icon: 'cloud', iconColor: '#64748b',
  },
  {
    day: 'Thu', date: '27 Mar',
    tempHigh: 19, tempLow: 13,
    condition: 'heavy-rain',
    rainMm: 38, rainProbability: 90,
    humidity: 88, windKph: 28,
    icon: 'thunderstorm', iconColor: '#3b82f6',
  },
  {
    day: 'Fri', date: '28 Mar',
    tempHigh: 21, tempLow: 14,
    condition: 'light-rain',
    rainMm: 12, rainProbability: 60,
    humidity: 76, windKph: 14,
    icon: 'grain', iconColor: '#38bdf8',
  },
  {
    day: 'Sat', date: '29 Mar',
    tempHigh: 23, tempLow: 15,
    condition: 'partly-cloudy',
    rainMm: 0, rainProbability: 10,
    humidity: 58, windKph: 10,
    icon: 'wb-cloudy', iconColor: '#94a3b8',
  },
  {
    day: 'Sun', date: '30 Mar',
    tempHigh: 25, tempLow: 16,
    condition: 'sunny',
    rainMm: 0, rainProbability: 5,
    humidity: 42, windKph: 8,
    icon: 'wb-sunny', iconColor: '#fbbf24',
  },
];

// ── Advisory colours per urgency ────────────────────────────
export const ADVISORY_COLORS: Record<AdvisoryUrgency, string> = {
  critical: '#ef4444',
  warning:  '#f59e0b',
  info:     '#38bdf8',
  positive: '#10b981',
};

// ── Core advisory generator ──────────────────────────────────
export function generateAdvisories(forecast: ForecastDay[]): Advisory[] {
  const advisories: Advisory[] = [];
  const today      = forecast[0];
  const next2days  = forecast.slice(0, 2);
  const next5days  = forecast.slice(0, 5);

  const heavyRainSoon = next2days.find(d => d.rainMm >= 20);
  const heavyRain5d   = next5days.find(d => d.rainMm >= 30);
  const fertWindow    = forecast.find(d => d.rainMm >= 5 && d.rainMm < 20 && d.rainProbability > 40);
  const hotDryDays    = next5days.filter(d => d.tempHigh >= 32 && d.rainMm === 0);
  const bigRainDay    = forecast.find(d => d.rainMm >= 40);
  const clearWeek     = forecast.every(d => d.rainMm < 3);

  // 1. Imminent heavy rain — irrigation/drainage advisory
  if (heavyRainSoon) {
    advisories.push({
      id: 'heavy-rain-irrigation',
      urgency: 'critical',
      icon: 'storm',
      title: `Heavy Rain on ${heavyRainSoon.day} — Stop Irrigation Now`,
      detail: `${heavyRainSoon.rainMm}mm expected with ${heavyRainSoon.rainProbability}% probability. Applying more water now risks waterlogged roots, disease, and runoff waste.`,
      dayReference: heavyRainSoon.day,
      actions: [
        'Suspend all irrigation systems until Friday',
        'Check and clear drainage channels today',
        'Protect young seedlings from heavy impact',
        'Apply pre-emptive fungicide if crops are susceptible',
      ],
    });
  }

  // 2. Flood risk from very large rainfall
  if (bigRainDay && bigRainDay.rainMm >= 40) {
    advisories.push({
      id: 'flood-risk',
      urgency: 'critical',
      icon: 'flood',
      title: `Flood Risk — ${bigRainDay.rainMm}mm on ${bigRainDay.day}`,
      detail: `Extreme rainfall event predicted. Soil saturation and surface flooding likely for low-lying fields.`,
      dayReference: bigRainDay.day,
      actions: [
        'Inspect and reinforce field drainage banks',
        'Harvest any ready crops before the event',
        'Move equipment and supplies to higher ground',
        'Set up manual pump readiness for rapid drainage',
      ],
    });
  }

  // 3. Fertiliser application window (moderate rain = good absorption)
  if (fertWindow && !heavyRainSoon) {
    advisories.push({
      id: 'fert-window',
      urgency: 'positive',
      icon: 'eco',
      title: `Apply Fertilizer Before ${fertWindow.day}'s Rain`,
      detail: `${fertWindow.rainMm}mm light rain on ${fertWindow.day} creates an ideal uptake window. Nutrients applied now will be absorbed efficiently without runoff.`,
      dayReference: fertWindow.day,
      actions: [
        `Apply nitrogen-rich fertilizer today or tomorrow`,
        'Target fields with low NPK readings first',
        'Maintain a 2-hour buffer before expected rain start',
        'Avoid application if wind exceeds 25 kph',
      ],
    });
  }

  // 4. Heat stress with no rain
  if (hotDryDays.length >= 3) {
    advisories.push({
      id: 'heat-stress',
      urgency: 'warning',
      icon: 'thermostat',
      title: `${hotDryDays.length}-Day Heat Event — Activate Irrigation`,
      detail: `Temperatures above 32°C with no rain forecast for ${hotDryDays.length} days. Crop transpiration will exceed natural soil moisture. Act now.`,
      actions: [
        'Increase irrigation frequency by 30%',
        'Water at dawn or dusk to minimize evaporation',
        'Apply mulch to retain soil moisture',
        'Monitor for heat stress symptoms (leaf curl, brown edges)',
      ],
    });
  }

  // 5. Extended dry spell across the full week
  if (clearWeek && !heavyRainSoon) {
    advisories.push({
      id: 'dry-week',
      urgency: 'info',
      icon: 'water-drop',
      title: 'Dry Week Ahead — Increase Irrigation Schedule',
      detail: 'No significant rain expected this week. Based on current moisture levels and temperatures, proactive irrigation is advised.',
      actions: [
        'Activate drip irrigation for vegetable rows',
        'Schedule sprinkler runs every 2 days for maize',
        'Monitor soil moisture sensor readings daily',
        'Prioritize fields with the lowest moisture readings',
      ],
    });
  }

  // 6. Good planting or spray conditions
  const sprayWindow = forecast.find(d => d.windKph < 15 && d.rainProbability < 20 && d.tempHigh < 30);
  if (sprayWindow && !heavyRainSoon) {
    advisories.push({
      id: 'spray-window',
      urgency: 'positive',
      icon: 'spa',
      title: `Ideal Spray Conditions on ${sprayWindow.day}`,
      detail: `Low wind (${sprayWindow.windKph} kph), minimal rain risk, and mild temperature on ${sprayWindow.day} provide optimal pesticide/herbicide application conditions.`,
      dayReference: sprayWindow.day,
      actions: [
        `Schedule pesticide applications for ${sprayWindow.day} morning`,
        'Calibrate sprayer nozzles for low-drift operation',
        'Wear appropriate PPE — UV index will be moderate',
      ],
    });
  }

  // 7. High humidity disease risk
  const highHumidDay = next5days.find(d => d.humidity >= 80);
  if (highHumidDay) {
    advisories.push({
      id: 'disease-risk',
      urgency: 'warning',
      icon: 'coronavirus',
      title: `High Humidity on ${highHumidDay.day} — Disease Risk`,
      detail: `${highHumidDay.humidity}% humidity creates conditions for fungal and bacterial crop diseases including blight and powdery mildew.`,
      dayReference: highHumidDay.day,
      actions: [
        'Apply preventive fungicide before humidity peaks',
        'Ensure adequate air circulation in tunnel crops',
        'Scout fields for early disease signs post-rain',
      ],
    });
  }

  // Sort: critical → warning → positive → info
  const order: AdvisoryUrgency[] = ['critical', 'warning', 'positive', 'info'];
  return advisories.sort((a, b) => order.indexOf(a.urgency) - order.indexOf(b.urgency));
}

export const weatherAdvisories = generateAdvisories(WEATHER_FORECAST);

// Helper: get rain intensity label
export function rainLabel(mm: number): string {
  if (mm === 0)          return 'No Rain';
  if (mm < 5)           return 'Very Light';
  if (mm < 15)          return 'Light';
  if (mm < 30)          return 'Moderate';
  if (mm < 50)          return 'Heavy';
  return 'Extreme';
}

// Helper: get condition display label
export function conditionLabel(condition: WeatherCondition): string {
  const labels: Record<WeatherCondition, string> = {
    'sunny':         'Sunny',
    'partly-cloudy': 'Partly Cloudy',
    'cloudy':        'Overcast',
    'light-rain':    'Light Rain',
    'moderate-rain': 'Moderate Rain',
    'heavy-rain':    'Heavy Rain',
    'thunderstorm':  'Thunderstorm',
  };
  return labels[condition];
}
