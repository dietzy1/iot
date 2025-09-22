package pub

type Publisher interface {
	Publish(topic string, payload []byte) error
	Close() error
}
