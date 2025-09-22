package pub

import (
	"crypto/tls"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type PahoPublisher struct {
	client mqtt.Client
	qos    byte
	retain bool
}

type PahoConfig struct {
	BrokerURL          string
	ClientID           string
	Username           string
	Password           string
	InsecureSkipVerify bool
	QOS                byte
	Retain             bool
}

func NewPahoPublisher(cfg PahoConfig) (*PahoPublisher, error) {
	opts := mqtt.NewClientOptions().
		AddBroker(cfg.BrokerURL).
		SetClientID(cfg.ClientID).
		SetUsername(cfg.Username).
		SetPassword(cfg.Password).
		SetOrderMatters(false).
		SetConnectTimeout(5 * time.Second)

	if cfg.InsecureSkipVerify {
		tlsConfig := &tls.Config{InsecureSkipVerify: true}
		opts.SetTLSConfig(tlsConfig)
	}

	client := mqtt.NewClient(opts)
	token := client.Connect()
	if token.Wait() && token.Error() != nil {
		return nil, token.Error()
	}

	return &PahoPublisher{client: client, qos: cfg.QOS, retain: cfg.Retain}, nil
}

func (p *PahoPublisher) Publish(topic string, payload []byte) error {
	tok := p.client.Publish(topic, p.qos, p.retain, payload)
	tok.Wait()
	return tok.Error()
}

func (p *PahoPublisher) Close() error {
	if p.client != nil && p.client.IsConnected() {
		p.client.Disconnect(250)
	}
	return nil
}
