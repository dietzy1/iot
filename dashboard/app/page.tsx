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
  const [selectedCarriage, setSelectedCarriage] = useState<number | null>(null)
  const [selectedTimeSpan, setSelectedTimeSpan] = useState<string>("1hour")

  const handleFilterChange = (carriageId: number | null, timeSpan: string) => {
    setSelectedCarriage(carriageId)
    setSelectedTimeSpan(timeSpan)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <DashboardHeader />
        
        <FilterSelector onFilterChange={handleFilterChange} />
        
        <StatsOverview carriageId={selectedCarriage} timeSpan={selectedTimeSpan} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <TemperatureChart carriageId={selectedCarriage} timeSpan={selectedTimeSpan} />
          <NoiseMonitoringChart carriageId={selectedCarriage} timeSpan={selectedTimeSpan} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <SeatAvailabilityChart carriageId={selectedCarriage} />
          <RecentEvents carriageId={selectedCarriage} />
        </div>
      </div>
    </div>
  )
}
