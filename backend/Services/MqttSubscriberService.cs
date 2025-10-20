using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Protocol;
using System.Text.Json;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class MqttSubscriberService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MqttSubscriberService> _logger;
        private IMqttClient? _mqttClient;

        public MqttSubscriberService(
            IServiceProvider serviceProvider, 
            ILogger<MqttSubscriberService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var factory = new MqttFactory();
            _mqttClient = factory.CreateMqttClient();

            var options = new MqttClientOptionsBuilder()
                .WithTcpServer("localhost", 1883)
                .WithClientId("backend-subscriber")
                .WithCleanSession(false)
                .Build();

            _mqttClient.ApplicationMessageReceivedAsync += OnMessageReceived;

            try
            {
                await _mqttClient.ConnectAsync(options, stoppingToken);
                _logger.LogInformation("✅ Connected to MQTT broker on port 1883");

                // Subscribe to all IoT topics from Go publisher
                await _mqttClient.SubscribeAsync(new MqttTopicFilterBuilder()
                    .WithTopic("train/+/coach/+/+")
                    .Build(), stoppingToken);
                    
                _logger.LogInformation("✅ Subscribed to IoT topics: train/+/coach/+/+");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to connect to MQTT broker");
            }
        }

        private async Task OnMessageReceived(MqttApplicationMessageReceivedEventArgs e)
        {
            try
            {
                var topic = e.ApplicationMessage.Topic;
                var payload = e.ApplicationMessage.ConvertPayloadToString();
                
                _logger.LogInformation("📨 Received MQTT message on topic: {topic} - {payload}", topic, payload);
                
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var temperatureService = scope.ServiceProvider.GetRequiredService<TemperatureService>();
                var noiseService = scope.ServiceProvider.GetRequiredService<NoiseService>();
                var seatService = scope.ServiceProvider.GetRequiredService<SeatService>();

                // Parse topic: train/IC-123/coach/1/temperature
                var topicParts = topic.Split('/');
                if (topicParts.Length >= 5)
                {
                    var trainId = topicParts[1];  // IC-123
                    var coachIdStr = topicParts[3]; // 1
                    var sensorType = topicParts[4]; // temperature, seat, noise

                    if (int.TryParse(coachIdStr, out int coachId))
                    {
                        if (sensorType == "temperature")
                        {
                            await HandleTemperatureData(context, payload, coachId, temperatureService);
                        }
                        else if (sensorType == "noise")
                        {
                            await HandleNoiseData(context, payload, coachId, noiseService);
                        }
                        else if (sensorType == "seat")
                        {
                            await HandleSeatData(context, payload, coachId, topic, seatService);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error processing MQTT message: {topic}", e.ApplicationMessage.Topic);
            }
        }

        private async Task HandleTemperatureData(ApplicationDbContext context, string payload, int coachId, TemperatureService temperatureService)
        {
            try
            {
                var data = JsonSerializer.Deserialize<JsonElement>(payload);
                
                if (data.TryGetProperty("temperature_celsius", out var tempElement))
                {
                    var temperature = tempElement.GetSingle();
                    
                    // Extract additional temperature data from Go publisher
                    var humidity = 0.0f;
                    var sensorLocation = "unknown";
                    
                    if (data.TryGetProperty("humidity", out var humidityElement))
                    {
                        humidity = humidityElement.GetSingle();
                    }
                    
                    if (data.TryGetProperty("sensor_location", out var locationElement))
                    {
                        sensorLocation = locationElement.GetString() ?? "unknown";
                    }
                    
                    // Delegate to TemperatureService
                    await temperatureService.SaveTemperatureData(coachId, temperature, humidity, sensorLocation);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling temperature data: {error}", ex.Message);
            }
        }

        private async Task HandleNoiseData(ApplicationDbContext context, string payload, int coachId, NoiseService noiseService)
        {
            try
            {
                var data = JsonSerializer.Deserialize<JsonElement>(payload);
                
                if (data.TryGetProperty("decibel_level", out var noiseElement))
                {
                    var noiseLevel = noiseElement.GetSingle();
                    var location = data.TryGetProperty("location", out var locationElement) ? 
                                  locationElement.GetString() ?? "unknown" : "unknown";
                    
                    // Delegate to NoiseService
                    await noiseService.SaveNoiseData(coachId, noiseLevel, location);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling noise data: {error}", ex.Message);
            }
        }

        private async Task HandleSeatData(ApplicationDbContext context, string payload, int coachId, string topic, SeatService seatService)
        {
            try
            {
                var data = JsonSerializer.Deserialize<JsonElement>(payload);
                
                var isOccupied = true; // Default to occupied
                var seatNumber = 0;
                
                if (data.TryGetProperty("available", out var availableElement))
                {
                    isOccupied = !availableElement.GetBoolean(); // Available = false means occupied
                }
                
                if (data.TryGetProperty("seat", out var seatElement))
                {
                    seatNumber = seatElement.GetInt32();
                }

                // Delegate to SeatService
                await seatService.UpdateSeatData(coachId, seatNumber, isOccupied);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling seat data: {error}", ex.Message);
            }
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            if (_mqttClient?.IsConnected == true)
            {
                await _mqttClient.DisconnectAsync();
                _logger.LogInformation("🔌 Disconnected from MQTT broker");
            }
            await base.StopAsync(stoppingToken);
        }
    }
}