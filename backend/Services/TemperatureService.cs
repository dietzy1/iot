using backend.Data;
using backend.Models;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

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

        public async Task SaveTemperatureData(int carriageId, float temperature, float humidity, string sensorLocation)
        {
            var newRecord = new CarriageTemperature
            {
                CarriageId = carriageId,
                Date = DateTime.UtcNow,
                Temperature = temperature,
                Humidity = humidity,
                SensorLocation = sensorLocation
            };

            _context.CarriageTemperatures.Add(newRecord);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Temperature data saved: Carriage {carriageId}, Temp: {temperature}°C, Humidity: {humidity}%, Location: {sensorLocation}",
                carriageId, temperature, humidity, sensorLocation);
        }

        public async Task<List<Tuple<float, DateTime>>> GetAverageTemperaturePer5Min(int carriageId, DateTime? from, DateTime? to)
        {
            if (to == null)
            {
                to = DateTime.UtcNow;
            }

            if (from == null)
            {
                from = to.Value.AddMinutes(-5);
            }

            var intermediateDateTime = to.Value.AddMinutes(-5);
            var results = new List<Tuple<float, DateTime>>();

            do
            {
                var Temperatures = await _context.CarriageTemperatures
                    .Where(cn => cn.CarriageId == carriageId && cn.Date >= intermediateDateTime && cn.Date <= to)
                    .ToListAsync();

                if (Temperatures.Count > 0)
                {
                    var averageTemperature = Temperatures.Average(n => n.Temperature);
                    results.Add(Tuple.Create(averageTemperature, intermediateDateTime.AddMinutes(2.5)));
                }

                to = intermediateDateTime;
                intermediateDateTime = intermediateDateTime.AddMinutes(-5);
            }
            while (intermediateDateTime >= from);

            _logger.LogInformation("Average temperature for Carriage {carriageId} from {from} to {to} is queried",
                carriageId, from, to);

            return results;
        }

        public async Task<List<Tuple<float, DateTime>>> GetAverageHumidityPer5Min(int carriageId, DateTime? from, DateTime? to)
        {
            if (to == null)
            {
                to = DateTime.UtcNow;
            }

            if (from == null)
            {
                from = to.Value.AddMinutes(-5);
            }

            var intermediateDateTime = to.Value.AddMinutes(-5);
            var results = new List<Tuple<float, DateTime>>();

            do
            {
                var Humidities = await _context.CarriageTemperatures
                    .Where(cn => cn.CarriageId == carriageId && cn.Date >= intermediateDateTime && cn.Date <= to)
                    .ToListAsync();

                if (Humidities.Count > 0)
                {
                    var averageHumidity = Humidities.Average(n => n.Humidity);
                    results.Add(Tuple.Create(averageHumidity, intermediateDateTime.AddMinutes(2.5)));
                }

                to = intermediateDateTime;
                intermediateDateTime = intermediateDateTime.AddMinutes(-5);
            }
            while (intermediateDateTime >= from);

            _logger.LogInformation("Average humidity for Carriage {carriageId} from {from} to {to} is queried",
                carriageId, from, to);

            return results;
        }
    }
}
