"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArmchairIcon, Volume2Icon, ThermometerIcon, TrendingUpIcon } from "@/components/icons"
import { apiClient, type RecentEvent } from "@/lib/api"
import { useEffect, useState } from "react"

const getEventIcon = (type: string) => {
  switch (type) {
    case "occupancy":
      return ArmchairIcon
    case "noise":
      return Volume2Icon
    case "temperature":
      return ThermometerIcon
    default:
      return TrendingUpIcon
  }
}

const getEventColors = (severity: string) => {
  switch (severity) {
    case "high":
      return { color: "text-destructive", bg: "bg-destructive/10" }
    case "medium":
      return { color: "text-yellow-600", bg: "bg-yellow-100" }
    case "low":
      return { color: "text-chart-1", bg: "bg-chart-1/10" }
    default:
      return { color: "text-muted-foreground", bg: "bg-muted/10" }
  }
}

interface RecentEventsProps {
  coachId: number | null
}

export function RecentEvents({ coachId }: RecentEventsProps) {
  const [events, setEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const eventsData = await apiClient.getRecentEvents(coachId, 8) as RecentEvent[]
        setEvents(eventsData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch recent events:', err)
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
    // Refresh every 30 seconds
    const interval = setInterval(fetchEvents, 30000)
    return () => clearInterval(interval)
  }, [coachId])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Events</CardTitle>
          <CardDescription className="text-muted-foreground">Latest sensor updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !events.length) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Events</CardTitle>
          <CardDescription className="text-muted-foreground">Latest sensor updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">{error || 'No recent events'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Events</CardTitle>
        <CardDescription className="text-muted-foreground">Latest sensor updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => {
            const Icon = getEventIcon(event.type)
            const colors = getEventColors(event.severity)
            
            return (
              <div key={event.id} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <div className={`rounded-md ${colors.bg} p-2`}>
                  <Icon className={`h-4 w-4 ${colors.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {event.title}
                    </p>
                    <span className="text-xs font-mono text-muted-foreground">{event.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
