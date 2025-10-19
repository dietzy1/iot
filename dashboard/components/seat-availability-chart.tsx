"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

function generateSeatData() {
  const data = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "numeric", hour12: false }),
      available: Math.floor(120 + Math.random() * 40 + Math.sin(i / 3) * 20),
      occupied: Math.floor(80 + Math.random() * 30 + Math.cos(i / 3) * 15),
    })
  }

  return data
}

export function SeatAvailabilityChart() {
  const data = generateSeatData()

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
