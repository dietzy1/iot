package sim

import (
	"encoding/json"
	"math/rand"
	"time"
)

type Event struct {
	Seat      int       `json:"seat"`
	Available bool      `json:"available"`
	Timestamp time.Time `json:"timestamp"`
	Train     string    `json:"train"`
	Coach     int       `json:"coach"`
	BatteryMV int       `json:"battery_mv"`
	SignalDBM int       `json:"signal_dbm"`
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

func (g *Generator) RandomEvent(coach int) (Event, []byte) {
	seat := 1 + g.rnd.Intn(g.cfg.SeatsPerCoach)
	available := g.rnd.Intn(100) < 70 // 70% chance available
	battery := 3500 + g.rnd.Intn(600)
	signal := -90 + g.rnd.Intn(40)
	e := Event{
		Seat:      seat,
		Available: available,
		Timestamp: time.Now().UTC(),
		Train:     g.cfg.Train,
		Coach:     coach,
		BatteryMV: battery,
		SignalDBM: signal,
	}
	b, _ := json.Marshal(e)
	return e, b
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
