// API types for IoT Dashboard endpoints
export interface DashboardStats {
  availableSeats: {
    value: number;
    total: number;
    trend: string;
    trendLabel: string;
  };
  avgNoiseLevel: {
    value: number;
    unit: string;
    trend: string;
    trendLabel: string;
  };
  avgTemperature: {
    value: number;
    unit: string;
    trend: string;
    trendLabel: string;
  };
  activeTrains: {
    value: number;
    total: number;
    trend: string;
    trendLabel: string;
  };
}

export interface SeatAvailabilityData {
  time: string;
  available: number;
  occupied: number;
}

export interface NoiseMonitoringData {
  time: string;
  front: number;
  middle: number;
  rear: number;
}

export interface TemperatureData {
  time: string;
  temperature: number;
  humidity: number;
}

export interface RecentEvent {
  id: string;
  type: 'seat' | 'noise' | 'temperature';
  trainId: string;
  coach: number;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Train {
  id: string;
  name: string;
  route: string;
  totalSeats: number;
  isActive: boolean;
  createdAt: string;
}