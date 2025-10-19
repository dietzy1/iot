"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

function generateNoiseData() {
  const data = []
  const now = new Date()
  const locations = ["front", "middle", "rear"]

  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000)
    const entry: any = {
      time: time.toLocaleTimeString("en-US", { hour: "numeric", hour12: false }),
    }

    locations.forEach((loc) => {
      entry[loc] = 50 + Math.random() * 20 + Math.sin(i / 4) * 10
    })

    data.push(entry)
  }

  return data
}

export function NoiseMonitoringChart() {
  const data = generateNoiseData()

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
              color: "#22c55e", // green
            },
            middle: {
              label: "Middle",
              color: "#eab308", // yellow
            },
            rear: {
              label: "Rear",
              color: "#ef4444", // red
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
              <Line type="monotone" dataKey="front" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="middle" stroke="#eab308" strokeWidth={2} dot={{ fill: "#eab308", r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="rear" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
