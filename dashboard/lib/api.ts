import { 
  DashboardStats, 
  SeatAvailabilityData, 
  NoiseMonitoringData, 
  TemperatureData, 
  RecentEvent, 
  Train 
} from './types';
import {
  generateMockStats,
  generateMockSeatData,
  generateMockNoiseData,
  generateMockTemperatureData,
  generateMockRecentEvents,
  mockTrains
} from './mock-data';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5111/api/v1';

// Helper function to make API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: { revalidate: 60 },
    ...options,
  });

  if (response.status === 404) {
    console.log(`No data found at ${endpoint}, returning empty result.`);
    throw new Error('Not found');
  }
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data || [];
}

// Dashboard Stats API
export async function getDashboardStats(): Promise<DashboardStats> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return generateMockStats();
  }

  try {
    return await apiRequest<DashboardStats>('/dashboard/stats');
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return generateMockStats();
  }
}

// Seat Availability API
export async function getSeatAvailabilityData(): Promise<SeatAvailabilityData[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return generateMockSeatData();
  }

  try {
    return await apiRequest<SeatAvailabilityData[]>('/sensors/seats');
  } catch (error) {
    console.error("Error fetching seat availability data:", error);
    return generateMockSeatData();
  }
}

// Noise Monitoring API
export async function getNoiseMonitoringData(): Promise<NoiseMonitoringData[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return generateMockNoiseData();
  }

  try {
    return await apiRequest<NoiseMonitoringData[]>('/sensors/noise');
  } catch (error) {
    console.error("Error fetching noise monitoring data:", error);
    return generateMockNoiseData();
  }
}

// Temperature Data API
export async function getTemperatureData(): Promise<TemperatureData[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return generateMockTemperatureData();
  }

  try {
    return await apiRequest<TemperatureData[]>('/sensors/environment');
  } catch (error) {
    console.error("Error fetching temperature data:", error);
    return generateMockTemperatureData();
  }
}

// Recent Events API
export async function getRecentEvents(): Promise<RecentEvent[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return generateMockRecentEvents();
  }

  try {
    return await apiRequest<RecentEvent[]>('/events/recent');
  } catch (error) {
    console.error("Error fetching recent events:", error);
    return generateMockRecentEvents();
  }
}

// Trains API
export async function getTrains(): Promise<Train[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockTrains;
  }

  try {
    return await apiRequest<Train[]>('/trains');
  } catch (error) {
    console.error("Error fetching trains:", error);
    return mockTrains;
  }
}