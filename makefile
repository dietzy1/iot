# Default target
help: ## Show this help message
	@echo "IoT Train Seat Simulation - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'


build: ## Build the application
	@echo "Building the application..."
	@mkdir -p ./bin
	@cd publisher && go build -o ../bin/train-sim ./cmd/sim/main.go

# Development targets
dev: build ## Build and run in development mode with stdout output
	@echo "Running in development mode (stdout output)..."
	./bin/train-sim -train "DEV-001" -coaches 2 -seats 32 -interval 1s -jitter 200ms

# Application running modes
run-stdout: build ## Run with stdout output (no MQTT broker needed)
	@echo "Running with stdout output..."
	./bin/train-sim -train "IC-123" -coaches 3 -seats 32 -interval 2s -jitter 500ms

run-broker1: build ## Run connected to MQTT Broker 1 (port 1883)
	@echo "Running connected to MQTT Broker 1 (localhost:1883)..."
	./bin/train-sim -broker "tcp://localhost:1883" -train "IC-123" -coaches 3 -seats 32 -interval 2s -jitter 500ms -client "sim-broker1"

run-broker2: build ## Run connected to MQTT Broker 2 (port 1884)
	@echo "Running connected to MQTT Broker 2 (localhost:1884)..."
	./bin/train-sim -broker "tcp://localhost:1884" -train "IC-456" -coaches 2 -seats 24 -interval 1s -jitter 300ms -client "sim-broker2"

run-broker3: build ## Run connected to MQTT Broker 3 (port 1885)
	@echo "Running connected to MQTT Broker 3 (localhost:1885)..."
	./bin/train-sim -broker "tcp://localhost:1885" -train "IC-789" -coaches 4 -seats 40 -interval 3s -jitter 800ms -client "sim-broker3"

run-haproxy: build ## Run connected to HAProxy load balancer (port 1880)
	@echo "Running connected to HAProxy load balancer (localhost:1880)..."
	./bin/train-sim -broker "tcp://localhost:1880" -train "IC-LOAD" -coaches 2 -seats 32 -interval 1s -jitter 400ms -client "sim-haproxy"

# Multi-train simulation (run multiple instances)
run-multi: build ## Run multiple train simulations simultaneously
	@echo "Starting multiple train simulations..."
	@echo "Starting IC-123 on broker 1..."
	./bin/train-sim -broker "tcp://localhost:1883" -train "IC-123" -coaches 3 -seats 32 -interval 2s -client "ic123" & \
	echo "Starting IC-456 on broker 2..." && \
	./bin/train-sim -broker "tcp://localhost:1884" -train "IC-456" -coaches 2 -seats 24 -interval 1500ms -client "ic456" & \
	echo "Starting IC-789 on broker 3..." && \
	./bin/train-sim -broker "tcp://localhost:1885" -train "IC-789" -coaches 4 -seats 40 -interval 3s -client "ic789" & \
	echo "All simulations started. Press Ctrl+C to stop all." && \
	wait

# Status and info
status: ## Show status of all services
	@echo "Docker services status:"
	@docker-compose ps
	@echo ""
	@echo "Available MQTT endpoints:"
	@echo "  - Broker 1: tcp://localhost:1883"
	@echo "  - Broker 2: tcp://localhost:1884"
	@echo "  - Broker 3: tcp://localhost:1885" 
	@echo "  - HAProxy:  tcp://localhost:1880"
	@echo "  - HAProxy Stats: http://localhost:8080"

# Cleanup
clean: ## Remove built binaries
	@echo "Cleaning up..."
	@rm -rf ./bin

# Default target
.DEFAULT_GOAL := help