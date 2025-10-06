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
		train    = flag.String("train", "IC-123", "train number/id")
		coaches  = flag.Int("coaches", 2, "number of coaches")
		seats    = flag.Int("seats", 32, "seats per coach")
		interval = flag.Duration("interval", 2*time.Second, "base interval between messages")
		jitter   = flag.Duration("jitter", 500*time.Millisecond, "max additional or subtracted jitter")
		seed     = flag.Int64("seed", 0, "random seed (0=random)")

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
		Train:         *train,
		Coaches:       *coaches,
		SeatsPerCoach: *seats,
		BaseInterval:  *interval,
		Jitter:        *jitter,
		Seed:          *seed,
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

	// Start one loop per coach
	done := make(chan struct{})
	for coach := 1; coach <= *coaches; coach++ {
		coachNum := coach
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
				event, payload := g.RandomEvent(coachNum)

				var topic string
				switch event.(type) {
				case sim.SeatEvent:
					topic = g.SeatTopic(coachNum)
				case sim.NoiseEvent:
					topic = g.NoiseTopic(coachNum)
				case sim.TemperatureEvent:
					topic = g.TemperatureTopic(coachNum)
				default:
					topic = g.Topic(coachNum) // fallback to generic topic
				}

				if err := p.Publish(topic, payload); err != nil {
					fmt.Fprintf(os.Stderr, "publish error: %v\n", err)
				}
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
	for i := 0; i < *coaches; i++ {
		<-done
	}
}
