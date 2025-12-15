package sim

import (
	"encoding/json"
	"math/rand"
	"time"
)

// DayCycle represents a simple 4-phase cycle (2 minutes total)
type DayCycle struct {
	startTime time.Time
}

// NewDayCycle creates a new day cycle
func NewDayCycle() *DayCycle {
	return &DayCycle{
		startTime: time.Now(),
	}
}

// GetPhase returns which phase we're in (0-3)
// Each phase lasts 1 minute
func (dc *DayCycle) GetPhase() int {
	elapsed := time.Since(dc.startTime)
	seconds := int(elapsed.Seconds()) % 240 // 4 minute loop
	return seconds / 60                      // 4 phases of 60s each
}

// GetPhaseName returns the current phase name
func (dc *DayCycle) GetPhaseName() string {
	phases := []string{"Morning Rush", "Slow Period", "Afternoon Rush", "Slow Period"}
	return phases[dc.GetPhase()]
}

// GetOccupancyMultiplier returns target occupancy (0.0 - 1.0)
func (dc *DayCycle) GetOccupancyMultiplier() float64 {
	phase := dc.GetPhase()
	switch phase {
	case 0: // Morning rush
		return 0.85
	case 1: // Slow period
		return 0.25
	case 2: // Afternoon rush
		return 0.99
	case 3: // Slow period
		return 0.20
	default:
		return 0.50
	}
}

// GetBaseTemperature returns base temperature
func (dc *DayCycle) GetBaseTemperature() float32 {
	phase := dc.GetPhase()
	switch phase {
	case 0: // Morning rush - cooler
		return 18.0
	case 1: // Slow period - warming up
		return 20.0
	case 2: // Afternoon rush - warmer
		return 25.0
	case 3: // Slow period - cooling down
		return 19.0
	default:
		return 20.0
	}
}

// Base event with common fields that all events share
type BaseEvent struct {
	EventType string    `json:"event_type"`
	Timestamp time.Time `json:"timestamp"`
	Train     string    `json:"train"`
	Carriage  int       `json:"carriage"`
}

// Seat availability event
type SeatEvent struct {
	BaseEvent
	Seat      int  `json:"seat"`
	Available bool `json:"available"`
}

// Noise level event
type NoiseEvent struct {
	BaseEvent
	DecibelLevel float64 `json:"decibel_level"`
	Location     string  `json:"location"`
}

// Temperature event
type TemperatureEvent struct {
	BaseEvent
	TemperatureCelsius float64 `json:"temperature_celsius"`
	Humidity           float64 `json:"humidity"`
	SensorLocation     string  `json:"sensor_location"`
}

type Config struct {
	Train            string
	Carriages        int
	SeatsPerCarriage int
	BaseInterval     time.Duration
	Jitter           time.Duration
	Seed             int64
}

type Generator struct {
	cfg      Config
	rnd      *rand.Rand
	seats    [][]bool  // [carriage][seat] - track seat states
	dayCycle *DayCycle
}

func NewGenerator(cfg Config) *Generator {
	seed := cfg.Seed
	if seed == 0 {
		seed = time.Now().UnixNano()
	}

	// Initialize seat tracking
	seats := make([][]bool, cfg.Carriages)
	for i := range seats {
		seats[i] = make([]bool, cfg.SeatsPerCarriage)
	}

	return &Generator{
		cfg:      cfg,
		rnd:      rand.New(rand.NewSource(seed)),
		seats:    seats,
		dayCycle: NewDayCycle(),
	}
}

func (g *Generator) Topic(carriage int) string {
	return "train/" + g.cfg.Train + "/carriage/" + itoa(carriage)
}

// Topic for seat events
func (g *Generator) SeatTopic(carriage int) string {
	return "train/" + g.cfg.Train + "/carriage/" + itoa(carriage) + "/seat"
}

// Topic for noise events
func (g *Generator) NoiseTopic(carriage int) string {
	return "train/" + g.cfg.Train + "/carriage/" + itoa(carriage) + "/noise"
}

// Topic for temperature events
func (g *Generator) TemperatureTopic(carriage int) string {
	return "train/" + g.cfg.Train + "/carriage/" + itoa(carriage) + "/temperature"
}

func (g *Generator) NextDelay() time.Duration {
	if g.cfg.Jitter <= 0 {
		return g.cfg.BaseInterval
	}
	d := g.cfg.BaseInterval
	j := time.Duration(g.rnd.Int63n(int64(g.cfg.Jitter)))
	if g.rnd.Intn(2) == 0 {
		if j < d {
			return d - j
		}
		return d
	}
	return d + j
}

