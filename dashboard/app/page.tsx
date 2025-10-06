import { DashboardHeader } from "@/components/dashboard-header"
import { StatsOverview } from "@/components/stats-overview"
import { SeatAvailabilityChart } from "@/components/seat-availability-chart"
import { NoiseMonitoringChart } from "@/components/noise-monitoring-chart"
import { TemperatureChart } from "@/components/temperature-chart"
import { RecentEvents } from "@/components/recent-events"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatsOverview />

        <div className="grid gap-6 lg:grid-cols-2">
          <SeatAvailabilityChart />
          <NoiseMonitoringChart />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TemperatureChart />
          </div>
          <RecentEvents />
        </div>
      </main>
    </div>
  )
}
