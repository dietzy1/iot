"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { apiClient, type TemperatureData } from "@/lib/api"
import { useEffect, useState } from "react"

export function TemperatureChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachConfig, setCoachConfig] = useState<Record<string, { label: string; color: string }>>({})

  // Generate colors for coaches
  const generateCoachColor = (index: number) => {
    const colors = [
      "#f97316", // orange
      "#ef4444", // red  
      "#22c55e", // green
      "#3b82f6", // blue
      "#8b5cf6", // purple
      "#f59e0b", // amber
      "#06b6d4", // cyan
      "#ec4899", // pink
      "#84cc16", // lime
      "#f43f5e", // rose
    ]
    return colors[index % colors.length]
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch temperature data
        const tempData = await apiClient.getTemperatureHistory(1) as TemperatureData[]
        
        // Format the data for the chart with actual timestamps
        const formattedData = tempData.map(item => {
          const date = new Date(item.timestamp)
          
          return {
            ...item,
            time: date.toLocaleTimeString("en-US", { 
              hour: "2-digit", 
              minute: "2-digit",
              hour12: false 
            }), // Format as "14:23"
            timestamp: date,
          }
        }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) // Sort chronologically
        
        // Dynamically detect coaches from the data
        if (formattedData.length > 0) {
          // Scan ALL data points to find all possible coaches (not just the first one)
          const allCoachKeys = new Set<string>()
          formattedData.forEach(dataPoint => {
            Object.keys(dataPoint).forEach(key => {
              if (key.startsWith('coach')) {
                allCoachKeys.add(key)
              }
            })
          })
          
          const coachKeysArray = Array.from(allCoachKeys).sort((a, b) => {
            const aNum = parseInt(a.replace('coach', ''))
            const bNum = parseInt(b.replace('coach', ''))
            return aNum - bNum
          })
          
          const dynamicConfig: Record<string, { label: string; color: string }> = {}
          coachKeysArray.forEach((coachKey, index) => {
            const coachNumber = coachKey.replace('coach', '')
            dynamicConfig[coachKey] = {
              label: `Coach ${coachNumber} Temp (°C)`,
              color: generateCoachColor(index)
            }
          })
          
          setCoachConfig(dynamicConfig)
        }
        
        setData(formattedData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch temperature data:', err)
        setError('Failed to load temperature data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Environmental Conditions</CardTitle>
          <CardDescription className="text-muted-foreground">Temperature monitoring with timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data.length) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Environmental Conditions</CardTitle>
          <CardDescription className="text-muted-foreground">Temperature monitoring with timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-destructive">{error || 'No temperature data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Environmental Conditions</CardTitle>
        <CardDescription className="text-muted-foreground">Temperature monitoring with timestamps</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={coachConfig}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                label={{
                  value: "Time (HH:MM)",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                width={35}
                domain={[22, 27]}
                label={{ value: "°C", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">Time: {label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {Number(entry.value).toFixed(1)}°C
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              {/* Dynamically render lines for all coaches */}
              {Object.entries(coachConfig).map(([coachKey, config]) => (
                <Line
                  key={coachKey}
                  type="monotone"
                  dataKey={coachKey}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={{ fill: config.color, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
