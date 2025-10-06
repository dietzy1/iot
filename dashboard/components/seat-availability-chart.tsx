"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { getSeatAvailabilityData } from "@/lib/api"
import { SeatAvailabilityData } from "@/lib/types"
import { useEffect, useState } from "react"

export function SeatAvailabilityChart() {
  const [data, setData] = useState<SeatAvailabilityData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSeatAvailabilityData().then((seatData) => {
      setData(seatData)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Seat Availability</CardTitle>
          <CardDescription className="text-muted-foreground">Real-time seat occupancy across all trains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Seat Availability</CardTitle>
        <CardDescription className="text-muted-foreground">Real-time seat occupancy across all trains</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            available: {
              label: "Available",
              color: "hsl(var(--chart-1))",
            },
            occupied: {
              label: "Occupied",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="available"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorAvailable)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="occupied"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorOccupied)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
