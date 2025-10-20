"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface FilterSelectorProps {
  onFilterChange: (coachId: number | null, timeSpan: string) => void
}

export function FilterSelector({ onFilterChange }: FilterSelectorProps) {
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [selectedTimeSpan, setSelectedTimeSpan] = useState<string>("1hour")
  const [availableCoaches, setAvailableCoaches] = useState<number[]>([])

  // Fetch available coaches on mount
  useEffect(() => {
    // For now, hardcode 10 coaches. Could fetch from API later
    setAvailableCoaches(Array.from({ length: 10 }, (_, i) => i + 1))
  }, [])

  const handleCoachChange = (coachId: number | null) => {
    setSelectedCoach(coachId)
    onFilterChange(coachId, selectedTimeSpan)
  }

  const handleTimeSpanChange = (timeSpan: string) => {
    setSelectedTimeSpan(timeSpan)
    onFilterChange(selectedCoach, timeSpan)
  }

  const timeSpanOptions = [
    { value: "10min", label: "Last 10 Minutes" },
    { value: "1hour", label: "Last Hour" },
    { value: "6hours", label: "Last 6 Hours" },
    { value: "24hours", label: "All Day (24h)" }
  ]

  return (
    <Card className="p-4 bg-card border-border mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Coach
          </label>
          <select
            value={selectedCoach ?? "all"}
            onChange={(e) => handleCoachChange(e.target.value === "all" ? null : parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Coaches</option>
            {availableCoaches.map(coach => (
              <option key={coach} value={coach}>Coach {coach}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Time Range
          </label>
          <select
            value={selectedTimeSpan}
            onChange={(e) => handleTimeSpanChange(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {timeSpanOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex items-end">
          <div className="text-sm text-muted-foreground">
            <p><strong>Coach:</strong> {selectedCoach ? `Coach ${selectedCoach}` : "All Coaches"}</p>
            <p><strong>Time Range:</strong> {timeSpanOptions.find(t => t.value === selectedTimeSpan)?.label}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}