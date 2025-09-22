//go:build !tiny

package pub

import (
	"fmt"
)

type StdoutPublisher struct{}

func NewStdoutPublisher() *StdoutPublisher { return &StdoutPublisher{} }

func (s *StdoutPublisher) Publish(topic string, payload []byte) error {
	fmt.Printf("PUB %s %s\n", topic, string(payload))
	return nil
}

func (s *StdoutPublisher) Close() error { return nil }
