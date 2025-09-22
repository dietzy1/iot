#!/bin/bash

# Test script for MQTT cluster
echo "MQTT Cluster Testing Scripts"
echo "==========================="

# Function to test individual brokers
test_individual_brokers() {
    echo "Testing individual brokers..."
    
    # Test Broker 1
    echo "Testing Broker 1 (port 1883):"
    mosquitto_pub -h localhost -p 1883 -t test/broker1 -m "Hello from Broker 1" &
    mosquitto_sub -h localhost -p 1883 -t test/broker1 -C 1 &
    
    # Test Broker 2
    echo "Testing Broker 2 (port 1884):"
    mosquitto_pub -h localhost -p 1884 -t test/broker2 -m "Hello from Broker 2" &
    mosquitto_sub -h localhost -p 1884 -t test/broker2 -C 1 &
    
    # Test Broker 3
    echo "Testing Broker 3 (port 1885):"
    mosquitto_pub -h localhost -p 1885 -t test/broker3 -m "Hello from Broker 3" &
    mosquitto_sub -h localhost -p 1885 -t test/broker3 -C 1 &
    
    sleep 2
}

# Function to test load balancer
test_load_balancer() {
    echo "Testing Load Balancer (port 1880):"
    
    # Start subscriber on load balanced port
    mosquitto_sub -h localhost -p 1880 -t test/cluster &
    SUB_PID=$!
    
    sleep 1
    
    # Send multiple messages through load balancer
    for i in {1..10}; do
        mosquitto_pub -h localhost -p 1880 -t test/cluster -m "Message $i through load balancer"
        sleep 0.5
    done
    
    sleep 2
    kill $SUB_PID 2>/dev/null
}

# Function to test cluster synchronization
test_cluster_sync() {
    echo "Testing Cluster Synchronization:"
    
    # Subscribe to one broker
    mosquitto_sub -h localhost -p 1883 -t sync/test &
    SUB_PID=$!
    
    sleep 1
    
    # Publish to different brokers
    echo "Publishing to Broker 2..."
    mosquitto_pub -h localhost -p 1884 -t sync/test -m "Message from Broker 2"
    
    sleep 1
    
    echo "Publishing to Broker 3..."
    mosquitto_pub -h localhost -p 1885 -t sync/test -m "Message from Broker 3"
    
    sleep 2
    kill $SUB_PID 2>/dev/null
}

# Function to check cluster health
check_cluster_health() {
    echo "Cluster Health Check:"
    echo "===================="
    
    # Check if containers are running
    echo "Container Status:"
    docker-compose ps
    
    echo -e "\nHAProxy Stats available at: http://localhost:8080/stats"
    
    # Check logs for errors
    echo -e "\nRecent logs from brokers:"
    echo "Broker 1:"
    docker-compose logs --tail=5 mqtt-broker-1
    echo -e "\nBroker 2:"
    docker-compose logs --tail=5 mqtt-broker-2
    echo -e "\nBroker 3:"
    docker-compose logs --tail=5 mqtt-broker-3
}

# Function to generate load test
load_test() {
    echo "Running Load Test:"
    echo "=================="
    
    # Start multiple subscribers
    for i in {1..5}; do
        mosquitto_sub -h localhost -p 1880 -t loadtest/topic$i &
    done
    
    sleep 2
    
    # Generate load
    for i in {1..100}; do
        TOPIC="loadtest/topic$((i % 5 + 1))"
        mosquitto_pub -h localhost -p 1880 -t "$TOPIC" -m "Load test message $i"
    done
    
    sleep 5
    
    # Kill subscribers
    pkill -f mosquitto_sub
}

# Main menu
case "${1:-menu}" in
    "individual")
        test_individual_brokers
        ;;
    "loadbalancer")
        test_load_balancer
        ;;
    "sync")
        test_cluster_sync
        ;;
    "health")
        check_cluster_health
        ;;
    "load")
        load_test
        ;;
    "all")
        test_individual_brokers
        echo -e "\n"
        test_load_balancer
        echo -e "\n"
        test_cluster_sync
        echo -e "\n"
        check_cluster_health
        ;;
    *)
        echo "MQTT Cluster Test Options:"
        echo "========================="
        echo "./test.sh individual    - Test individual brokers"
        echo "./test.sh loadbalancer  - Test load balancer"
        echo "./test.sh sync          - Test cluster synchronization"
        echo "./test.sh health        - Check cluster health"
        echo "./test.sh load          - Run load test"
        echo "./test.sh all           - Run all tests"
        echo ""
        echo "Cluster endpoints:"
        echo "- Load Balanced MQTT: localhost:1880"
        echo "- Direct Broker 1:    localhost:1883"
        echo "- Direct Broker 2:    localhost:1884" 
        echo "- Direct Broker 3:    localhost:1885"
        echo "- HAProxy Stats:      http://localhost:8080/stats"
        ;;
esac