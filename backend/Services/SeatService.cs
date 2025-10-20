using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class SeatService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SeatService> _logger;

        public SeatService(ApplicationDbContext context, ILogger<SeatService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task UpdateSeatData(int coachId, int seatNumber, bool isOccupied)
        {
            var seatRecord = await _context.CarriageSeats
                .Where(cs => cs.CarriageId == coachId)
                .OrderByDescending(cs => cs.Date)
                .FirstOrDefaultAsync();

            if (seatRecord == null)
            {
                // Create first record for this coach
                seatRecord = new CarriageSeats
                {
                    CarriageId = coachId,
                    Date = DateTime.UtcNow,
                    TotalSeats = 24,
                    OcupiedSeats = isOccupied ? 1 : 0,
                    OcupiedSeatsBitMap = isOccupied ? (1 << (seatNumber - 1)) : 0
                };
                _context.CarriageSeats.Add(seatRecord);
            }
            else
            {
                // Update existing record using bit manipulation
                var seatBit = 1 << (seatNumber - 1);

                if (isOccupied)
                {
                    // Set the bit for this seat if not already set
                    if ((seatRecord.OcupiedSeatsBitMap & seatBit) == 0)
                    {
                        seatRecord.OcupiedSeatsBitMap |= seatBit;
                        seatRecord.OcupiedSeats++;
                    }
                }
                else
                {
                    // Clear the bit for this seat if currently set
                    if ((seatRecord.OcupiedSeatsBitMap & seatBit) != 0)
                    {
                        seatRecord.OcupiedSeatsBitMap &= ~seatBit;
                        seatRecord.OcupiedSeats--;
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Seat data updated: Coach {coachId}, Seat {seatNumber}, Occupied: {isOccupied}, Total Occupied: {occupied}/{total}",
                coachId, seatNumber, isOccupied, seatRecord.OcupiedSeats, seatRecord.TotalSeats);
        }

        public async Task<int> GetAvailableSeats(int coachId, DateTime? dateTime)
        {
            if (dateTime == null)
            {
                dateTime = DateTime.UtcNow;
            }

            var seatRecord = await _context.CarriageSeats
                .Where(cs => cs.CarriageId == coachId && cs.Date <= dateTime)
                .OrderByDescending(cs => cs.Date)
                .FirstOrDefaultAsync();

            if (seatRecord == null)
            {
                return 24; // No records found, assume all seats are available
            }

            return seatRecord.TotalSeats - seatRecord.OcupiedSeats;
        }

        public async Task<int> GetSeatsBitMap(int coachId, DateTime? dateTime)
        {
            if (dateTime == null)
            {
                dateTime = DateTime.UtcNow;
            }

            var seatRecord = await _context.CarriageSeats
                .Where(cs => cs.CarriageId == coachId && cs.Date <= dateTime)
                .OrderByDescending(cs => cs.Date)
                .FirstOrDefaultAsync();

            if (seatRecord == null)
            {
                return 0; // No records found, assume no seats are occupied
            }

            return seatRecord.OcupiedSeatsBitMap;
        }
    }
}
