using backend.Data;
using backend.Models;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class TemperatureService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TemperatureService> _logger;

        public TemperatureService(ApplicationDbContext context, ILogger<TemperatureService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SaveTemperatureData(int coachId, float temperature, float humidity, string sensorLocation)
        {
            var newRecord = new CarriageTemperature
            {
                CarriageId = coachId,
                Date = DateTime.UtcNow,
                Temperature = temperature,
                Humidity = humidity,
                SensorLocation = sensorLocation
            };

            _context.CarriageTemperatures.Add(newRecord);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Temperature data saved: Coach {coachId}, Temp: {temperature}°C, Humidity: {humidity}%, Location: {sensorLocation}",
                coachId, temperature, humidity, sensorLocation);
        }
    }
}
