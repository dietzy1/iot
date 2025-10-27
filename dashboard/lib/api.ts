// API configuration and utilities for connecting to the IoT backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5284';

export class ApiClient {
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
  async getStatsOverview(carriageId: number | null = null, timeSpan: string = "1hour") {
    // Combine data from the 4 separate endpoints
    const [occupancy, temperature, noise, lastUpdated] = await Promise.all([
      this.getOccupancy(carriageId, timeSpan),
      this.getTemperature(carriageId, timeSpan),
      this.getNoise(carriageId, timeSpan),
      this.getLastUpdated()
    ])
    
    return {
      ...(occupancy as any),
      ...(temperature as any),
      ...(noise as any),
      ...(lastUpdated as any)
    }
  }

  async getOccupancy(carriageId: number | null = null, timeSpan: string = "1hour") {
    const params = new URLSearchParams()
    if (carriageId !== null) params.append("carriageId", carriageId.toString())
    params.append("timeSpan", timeSpan)
    return this.request(`analytics/occupancy?${params}`)
  }

  async getTemperature(carriageId: number | null = null, timeSpan: string = "1hour") {
    const params = new URLSearchParams()
    if (carriageId !== null) params.append("carriageId", carriageId.toString())
    params.append("timeSpan", timeSpan)
    return this.request(`analytics/temperature?${params}`)
  }

  async getNoise(carriageId: number | null = null, timeSpan: string = "1hour") {
    const params = new URLSearchParams()
    if (carriageId !== null) params.append("carriageId", carriageId.toString())
    params.append("timeSpan", timeSpan)
    return this.request(`analytics/noise?${params}`)
  }

  async getLastUpdated() {
    return this.request(`analytics/last-updated`)
  }

  async getTemperatureHistory(carriageId: number | null = null, timeSpan: string = "1hour") {
    const params = new URLSearchParams()
    if (carriageId !== null) params.append("carriageId", carriageId.toString())
    params.append("timeSpan", timeSpan)
    return this.request(`analytics/temperature/history?${params}`)
  }

  async getNoiseMonitoring(carriageId: number | null = null, timeSpan: string = "1hour") {
    const params = new URLSearchParams()
    if (carriageId !== null) params.append("carriageId", carriageId.toString())
    params.append("timeSpan", timeSpan)
    return this.request(`analytics/noise/history?${params}`)
  }

  async getSeatAvailability(carriageId: number | null = null) {
    const params = new URLSearchParams()
    if (carriageId !== null) params.append("carriageId", carriageId.toString())
    return this.request(`analytics/seats/availability?${params}`)
  }

  async getRecentEvents(carriageId: number | null = null, limit: number = 50) {
    const params = new URLSearchParams()
    if (carriageId !== null) params.append("carriageId", carriageId.toString())
    params.append("limit", limit.toString())
    return this.request(`analytics/events/recent?${params}`)
  }
}

export const apiClient = new ApiClient();

// Type definitions for API responses
export interface StatsOverview {
  totalPassengers: number;
  totalSeats: number;
  occupancyRate: number;
  occupancyTrend?: number;
  activeCarriages: number;
  avgTemperature?: number;
  avgNoiseLevel?: number;
  lastUpdated?: string;
}

export interface SeatAvailability {
  name: string;
  carriage: string;
  occupied: number;
  available: number;
  total: number;
  occupancyRate: number;
}

export interface TemperatureData {
  time: string;
  timestamp: Date;
  [key: string]: any; // Dynamic carriage properties like carriage1, carriage2, etc.
}

export interface NoiseData {
  time: string;
  timestamp: Date;
  [key: string]: any; // Dynamic carriage properties like carriage1, carriage2, etc.
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