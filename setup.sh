#!/bin/bash

# Create directory structure
mkdir -p config data/broker{1,2,3} log/broker{1,2,3}

# Mosquitto configuration for Broker 1
cat > config/mosquitto1.conf << 'EOF'
# Broker 1 Configuration
listener 1883 0.0.0.0
listener 9001 0.0.0.0
protocol websockets

# Persistence
persistence true
persistence_location /mosquitto/data/

# Logging
log_dest file /mosquitto/log/mosquitto.log
log_type error
log_type warning
log_type notice
log_type information

# Security
allow_anonymous true

# Bridge configuration for clustering
connection broker2
address mqtt-broker-2:1883
topic # both 0 "" ""
bridge_attempt_unsubscribe false
bridge_protocol_version mqttv311
restart_timeout 30

connection broker3
address mqtt-broker-3:1883
topic # both 0 "" ""
bridge_attempt_unsubscribe false
bridge_protocol_version mqttv311
restart_timeout 30
EOF

# Mosquitto configuration for Broker 2
cat > config/mosquitto2.conf << 'EOF'
# Broker 2 Configuration
listener 1883 0.0.0.0
listener 9001 0.0.0.0
protocol websockets

# Persistence
persistence true
persistence_location /mosquitto/data/

# Logging
log_dest file /mosquitto/log/mosquitto.log
log_type error
log_type warning
log_type notice
log_type information

# Security
allow_anonymous true

# Bridge configuration for clustering
connection broker1
address mqtt-broker-1:1883
topic # both 0 "" ""
bridge_attempt_unsubscribe false
bridge_protocol_version mqttv311
restart_timeout 30

connection broker3
address mqtt-broker-3:1883
topic # both 0 "" ""
bridge_attempt_unsubscribe false
bridge_protocol_version mqttv311
restart_timeout 30
EOF

# Mosquitto configuration for Broker 3
cat > config/mosquitto3.conf << 'EOF'
# Broker 3 Configuration
listener 1883 0.0.0.0
listener 9001 0.0.0.0
protocol websockets

# Persistence
persistence true
persistence_location /mosquitto/data/

# Logging
log_dest file /mosquitto/log/mosquitto.log
log_type error
log_type warning
log_type notice
log_type information

# Security
allow_anonymous true

# Bridge configuration for clustering
connection broker1
address mqtt-broker-1:1883
topic # both 0 "" ""
bridge_attempt_unsubscribe false
bridge_protocol_version mqttv311
restart_timeout 30

connection broker2
address mqtt-broker-2:1883
topic # both 0 "" ""
bridge_attempt_unsubscribe false
bridge_protocol_version mqttv311
restart_timeout 30
EOF

# HAProxy configuration
cat > config/haproxy.cfg << 'EOF'
global
    daemon
    log stdout local0

defaults
    mode tcp
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    log global

# MQTT Load Balancing
frontend mqtt_frontend
    bind *:1883
    default_backend mqtt_brokers

backend mqtt_brokers
    balance roundrobin
    option tcp-check
    tcp-check connect port 1883
    server broker1 mqtt-broker-1:1883 check
    server broker2 mqtt-broker-2:1883 check
    server broker3 mqtt-broker-3:1883 check

# HAProxy Statistics
frontend stats
    bind *:8080
    mode http
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
    stats realm "HAProxy\ Statistics"
    stats hide-version
EOF

# Set proper permissions
chmod -R 755 data log
chmod 644 config/*

echo "Configuration files created successfully!"
echo "To start the cluster, run: docker-compose up -d"