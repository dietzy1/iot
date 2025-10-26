"use client"

import { ActivityIcon, TrainIcon } from "@/components/icons"
import { useEffect, useState } from "react"

export function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    // Set initial time on client side only
    setCurrentTime(new Date().toLocaleTimeString())

    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrainIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Train IoT Monitor</h1>
              <p className="text-sm text-muted-foreground">Real-time sensor data dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
              <ActivityIcon className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Live</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Last updated</p>
              <p className="text-sm font-mono text-foreground">{currentTime || "--:--:--"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
