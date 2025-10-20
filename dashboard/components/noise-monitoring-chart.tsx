"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { apiClient, type NoiseData } from "@/lib/api"
import { useEffect, useState } from "react"

interface NoiseMonitoringChartProps {
  coachId: number | null
  timeSpan: string
}

export function NoiseMonitoringChart({ coachId, timeSpan }: NoiseMonitoringChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachConfig, setCoachConfig] = useState<Record<string, { label: string; color: string }>>({})

  // Generate colors for coaches
  const generateCoachColor = (index: number) => {
    const colors = [
      "#22c55e", // green
      "#ef4444", // red
      "#f97316", // orange  
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
        // Fetch noise data with filtering
        const noiseData = await apiClient.getNoiseMonitoring(coachId, timeSpan) as NoiseData[]
        
        // Format the data for the chart with actual timestamps
        const formattedData = noiseData.map(item => {
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
              label: `Coach ${coachNumber}`,
              color: generateCoachColor(index)
            }
          })
          
          setCoachConfig(dynamicConfig)
        }
        
        setData(formattedData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch noise data:', err)
        setError('Failed to load noise data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [coachId, timeSpan])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Noise Monitoring</CardTitle>
          <CardDescription className="text-muted-foreground">Decibel levels by coach with timestamps</CardDescription>
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
          <CardTitle className="text-foreground">Noise Monitoring</CardTitle>
          <CardDescription className="text-muted-foreground">Decibel levels by coach with timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-destructive">{error || 'No noise data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Noise Monitoring</CardTitle>
        <CardDescription className="text-muted-foreground">Decibel levels by coach with timestamps</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={coachConfig}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
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
                width={40}
                domain={[45, 60]}
                label={{
                  value: "dB",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">Time: {label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {Number(entry.value).toFixed(1)}dB
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
