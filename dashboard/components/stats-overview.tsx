"use client"

import { Card } from "@/components/ui/card"
import { ArmchairIcon, Volume2Icon, ThermometerIcon, TrendingUpIcon } from "@/components/icons"
import { getDashboardStats } from "@/lib/api"
import { DashboardStats } from "@/lib/types"
import { useEffect, useState } from "react"

export function StatsOverview() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)

  useEffect(() => {
    getDashboardStats().then(setDashboardData)
  }, [])

  if (!dashboardData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 bg-card border-border animate-pulse">
            <div className="h-16 bg-muted rounded" />
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: "Available Seats",
      value: dashboardData.availableSeats.value.toString(),
      total: `/ ${dashboardData.availableSeats.total}`,
      icon: ArmchairIcon,
      trend: dashboardData.availableSeats.trend,
      trendLabel: dashboardData.availableSeats.trendLabel,
      color: "text-chart-1",
    },
    {
      label: "Avg Noise Level",
      value: dashboardData.avgNoiseLevel.value.toString(),
      unit: dashboardData.avgNoiseLevel.unit,
      icon: Volume2Icon,
      trend: dashboardData.avgNoiseLevel.trend,
      trendLabel: dashboardData.avgNoiseLevel.trendLabel,
      color: "text-chart-2",
    },
    {
      label: "Avg Temperature",
      value: dashboardData.avgTemperature.value.toString(),
      unit: dashboardData.avgTemperature.unit,
      icon: ThermometerIcon,
      trend: dashboardData.avgTemperature.trend,
      trendLabel: dashboardData.avgTemperature.trendLabel,
      color: "text-chart-3",
    },
    {
      label: "Active Trains",
      value: dashboardData.activeTrains.value.toString(),
      total: `/ ${dashboardData.activeTrains.total}`,
      icon: TrendingUpIcon,
      trend: dashboardData.activeTrains.trend,
      trendLabel: dashboardData.activeTrains.trendLabel,
      color: "text-chart-1",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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
