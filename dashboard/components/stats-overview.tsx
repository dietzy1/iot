"use client"

import { Card } from "@/components/ui/card"
import { ArmchairIcon, Volume2Icon, ThermometerIcon, TrendingUpIcon } from "@/components/icons"
import { apiClient, type StatsOverview as StatsData } from "@/lib/api"
import { useEffect, useState } from "react"

interface StatsOverviewProps {
  coachId: number | null
  timeSpan: string
}

export function StatsOverview({ coachId, timeSpan }: StatsOverviewProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getStatsOverview(coachId, timeSpan) as StatsData
        setStats(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [coachId, timeSpan])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 bg-card border-border animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-destructive">{error || 'No data available'}</p>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      label: "Available Seats",
      value: (stats.totalSeats - stats.totalPassengers).toString(),
      total: `/ ${stats.totalSeats}`,
      icon: ArmchairIcon,
      trend: stats.occupancyTrend ? (stats.occupancyTrend > 0 ? `+${stats.occupancyTrend.toFixed(1)}%` : `${stats.occupancyTrend.toFixed(1)}%`) : "--",
      trendLabel: "vs last hour",
      color: "text-chart-1",
    },
    {
      label: "Avg Noise Level",
      value: (stats.avgNoiseLevel || 0).toFixed(1),
      unit: "dB",
      icon: Volume2Icon,
      trend: (stats.avgNoiseLevel || 0) > 60 ? "High" : (stats.avgNoiseLevel || 0) > 50 ? "Normal" : "Low",
      trendLabel: "current level",
      color: "text-chart-2",
    },
    {
      label: "Avg Temperature",
      value: (stats.avgTemperature || 0).toFixed(1),
      unit: "°C",
      icon: ThermometerIcon,
      trend: (stats.avgTemperature || 0) > 25 ? "Warm" : (stats.avgTemperature || 0) > 20 ? "Comfortable" : "Cool",
      trendLabel: "current status",
      color: "text-chart-3",
    },
    {
      label: "Active Carriages",
      value: (stats.activeCarriages || 0).toString(),
      total: "",
      icon: TrendingUpIcon,
      trend: `${(stats.occupancyRate || 0).toFixed(1)}%`,
      trendLabel: "occupancy rate",
      color: "text-chart-1",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="p-4 bg-card border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-foreground">{stat.value}</span>
                {stat.unit && <span className="text-lg text-muted-foreground">{stat.unit}</span>}
                {stat.total && <span className="text-lg text-muted-foreground">{stat.total}</span>}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className={stat.color}>{stat.trend}</span> {stat.trendLabel}
              </p>
            </div>
            <div className={`rounded-lg bg-secondary p-2 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
