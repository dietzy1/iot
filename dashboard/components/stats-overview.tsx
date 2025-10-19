import { Card } from "@/components/ui/card"
import { ArmchairIcon, Volume2Icon, ThermometerIcon, TrendingUpIcon } from "@/components/icons"

export function StatsOverview() {
  const stats = [
    {
      label: "Available Seats",
      value: "142",
      total: "/ 240",
      icon: ArmchairIcon,
      trend: "+12",
      trendLabel: "vs last hour",
      color: "text-chart-1",
    },
    {
      label: "Avg Noise Level",
      value: "58.3",
      unit: "dB",
      icon: Volume2Icon,
      trend: "-2.1",
      trendLabel: "vs last hour",
      color: "text-chart-2",
    },
    {
      label: "Avg Temperature",
      value: "23.4",
      unit: "°C",
      icon: ThermometerIcon,
      trend: "+0.8",
      trendLabel: "vs last hour",
      color: "text-chart-3",
    },
    {
      label: "Active Trains",
      value: "8",
      total: "/ 12",
      icon: TrendingUpIcon,
      trend: "100%",
      trendLabel: "operational",
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
