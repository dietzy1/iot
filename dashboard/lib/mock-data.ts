import { 
  DashboardStats, 
  SeatAvailabilityData, 
  NoiseMonitoringData, 
  TemperatureData, 
  RecentEvent, 
  Train 
} from './types';

// Mock data generators
export function generateMockStats(): DashboardStats {
  const totalSeats = 240;
  const availableSeats = 120 + Math.floor(Math.random() * 40);
  
  return {
    availableSeats: {
      value: availableSeats,
      total: totalSeats,
      trend: Math.random() > 0.5 ? '+12' : '-8',
      trendLabel: 'vs last hour'
    },
    avgNoiseLevel: {
      value: Math.round((50 + Math.random() * 15) * 10) / 10,
      unit: 'dB',
      trend: Math.random() > 0.5 ? '-2.1' : '+1.3',
      trendLabel: 'vs last hour'
    },
    avgTemperature: {
      value: Math.round((22 + Math.random() * 3) * 10) / 10,
      unit: '°C',
      trend: Math.random() > 0.5 ? '+0.8' : '-0.5',
      trendLabel: 'vs last hour'
    },
    activeTrains: {
      value: 8 + Math.floor(Math.random() * 3),
      total: 12,
      trend: '100%',
      trendLabel: 'operational'
    }
  };
}

export function generateMockSeatData(): SeatAvailabilityData[] {
  const data: SeatAvailabilityData[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "numeric", hour12: false }),
      available: Math.floor(120 + Math.random() * 40 + Math.sin(i / 3) * 20),
      occupied: Math.floor(80 + Math.random() * 30 + Math.cos(i / 3) * 15),
    });
  }

  return data;
}

export function generateMockNoiseData(): NoiseMonitoringData[] {
  const data: NoiseMonitoringData[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "numeric", hour12: false }),
      front: 50 + Math.random() * 20 + Math.sin(i / 4) * 10,
      middle: 50 + Math.random() * 20 + Math.sin(i / 4) * 10,
      rear: 50 + Math.random() * 20 + Math.sin(i / 4) * 10,
    });
  }

  return data;
}

export function generateMockTemperatureData(): TemperatureData[] {
  const data: TemperatureData[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "numeric", hour12: false }),
      temperature: 22 + Math.random() * 4 + Math.sin(i / 5) * 2,
      humidity: 45 + Math.random() * 15 + Math.cos(i / 4) * 5,
    });
  }

  return data;
}

export function generateMockRecentEvents(): RecentEvent[] {
  const events: RecentEvent[] = [];
  const now = new Date();
  const eventTypes: ('seat' | 'noise' | 'temperature')[] = ['seat', 'noise', 'temperature'];
  const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  for (let i = 0; i < 8; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const time = new Date(now.getTime() - i * 2 * 60 * 1000);
    const trainId = `ICE-${700 + Math.floor(Math.random() * 100)}`;
    const coach = Math.floor(Math.random() * 6) + 1;
    
    let description = "";
    if (eventType === "seat") {
      const seat = Math.floor(Math.random() * 60) + 1;
      const available = Math.random() > 0.5;
      description = `Seat ${seat} ${available ? "available" : "occupied"}`;
    } else if (eventType === "noise") {
      const db = (50 + Math.random() * 30).toFixed(1);
      description = `${db} dB detected`;
    } else {
      const temp = (20 + Math.random() * 8).toFixed(1);
      description = `${temp}°C recorded`;
    }

    events.push({
      id: `event-${i}-${Date.now()}`,
      type: eventType,
      trainId,
      coach,
      description,
      timestamp: time.toISOString(),
      severity: severities[Math.floor(Math.random() * severities.length)]
    });
  }

  return events;
}

export const mockTrains: Train[] = [
  {
    id: 'ICE-701',
    name: 'ICE 701 München - Berlin',
    route: 'München Hbf → Berlin Hbf',
    totalSeats: 240,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ICE-702',
    name: 'ICE 702 Hamburg - Frankfurt',
    route: 'Hamburg Hbf → Frankfurt (Main) Hbf',
    totalSeats: 240,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ICE-703',
    name: 'ICE 703 Köln - Dresden',
    route: 'Köln Hbf → Dresden Hbf',
    totalSeats: 240,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ICE-704',
    name: 'ICE 704 Stuttgart - Leipzig',
    route: 'Stuttgart Hbf → Leipzig Hbf',
    totalSeats: 240,
    isActive: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ICE-705',
    name: 'ICE 705 Düsseldorf - Nürnberg',
    route: 'Düsseldorf Hbf → Nürnberg Hbf',
    totalSeats: 240,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ICE-706',
    name: 'ICE 706 Bremen - Würzburg',
    route: 'Bremen Hbf → Würzburg Hbf',
    totalSeats: 240,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];