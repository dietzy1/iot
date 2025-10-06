using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IoTDbContext _context;

        public TestController(IoTDbContext context)
        {
            _context = context;
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedData()
        {
            // Add sample data
            var seatData = new CarriageSeats
            {
                CarriageId = 1,
                Date = DateTime.UtcNow,
                TotalSeats = 24,
                OcupiedSeats = 5,
                OcupiedSeatsBitMap = 31 // First 5 seats occupied (binary 11111)
            };

            var noiseTempData = new CarriageNoiseAndTemp
            {
                CarriageId = 1,
                Date = DateTime.UtcNow,
                Temperature = 22.5m,
                NoiseLevel = 45.2m
            };

            _context.CarriageSeats.Add(seatData);
            _context.CarriageNoiseAndTemp.Add(noiseTempData);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Sample data added successfully" });
        }

        [HttpGet("seats")]
        public async Task<IActionResult> GetSeats()
        {
            var seats = await _context.CarriageSeats.ToListAsync();
            return Ok(seats);
        }

        [HttpGet("noise-temp")]
        public async Task<IActionResult> GetNoiseTemp()
        {
            var data = await _context.CarriageNoiseAndTemp.ToListAsync();
            return Ok(data);
        }
    }
}