using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IIoTDataService
    {
        Task<IEnumerable<CarriageSeats>> GetCarriageSeatsAsync();
        Task<IEnumerable<CarriageNoiseAndTemp>> GetCarriageNoiseAndTempAsync();
        Task AddCarriageSeatsAsync(CarriageSeats carriageSeats);
        Task AddCarriageNoiseAndTempAsync(CarriageNoiseAndTemp carriageNoiseAndTemp);
    }

    public class IoTDataService : IIoTDataService
    {
        private readonly IoTDbContext _context;
        private readonly ILogger<IoTDataService> _logger;

        public IoTDataService(IoTDbContext context, ILogger<IoTDataService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<CarriageSeats>> GetCarriageSeatsAsync()
        {
            return await _context.CarriageSeats.ToListAsync();
        }

        public async Task<IEnumerable<CarriageNoiseAndTemp>> GetCarriageNoiseAndTempAsync()
        {
            return await _context.CarriageNoiseAndTemp.ToListAsync();
        }

        public async Task AddCarriageSeatsAsync(CarriageSeats carriageSeats)
        {
            _context.CarriageSeats.Add(carriageSeats);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Added carriage seats data for carriage {CarriageId}", carriageSeats.CarriageId);
        }

        public async Task AddCarriageNoiseAndTempAsync(CarriageNoiseAndTemp carriageNoiseAndTemp)
        {
            _context.CarriageNoiseAndTemp.Add(carriageNoiseAndTemp);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Added noise and temperature data for carriage {CarriageId}", carriageNoiseAndTemp.CarriageId);
        }
    }
}