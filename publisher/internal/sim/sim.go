package sim

import (
	"encoding/json"
	"math/rand"
	"time"
)

// Base event with common fields that all events share
type BaseEvent struct {
	EventType string    `json:"event_type"`
	Timestamp time.Time `json:"timestamp"`
	Train     string    `json:"train"`
	Coach     int       `json:"coach"`
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
	Train         string
	Coaches       int
	SeatsPerCoach int
	BaseInterval  time.Duration
	Jitter        time.Duration
	Seed          int64
}

type Generator struct {
	cfg Config
	rnd *rand.Rand
}

func NewGenerator(cfg Config) *Generator {
	seed := cfg.Seed
	if seed == 0 {
		seed = time.Now().UnixNano()
	}
	return &Generator{cfg: cfg, rnd: rand.New(rand.NewSource(seed))}
}

func (g *Generator) Topic(coach int) string {
	return "train/" + g.cfg.Train + "/coach/" + itoa(coach)
}

// Topic for seat events
func (g *Generator) SeatTopic(coach int) string {
	return "train/" + g.cfg.Train + "/coach/" + itoa(coach) + "/seat"
}

// Topic for noise events
func (g *Generator) NoiseTopic(coach int) string {
	return "train/" + g.cfg.Train + "/coach/" + itoa(coach) + "/noise"
}

// Topic for temperature events
func (g *Generator) TemperatureTopic(coach int) string {
	return "train/" + g.cfg.Train + "/coach/" + itoa(coach) + "/temperature"
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

// Generate a random seat event
func (g *Generator) RandomSeatEvent(coach int) (SeatEvent, []byte) {
	seat := 1 + g.rnd.Intn(g.cfg.SeatsPerCoach)
	available := g.rnd.Intn(100) < 70 // 70% chance available

	e := SeatEvent{
		BaseEvent: BaseEvent{
			EventType: "seat",
			Timestamp: time.Now().UTC(),
			Train:     g.cfg.Train,
			Coach:     coach,
		},
		Seat:      seat,
		Available: available,
	}
	b, _ := json.Marshal(e)
	return e, b
}

// Generate a random noise event
func (g *Generator) RandomNoiseEvent(coach int) (NoiseEvent, []byte) {
	decibelLevel := 30.0 + g.rnd.Float64()*50.0 // 30-80 dB
	locations := []string{"front", "middle", "back"}
	location := locations[g.rnd.Intn(len(locations))]

	e := NoiseEvent{
		BaseEvent: BaseEvent{
			EventType: "noise",
			Timestamp: time.Now().UTC(),
			Train:     g.cfg.Train,
			Coach:     coach,
		},
		DecibelLevel: decibelLevel,
		Location:     location,
	}
	b, _ := json.Marshal(e)
	return e, b
}

// Generate a random temperature event
func (g *Generator) RandomTemperatureEvent(coach int) (TemperatureEvent, []byte) {
	temperature := 18.0 + g.rnd.Float64()*15.0 // 18-33°C
	humidity := 30.0 + g.rnd.Float64()*40.0    // 30-70%
	locations := []string{"ceiling", "floor", "window", "door"}
	location := locations[g.rnd.Intn(len(locations))]

	e := TemperatureEvent{
		BaseEvent: BaseEvent{
			EventType: "temperature",
			Timestamp: time.Now().UTC(),
			Train:     g.cfg.Train,
			Coach:     coach,
		},
		TemperatureCelsius: temperature,
		Humidity:           humidity,
		SensorLocation:     location,
	}
	b, _ := json.Marshal(e)
	return e, b
}

// Generate a random event of any type
func (g *Generator) RandomEvent(coach int) (interface{}, []byte) {
	eventType := g.rnd.Intn(3)
	switch eventType {
	case 0:
		return g.RandomSeatEvent(coach)
	case 1:
		return g.RandomNoiseEvent(coach)
	case 2:
		return g.RandomTemperatureEvent(coach)
	default:
		return g.RandomSeatEvent(coach)
	}
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
