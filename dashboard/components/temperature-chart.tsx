"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { getTemperatureData } from "@/lib/api"
import { TemperatureData } from "@/lib/types"
import { useEffect, useState } from "react"

export function TemperatureChart() {
  const [data, setData] = useState<TemperatureData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getTemperatureData().then((tempData) => {
      setData(tempData)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Environmental Conditions</CardTitle>
          <CardDescription className="text-muted-foreground">Temperature and humidity monitoring</CardDescription>
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
        <CardTitle className="text-foreground">Environmental Conditions</CardTitle>
        <CardDescription className="text-muted-foreground">Temperature and humidity monitoring</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            temperature: {
              label: "Temperature (°C)",
              color: "hsl(var(--chart-3))",
            },
            humidity: {
              label: "Humidity (%)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
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
              <YAxis
                yAxisId="left"
                stroke="hsl(var(--chart-3))"
                fontSize={11}
                tickLine={false}
                width={35}
                label={{ value: "°C", angle: -90, position: "insideLeft", fill: "hsl(var(--chart-3))", fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--chart-2))"
                fontSize={11}
                tickLine={false}
                width={35}
                label={{ value: "%", angle: 90, position: "insideRight", fill: "hsl(var(--chart-2))", fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
