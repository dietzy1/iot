"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArmchairIcon, Volume2Icon, ThermometerIcon } from "@/components/icons"
import { getRecentEvents } from "@/lib/api"
import { RecentEvent } from "@/lib/types"
import { useEffect, useState } from "react"

export function RecentEvents() {
  const [events, setEvents] = useState<RecentEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getRecentEvents().then((eventData) => {
      setEvents(eventData)
      setIsLoading(false)
    })
  }, [])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'seat': return ArmchairIcon
      case 'noise': return Volume2Icon
      case 'temperature': return ThermometerIcon
      default: return ArmchairIcon
    }
  }

  const getEventColors = (type: string) => {
    switch (type) {
      case 'seat': return { color: "text-chart-1", bg: "bg-chart-1/10" }
      case 'noise': return { color: "text-chart-2", bg: "bg-chart-2/10" }
      case 'temperature': return { color: "text-chart-3", bg: "bg-chart-3/10" }
      default: return { color: "text-chart-1", bg: "bg-chart-1/10" }
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Events</CardTitle>
          <CardDescription className="text-muted-foreground">Latest sensor updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3 animate-pulse">
                <div className="rounded-md bg-muted p-2">
                  <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
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
            const colors = getEventColors(event.type)
            const eventTime = new Date(event.timestamp).toLocaleTimeString("en-US", { 
              hour: "2-digit", 
              minute: "2-digit" 
            })

            return (
              <div key={event.id} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <div className={`rounded-md ${colors.bg} p-2`}>
                  <Icon className={`h-4 w-4 ${colors.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {event.trainId} • Coach {event.coach}
                    </p>
                    <span className="text-xs font-mono text-muted-foreground">{eventTime}</span>
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
