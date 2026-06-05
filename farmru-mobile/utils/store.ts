export interface Activity {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  time: string;
}

export interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  lastTested: string;
}

class GlobalStore {
  private activities: Activity[] = [
    { id: '1', title: 'Fertilizer Applied', subtitle: 'Field 3 • Tomatoes', icon: 'local-florist', color: '#10b981', time: '1d ago' },
  ];
  private moistureBoost: number = 0;
  private healthOverride: string | null = null;
  private soilData: SoilData = {
    nitrogen: 45,
    phosphorus: 32,
    potassium: 54,
    ph: 6.8,
    lastTested: '14 days ago'
  };
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  getActivities() {
    return this.activities;
  }

  addActivity(activity: Omit<Activity, 'id' | 'time'>) {
    const newActivity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      time: 'Just now',
    };
    this.activities = [newActivity, ...this.activities];
    this.notify();
  }

  setMoistureBoost(value: number) {
    this.moistureBoost = value;
    this.notify();
  }

  getMoistureBoost() {
    return this.moistureBoost;
  }

  getHealthOverride() { return this.healthOverride; }
  setHealthOverride(status: string | null) {
    this.healthOverride = status;
    this.notify();
  }

  getSoilData() { return this.soilData; }
  updateSoilData(data: Partial<SoilData>) {
    this.soilData = { ...this.soilData, ...data, lastTested: 'Just now' };
    this.notify();
  }
}

export const store = new GlobalStore();
