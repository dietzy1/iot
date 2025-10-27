"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { apiClient, type SeatAvailability } from "@/lib/api"
import { useEffect, useState } from "react"

interface SeatAvailabilityChartProps {
  carriageId: number | null
}

export function SeatAvailabilityChart({ carriageId }: SeatAvailabilityChartProps) {
  const [data, setData] = useState<SeatAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const seatData = await apiClient.getSeatAvailability(carriageId) as SeatAvailability[]
        setData(seatData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch seat availability:', err)
        setError('Failed to load seat data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [carriageId])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Seat Availability</CardTitle>
          <CardDescription className="text-muted-foreground">Real-time seat occupancy across all carriages</CardDescription>
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
          <CardTitle className="text-foreground">Seat Availability</CardTitle>
          <CardDescription className="text-muted-foreground">Real-time seat occupancy across all carriages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-destructive">{error || 'No seat data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Seat Availability</CardTitle>
        <CardDescription className="text-muted-foreground">Real-time seat occupancy across all carriages</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            occupied: {
              label: "Occupied",
              color: "#ef4444", // Red for occupied seats
            },
            available: {
              label: "Available", 
              color: "#22c55e", // Green for available seats
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="carriage"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} width={40} />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SeatAvailability
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm" style={{ color: "#ef4444" }}>
                          Occupied: {data.occupied} ({data.occupancyRate}%)
                        </p>
                        <p className="text-sm" style={{ color: "#22c55e" }}>
                          Available: {data.available}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: {data.total} seats
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="occupied" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
              <Bar dataKey="available" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
