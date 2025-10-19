// API configuration and utilities for connecting to the IoT backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5284';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}/api/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  // Analytics endpoints
  async getStatsOverview() {
    return this.request('analytics/overview');
  }

  async getSeatAvailability() {
    return this.request('analytics/seats/availability');
  }

  async getTemperatureHistory(hours: number = 24) {
    return this.request(`analytics/temperature/history?hours=${hours}`);
  }

  async getNoiseMonitoring(hours: number = 24) {
    return this.request(`analytics/noise/monitoring?hours=${hours}`);
  }

  async getRecentEvents(limit: number = 10) {
    return this.request(`analytics/events/recent?limit=${limit}`);
  }

  async getRealtime() {
    return this.request('analytics/realtime');
  }
}

export const apiClient = new ApiClient();

// Type definitions for API responses
export interface StatsOverview {
  totalPassengers: number;
  totalSeats: number;
  occupancyRate: number;
  occupancyTrend: number;
  activeCarriages: number;
  avgTemperature: number;
  avgNoiseLevel: number;
  lastUpdated: string;
}

export interface SeatAvailability {
  name: string;
  coach: string;
  occupied: number;
  available: number;
  total: number;
  occupancyRate: number;
}

export interface TemperatureData {
  time: string;
  timestamp: Date;
  [key: string]: any; // Dynamic coach properties like coach1, coach2, etc.
}

export interface NoiseData {
  time: string;
  timestamp: Date;
  [key: string]: any; // Dynamic coach properties like coach1, coach2, etc.
}

export interface RecentEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}