"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { getNoiseMonitoringData } from "@/lib/api"
import { NoiseMonitoringData } from "@/lib/types"
import { useEffect, useState } from "react"

export function NoiseMonitoringChart() {
  const [data, setData] = useState<NoiseMonitoringData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getNoiseMonitoringData().then((noiseData) => {
      setData(noiseData)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Noise Monitoring</CardTitle>
          <CardDescription className="text-muted-foreground">Decibel levels by coach location</CardDescription>
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
        <CardTitle className="text-foreground">Noise Monitoring</CardTitle>
        <CardDescription className="text-muted-foreground">Decibel levels by coach location</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            front: {
              label: "Front",
              color: "#ff4444",
            },
            middle: {
              label: "Middle",
              color: "#44ff44",
            },
            rear: {
              label: "Rear",
              color: "#ffaa00",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
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
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                width={40}
                label={{
                  value: "dB",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="front" stroke="#ff4444" strokeWidth={2} dot={{ fill: "#ff4444", strokeWidth: 1, r: 4 }} />
              <Line type="monotone" dataKey="middle" stroke="#44ff44" strokeWidth={2} dot={{ fill: "#44ff44", strokeWidth: 1, r: 4 }} />
              <Line type="monotone" dataKey="rear" stroke="#ffaa00" strokeWidth={2} dot={{ fill: "#ffaa00", strokeWidth: 1, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
