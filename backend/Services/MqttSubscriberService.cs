using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class MqttSubscriberService : BackgroundService
    {
        private readonly ILogger<MqttSubscriberService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public MqttSubscriberService(ILogger<MqttSubscriberService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MQTT Subscriber Service started");

            // TODO: Implement MQTT client connection and subscription logic
            // For now, this is a placeholder that logs periodically
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("MQTT Subscriber Service is running at: {time}", DateTimeOffset.Now);
                await Task.Delay(30000, stoppingToken); // Wait 30 seconds
            }

            _logger.LogInformation("MQTT Subscriber Service stopped");
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("MQTT Subscriber Service is stopping");
            return base.StopAsync(cancellationToken);
        }
    }
}