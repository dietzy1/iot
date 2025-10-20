"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { FilterSelector } from "@/components/filter-selector"
import { StatsOverview } from "@/components/stats-overview"
import { TemperatureChart } from "@/components/temperature-chart"
import { NoiseMonitoringChart } from "@/components/noise-monitoring-chart"
import { SeatAvailabilityChart } from "@/components/seat-availability-chart"
import { RecentEvents } from "@/components/recent-events"
import { useState } from "react"

export default function DashboardPage() {
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [selectedTimeSpan, setSelectedTimeSpan] = useState<string>("1hour")

  const handleFilterChange = (coachId: number | null, timeSpan: string) => {
    setSelectedCoach(coachId)
    setSelectedTimeSpan(timeSpan)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <DashboardHeader />
        
        <FilterSelector onFilterChange={handleFilterChange} />
        
        <StatsOverview coachId={selectedCoach} timeSpan={selectedTimeSpan} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <TemperatureChart coachId={selectedCoach} timeSpan={selectedTimeSpan} />
          <NoiseMonitoringChart coachId={selectedCoach} timeSpan={selectedTimeSpan} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <SeatAvailabilityChart coachId={selectedCoach} />
          <RecentEvents coachId={selectedCoach} />
        </div>
      </div>
    </div>
  )
}