// getCurrentOccupancy calculates current occupancy rate for a carriage
func (g *Generator) getCurrentOccupancy(carriage int) float64 {
	occupied := 0
	for _, taken := range g.seats[carriage-1] {
		if taken {
			occupied++
		}
	}
	return float64(occupied) / float64(g.cfg.SeatsPerCarriage)
}

// Generate a random seat event
func (g *Generator) RandomSeatEvent(carriage int) (SeatEvent, []byte) {
	seat := g.rnd.Intn(g.cfg.SeatsPerCarriage)

	targetOccupancy := g.dayCycle.GetOccupancyMultiplier()
	currentOccupancy := g.getCurrentOccupancy(carriage)

	if currentOccupancy < targetOccupancy {
		if !g.seats[carriage-1][seat] && g.rnd.Float64() < 0.7 {
			g.seats[carriage-1][seat] = true
		}
	} else if currentOccupancy > targetOccupancy {
		if g.seats[carriage-1][seat] && g.rnd.Float64() < 0.6 {
			g.seats[carriage-1][seat] = false
		}
	}

	available := !g.seats[carriage-1][seat]

	e := SeatEvent{
		BaseEvent: BaseEvent{
			EventType: "seat",
			Timestamp: time.Now().UTC(),
			Train:     g.cfg.Train,
			Carriage:  carriage,
		},
		Seat:      seat + 1, // 1-indexed for display
		Available: available,
	}
	b, _ := json.Marshal(e)
	return e, b
}

// Generate a random noise event
func (g *Generator) RandomNoiseEvent(carriage int) (NoiseEvent, []byte) {
	occupancy := g.getCurrentOccupancy(carriage)

	// Base noise: 40-50 dB when empty
	// Add up to +25 dB when full
	baseNoise := 40.0 + g.rnd.Float64()*10.0
	occupancyNoise := occupancy * 25.0

	locations := []string{"front", "middle", "back"}
	location := locations[g.rnd.Intn(len(locations))]

	e := NoiseEvent{
		BaseEvent: BaseEvent{
			EventType: "noise",
			Timestamp: time.Now().UTC(),
			Train:     g.cfg.Train,
			Carriage:  carriage,
		},
		DecibelLevel: baseNoise + occupancyNoise,
		Location:     location,
	}
	b, _ := json.Marshal(e)
	return e, b
}

// Generate a random temperature event
func (g *Generator) RandomTemperatureEvent(carriage int) (TemperatureEvent, []byte) {
	occupancy := g.getCurrentOccupancy(carriage)

	baseTemp := g.dayCycle.GetBaseTemperature()
	occupancyHeat := float32(occupancy * 4.0) // Up to +4°C when full
	temperature := float64(baseTemp + occupancyHeat)

	// Small random variation
	temperature += (g.rnd.Float64()*2 - 1) // ±1°C

	humidity := 35.0 + g.rnd.Float64()*30.0 // 35-65%
	locations := []string{"ceiling", "floor", "window", "door"}
	location := locations[g.rnd.Intn(len(locations))]

	e := TemperatureEvent{
		BaseEvent: BaseEvent{
			EventType: "temperature",
			Timestamp: time.Now().UTC(),
			Train:     g.cfg.Train,
			Carriage:  carriage,
		},
		TemperatureCelsius: temperature,
		Humidity:           humidity,
		SensorLocation:     location,
	}
	b, _ := json.Marshal(e)
	return e, b
}

// Generate a random event of any type
func (g *Generator) RandomEvent(carriage int) (interface{}, []byte) {
	eventType := g.rnd.Intn(3)
	switch eventType {
	case 0:
		return g.RandomSeatEvent(carriage)
	case 1:
		return g.RandomNoiseEvent(carriage)
	case 2:
		return g.RandomTemperatureEvent(carriage)
	default:
		return g.RandomSeatEvent(carriage)
	}
}

// GetPhaseName returns current cycle phase name
func (g *Generator) GetPhaseName() string {
	return g.dayCycle.GetPhaseName()
}

// GetOccupancyMultiplier returns target occupancy
func (g *Generator) GetOccupancyMultiplier() float64 {
	return g.dayCycle.GetOccupancyMultiplier()
}

// GetActualOccupancy returns actual current occupancy for a carriage
func (g *Generator) GetActualOccupancy(carriage int) float64 {
	return g.getCurrentOccupancy(carriage)
}

func itoa(v int) string {
	return fmtInt(v)
}

// fmtInt converts a positive int to decimal string (no alloc heavy strconv).
func fmtInt(v int) string {
	if v == 0 {
		return "0"
	}
	var buf [20]byte
	i := len(buf)
	n := v
	if n < 0 {
		n = -n
	}
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if v < 0 {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
