# Default target
help: ## Show this help message
	@echo "IoT Train Seat Simulation - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'


build: ## Build the application
	@echo "Building the application..."
	@mkdir -p ./bin
	@cd publisher && go build -o ../bin/train-sim ./cmd/sim/main.go

# Application running modes
run-stdout: build ## Run with stdout output (no MQTT broker needed)
	@echo "Running with stdout output..."
	./bin/train-sim -train "IC-123" -coaches 3 -seats 32 -interval 2s -jitter 500ms

run-haproxy: build ## Run connected to HAProxy load balancer (port 1880)
	@echo "Running connected to HAProxy load balancer (localhost:1880)..."
	./bin/train-sim -broker "tcp://localhost:1880" -train "IC-LOAD" -coaches 2 -seats 32 -interval 1s -jitter 400ms -client "sim-haproxy"

# Cleanup
clean: ## Remove built binaries
	@echo "Cleaning up..."
	@rm -rf ./bin

# Default target
.DEFAULT_GOAL := help