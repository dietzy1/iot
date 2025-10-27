"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface FilterSelectorProps {
  onFilterChange: (carriageId: number | null, timeSpan: string) => void
}

export function FilterSelector({ onFilterChange }: FilterSelectorProps) {
  const [selectedCarriage, setSelectedCarriage] = useState<number | null>(null)
  const [selectedTimeSpan, setSelectedTimeSpan] = useState<string>("1hour")
  const [availableCarriages, setAvailableCarriages] = useState<number[]>([])

  // Fetch available carriages on mount
  useEffect(() => {
    // For now, hardcode 10 carriages. Could fetch from API later
    setAvailableCarriages(Array.from({ length: 10 }, (_, i) => i + 1))
  }, [])

  const handleCarriageChange = (carriageId: number | null) => {
    setSelectedCarriage(carriageId)
    onFilterChange(carriageId, selectedTimeSpan)
  }

  const handleTimeSpanChange = (timeSpan: string) => {
    setSelectedTimeSpan(timeSpan)
    onFilterChange(selectedCarriage, timeSpan)
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
            Select Carriage
          </label>
          <select
            value={selectedCarriage ?? "all"}
            onChange={(e) => handleCarriageChange(e.target.value === "all" ? null : parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Carriages</option>
            {availableCarriages.map(carriage => (
              <option key={carriage} value={carriage}>Carriage {carriage}</option>
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
            <p><strong>Carriage:</strong> {selectedCarriage ? `Carriage ${selectedCarriage}` : "All Carriages"}</p>
            <p><strong>Time Range:</strong> {timeSpanOptions.find(t => t.value === selectedTimeSpan)?.label}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}