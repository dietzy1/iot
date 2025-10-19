"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

function generateTempData() {
  const data = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "numeric", hour12: false }),
      temperature: 22 + Math.random() * 4 + Math.sin(i / 5) * 2,
      humidity: 45 + Math.random() * 15 + Math.cos(i / 4) * 5,
    })
  }

  return data
}

export function TemperatureChart() {
  const data = generateTempData()

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
              color: "#f97316", // orange
            },
            humidity: {
              label: "Humidity (%)",
              color: "#3b82f6", // blue
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
                stroke="#f97316"
                fontSize={11}
                tickLine={false}
                width={35}
                label={{ value: "°C", angle: -90, position: "insideLeft", fill: "#f97316", fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#3b82f6"
                fontSize={11}
                tickLine={false}
                width={35}
                label={{ value: "%", angle: 90, position: "insideRight", fill: "#3b82f6", fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
