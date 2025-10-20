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
            var today = DateTime.UtcNow.Date;
            var currentHour = DateTime.UtcNow.Hour;

            var seatRecord = await _context.CarriageSeats
                .Where(cs => cs.CarriageId == coachId &&
                             cs.Date.Date == today &&
                             cs.Date.Hour == currentHour)
                .FirstOrDefaultAsync();

            if (seatRecord == null)
            {
                // Create new seat record for this hour
                seatRecord = new CarriageSeats
                {
                    CarriageId = coachId,
                    Date = new DateTime(today.Year, today.Month, today.Day, currentHour, 0, 0),
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

        public bool IsSeatOccupied(int seatBitMap, int seatNumber)
        {
            var seatBit = 1 << (seatNumber - 1);
            return (seatBitMap & seatBit) != 0;
        }

        public int GetOccupiedSeatCount(int seatBitMap)
        {
            int count = 0;
            while (seatBitMap > 0)
            {
                count += seatBitMap & 1;
                seatBitMap >>= 1;
            }
            return count;
        }
    }
}
