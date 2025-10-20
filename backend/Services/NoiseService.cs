using backend.Data;
using backend.Models;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class NoiseService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NoiseService> _logger;

        public NoiseService(ApplicationDbContext context, ILogger<NoiseService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SaveNoiseData(int coachId, float noiseLevel, string location)
        {
            var newRecord = new CarriageNoise
            {
                CarriageId = coachId,
                Date = DateTime.UtcNow,
                NoiseLevel = noiseLevel,
                Location = location
            };

            _context.CarriageNoises.Add(newRecord);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Noise data saved: Coach {coachId}, Noise: {noiseLevel}dB, Location: {location}",
                coachId, noiseLevel, location);
        }
    }
}
