import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArmchairIcon, Volume2Icon, ThermometerIcon } from "@/components/icons"

// Mock recent events
function generateRecentEvents() {
  const eventTypes = [
    { type: "seat", icon: ArmchairIcon, color: "text-chart-1", bg: "bg-chart-1/10" },
    { type: "noise", icon: Volume2Icon, color: "text-chart-2", bg: "bg-chart-2/10" },
    { type: "temperature", icon: ThermometerIcon, color: "text-chart-3", bg: "bg-chart-3/10" },
  ]

  const events = []
  const now = new Date()

  for (let i = 0; i < 8; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const time = new Date(now.getTime() - i * 2 * 60 * 1000)
    const train = `ICE-${700 + Math.floor(Math.random() * 100)}`
    const coach = Math.floor(Math.random() * 6) + 1

    let description = ""
    if (eventType.type === "seat") {
      const seat = Math.floor(Math.random() * 60) + 1
      const available = Math.random() > 0.5
      description = `Seat ${seat} ${available ? "available" : "occupied"}`
    } else if (eventType.type === "noise") {
      const db = (50 + Math.random() * 30).toFixed(1)
      description = `${db} dB detected`
    } else {
      const temp = (20 + Math.random() * 8).toFixed(1)
      description = `${temp}°C recorded`
    }

    events.push({
      ...eventType,
      train,
      coach,
      description,
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    })
  }

  return events
}

export function RecentEvents() {
  const events = generateRecentEvents()

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Events</CardTitle>
        <CardDescription className="text-muted-foreground">Latest sensor updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <div className={`rounded-md ${event.bg} p-2`}>
                <event.icon className={`h-4 w-4 ${event.color}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {event.train} • Coach {event.coach}
                  </p>
                  <span className="text-xs font-mono text-muted-foreground">{event.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
