package main

import (
	"context"
	"flag"
	"fmt"
	"math/rand"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/martinvad/iot-train-seat-sim/internal/pub"
	"github.com/martinvad/iot-train-seat-sim/internal/sim"
)

func main() {
	var (
		train     = flag.String("train", "IC-123", "train number/id")
		carriages = flag.Int("carriages", 2, "number of carriages")
		seats     = flag.Int("seats", 32, "seats per carriage")
		interval  = flag.Duration("interval", 2*time.Second, "base interval between messages")
		jitter    = flag.Duration("jitter", 500*time.Millisecond, "max additional or subtracted jitter")
		seed      = flag.Int64("seed", 0, "random seed (0=random)")

		broker   = flag.String("broker", "", "mqtt broker url (e.g. tcp://host:1883). empty=stdout")
		clientID = flag.String("client", "train-seat-sim", "mqtt client id")
		qos      = flag.Int("qos", 0, "mqtt qos (0,1,2)")
		retain   = flag.Bool("retain", false, "mqtt retain flag")
		insecure = flag.Bool("insecure", false, "skip tls verification")
	)
	flag.Parse()

	username := strings.TrimSpace(os.Getenv("MQTT_USERNAME"))
	password := strings.TrimSpace(os.Getenv("MQTT_PASSWORD"))

	g := sim.NewGenerator(sim.Config{
		Train:            *train,
		Carriages:        *carriages,
		SeatsPerCarriage: *seats,
		BaseInterval:     *interval,
		Jitter:           *jitter,
		Seed:             *seed,
	})

	var p pub.Publisher
	var err error
	if strings.TrimSpace(*broker) == "" {
		p = pub.NewStdoutPublisher()
		fmt.Println("Using stdout publisher (no broker provided)")
	} else {
		p, err = pub.NewPahoPublisher(pub.PahoConfig{
			BrokerURL:          *broker,
			ClientID:           *clientID,
			Username:           username,
			Password:           password,
			InsecureSkipVerify: *insecure,
			QOS:                byte(*qos),
			Retain:             *retain,
		})
		if err != nil {
			fmt.Fprintf(os.Stderr, "mqtt connect error: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("Connected to broker:", *broker)
	}
	defer p.Close()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Log cycle status only when phase changes
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()
		lastPhase := g.GetPhaseName()
		
		// Print initial phase
		fmt.Printf("\n📊 Phase Changed: %s | Target Occupancy: %.0f%%\n", lastPhase, g.GetOccupancyMultiplier()*100)
		
		for {
			select {
			case <-ticker.C:
				currentPhase := g.GetPhaseName()
				if currentPhase != lastPhase {
					fmt.Printf("\n📊 Phase Changed: %s | Target Occupancy: %.0f%%\n", currentPhase, g.GetOccupancyMultiplier()*100)
					lastPhase = currentPhase
				}
			case <-ctx.Done():
				return
			}
		}
	}()
	
	// Log actual occupancy every 15 seconds for debugging
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				for i := 1; i <= *carriages; i++ {
					actual := g.GetActualOccupancy(i)
					fmt.Printf("   [Carriage %d] Actual Occupancy: %.0f%%\n", i, actual*100)
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	// Start one loop per carriage
	done := make(chan struct{})
	for carriage := 1; carriage <= *carriages; carriage++ {
		carriageNum := carriage
		go func() {
			defer func() { done <- struct{}{} }()
			// randomize initial offset so topics interleave
			initial := time.Duration(rand.Int63n(int64(g.NextDelay())))
			select {
			case <-time.After(initial):
			case <-ctx.Done():
				return
			}
			for {
				if ctx.Err() != nil {
					break
				}
				
				// Generate ALL three event types to ensure frequent seat updates
				seatEvent, seatPayload := g.RandomSeatEvent(carriageNum)
				if err := p.Publish(g.SeatTopic(carriageNum), seatPayload); err != nil {
					fmt.Fprintf(os.Stderr, "publish error: %v\n", err)
				}
				
				noiseEvent, noisePayload := g.RandomNoiseEvent(carriageNum)
				if err := p.Publish(g.NoiseTopic(carriageNum), noisePayload); err != nil {
					fmt.Fprintf(os.Stderr, "publish error: %v\n", err)
				}
				
				tempEvent, tempPayload := g.RandomTemperatureEvent(carriageNum)
				if err := p.Publish(g.TemperatureTopic(carriageNum), tempPayload); err != nil {
					fmt.Fprintf(os.Stderr, "publish error: %v\n", err)
				}
				
				// Avoid unused variable warnings
				_ = seatEvent
				_ = noiseEvent
				_ = tempEvent
				
				delay := g.NextDelay()
				select {
				case <-time.After(delay):
				case <-ctx.Done():
					return
				}
			}
		}()
	}

	// Wait for signal
	<-ctx.Done()
	fmt.Println("Shutting down...")
	// Wait for all goroutines to signal done
	for i := 0; i < *carriages; i++ {
		<-done
	}
}
