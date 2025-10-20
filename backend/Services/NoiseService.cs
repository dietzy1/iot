using backend.Data;
using backend.Models;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

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

        public async Task<List<Tuple<float, DateTime>>> GetAverageNoiseLevelPer5Min(int coachId, DateTime? from, DateTime? to)
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
                var Noises = await _context.CarriageNoises
                    .Where(cn => cn.CarriageId == coachId && cn.Date >= intermediateDateTime && cn.Date <= to)
                    .ToListAsync();

                if (Noises.Count > 0)
                {
                    var averageNoise = Noises.Average(n => n.NoiseLevel);
                    results.Add(Tuple.Create(averageNoise, intermediateDateTime.AddMinutes(2.5)));
                }

                to = intermediateDateTime;
                intermediateDateTime = intermediateDateTime.AddMinutes(-5);
            }
            while (intermediateDateTime >= from);

            _logger.LogInformation("Average noise level for Coach {coachId} from {from} to {to} is queried",
                coachId, from, to);

            return results;
        }
    }
}
