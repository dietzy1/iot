## Train Seat Availability Simulator (Go + MQTT)

Simulates seat-availability events for train carriages and publishes them via MQTT. Desktop Go publisher provided; TinyGo/ESP32 publisher skeleton included.

### Topic and Payload
- Topic: `train/{trainNumber}/carriage/{carriageNumber}`
- JSON payload example:
```json
{
  "seat": 17,
  "available": true,
  "timestamp": "2025-01-01T12:00:00Z",
  "train": "IC-123",
  "carriage": 2,
  "battery_mv": 3725,
  "signal_dbm": -67
}
```

### Run (desktop)
```bash
cd /Users/martinvad/uni/iot
go mod tidy
go run ./cmd/sim \
  --train IC-123 \
  --carriages 3 \
  --seats 64 \
  --interval 2s \
  --broker tcp://localhost:1883
```

Optional env vars: `MQTT_USERNAME`, `MQTT_PASSWORD`

