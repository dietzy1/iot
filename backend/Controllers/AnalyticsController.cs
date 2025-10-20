using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(ApplicationDbContext context, ILogger<AnalyticsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/analytics/occupancy?coachId=1&timeSpan=1hour
        [HttpGet("occupancy")]
        public async Task<IActionResult> GetOccupancy([FromQuery] int? coachId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            var query = _context.CarriageSeats
                .Where(cs => cs.Date >= startTime);

            if (coachId.HasValue)
            {
                query = query.Where(cs => cs.CarriageId == coachId.Value);
            }

            var seatData = await query.ToListAsync();

            var totalSeats = seatData.Any() ? seatData.Sum(s => s.TotalSeats) : 0;
            var totalOccupied = seatData.Any() ? seatData.Sum(s => s.OcupiedSeats) : 0;
            var occupancyRate = totalSeats > 0 ? (totalOccupied * 100.0 / totalSeats) : 0;

            return Ok(new
            {
                totalPassengers = totalOccupied,
                totalSeats = totalSeats,
                occupancyRate = Math.Round(occupancyRate, 1),
                activeCarriages = seatData.Select(s => s.CarriageId).Distinct().Count()
            });
        }

        // GET: api/analytics/temperature?coachId=1&timeSpan=1hour
        [HttpGet("temperature")]
        public async Task<IActionResult> GetTemperature([FromQuery] int? coachId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            var query = _context.CarriageTemperatures
                .Where(ct => ct.Date >= startTime);

            if (coachId.HasValue)
            {
                query = query.Where(ct => ct.CarriageId == coachId.Value);
            }

            var tempData = await query.ToListAsync();

            var avgTemperature = tempData.Any() ? tempData.Average(t => t.Temperature) : 0;
            var avgHumidity = tempData.Any() ? tempData.Average(t => t.Humidity) : 0;

            return Ok(new
            {
                avgTemperature = Math.Round(avgTemperature, 1),
                avgHumidity = Math.Round(avgHumidity, 1),
                dataPoints = tempData.Count
            });
        }

        // GET: api/analytics/noise?coachId=1&timeSpan=1hour
        [HttpGet("noise")]
        public async Task<IActionResult> GetNoise([FromQuery] int? coachId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            var query = _context.CarriageNoises
                .Where(cn => cn.Date >= startTime);

            if (coachId.HasValue)
            {
                query = query.Where(cn => cn.CarriageId == coachId.Value);
            }

            var noiseData = await query.ToListAsync();

            var avgNoiseLevel = noiseData.Any() ? noiseData.Average(n => n.NoiseLevel) : 0;

            return Ok(new
            {
                avgNoiseLevel = Math.Round(avgNoiseLevel, 1),
                dataPoints = noiseData.Count
            });
        }

        // GET: api/analytics/last-updated
        [HttpGet("last-updated")]
        public async Task<IActionResult> GetLastUpdated()
        {
            var lastTempUpdate = await _context.CarriageTemperatures
                .OrderByDescending(ct => ct.Date)
                .Select(ct => ct.Date)
                .FirstOrDefaultAsync();

            var lastNoiseUpdate = await _context.CarriageNoises
                .OrderByDescending(cn => cn.Date)
                .Select(cn => cn.Date)
                .FirstOrDefaultAsync();

            var lastSeatUpdate = await _context.CarriageSeats
                .OrderByDescending(cs => cs.Date)
                .Select(cs => cs.Date)
                .FirstOrDefaultAsync();

            var lastUpdate = new[] { lastTempUpdate, lastNoiseUpdate, lastSeatUpdate }
                .Where(d => d != default(DateTime))
                .OrderByDescending(d => d)
                .FirstOrDefault();

            return Ok(new
            {
                lastUpdated = lastUpdate.ToString("yyyy-MM-ddTHH:mm:ssZ")
            });
        }

        // GET: api/analytics/temperature/history?coachId=1&timeSpan=1hour
        [HttpGet("temperature/history")]
        public async Task<IActionResult> GetTemperatureHistory([FromQuery] int? coachId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            var query = _context.CarriageTemperatures
                .Where(ct => ct.Date >= startTime);

            if (coachId.HasValue)
            {
                query = query.Where(ct => ct.CarriageId == coachId.Value);
            }

            var tempData = await query
                .OrderBy(ct => ct.Date)
                .ToListAsync();

            // Group by 5-minute intervals
            var groupedData = tempData
                .GroupBy(ct => new
                {
                    Interval = new DateTime(ct.Date.Year, ct.Date.Month, ct.Date.Day, ct.Date.Hour, (ct.Date.Minute / 5) * 5, 0),
                    CarriageId = ct.CarriageId
                })
                .Select(g => new
                {
                    timestamp = g.Key.Interval,
                    time = g.Key.Interval.ToString("HH:mm"),
                    carriageId = g.Key.CarriageId,
                    temperature = Math.Round(g.Average(x => x.Temperature), 1),
                    humidity = Math.Round(g.Average(x => x.Humidity), 1)
                })
                .OrderBy(x => x.timestamp)
                .ToList();

            // Pivot data by coach
            var pivotedData = groupedData
                .GroupBy(x => x.timestamp)
                .Select(g => new Dictionary<string, object>
                {
                    ["timestamp"] = g.Key,
                    ["time"] = g.Key.ToString("HH:mm")
                }.Concat(g.Select(item => new KeyValuePair<string, object>(
                    $"coach{item.carriageId}",
                    item.temperature
                ))).ToDictionary(kvp => kvp.Key, kvp => kvp.Value))
                .ToList();

            return Ok(pivotedData);
        }

        // GET: api/analytics/noise/history?coachId=1&timeSpan=1hour
        [HttpGet("noise/history")]
        public async Task<IActionResult> GetNoiseHistory([FromQuery] int? coachId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            var query = _context.CarriageNoises
                .Where(cn => cn.Date >= startTime);

            if (coachId.HasValue)
            {
                query = query.Where(cn => cn.CarriageId == coachId.Value);
            }

            var noiseData = await query
                .OrderBy(cn => cn.Date)
                .ToListAsync();

            // Group by 5-minute intervals
            var groupedData = noiseData
                .GroupBy(cn => new
                {
                    Interval = new DateTime(cn.Date.Year, cn.Date.Month, cn.Date.Day, cn.Date.Hour, (cn.Date.Minute / 5) * 5, 0),
                    CarriageId = cn.CarriageId
                })
                .Select(g => new
                {
                    timestamp = g.Key.Interval,
                    time = g.Key.Interval.ToString("HH:mm"),
                    carriageId = g.Key.CarriageId,
                    noiseLevel = Math.Round(g.Average(x => x.NoiseLevel), 1)
                })
                .OrderBy(x => x.timestamp)
                .ToList();

            // Pivot data by coach
            var pivotedData = groupedData
                .GroupBy(x => x.timestamp)
                .Select(g => new Dictionary<string, object>
                {
                    ["timestamp"] = g.Key,
                    ["time"] = g.Key.ToString("HH:mm")
                }.Concat(g.Select(item => new KeyValuePair<string, object>(
                    $"coach{item.carriageId}",
                    item.noiseLevel
                ))).ToDictionary(kvp => kvp.Key, kvp => kvp.Value))
                .ToList();

            return Ok(pivotedData);
        }

        // GET: api/analytics/seats/availability?coachId=1
        [HttpGet("seats/availability")]
        public async Task<IActionResult> GetSeatAvailability([FromQuery] int? coachId)
        {
            var query = _context.CarriageSeats.AsQueryable();

            if (coachId.HasValue)
            {
                query = query.Where(cs => cs.CarriageId == coachId.Value);
            }

            var latestSeats = await query
                .GroupBy(cs => cs.CarriageId)
                .Select(g => g.OrderByDescending(cs => cs.Date).FirstOrDefault())
                .Where(cs => cs != null)
                .ToListAsync();

            var result = latestSeats.Select(seat => new
            {
                coach = $"Coach {seat!.CarriageId}",
                occupied = seat.OcupiedSeats,
                available = seat.TotalSeats - seat.OcupiedSeats
            }).ToList();

            return Ok(result);
        }

        // GET: api/analytics/events/recent?coachId=1&limit=50
        [HttpGet("events/recent")]
        public async Task<IActionResult> GetRecentEvents([FromQuery] int? coachId, [FromQuery] int limit = 50)
        {
            var events = new List<object>();

            // Get recent temperature events
            var tempQuery = _context.CarriageTemperatures.AsQueryable();
            if (coachId.HasValue)
            {
                tempQuery = tempQuery.Where(ct => ct.CarriageId == coachId.Value);
            }

            var recentTemps = await tempQuery
                .OrderByDescending(ct => ct.Date)
                .Take(limit / 3)
                .Select(ct => new
                {
                    type = "temperature",
                    timestamp = ct.Date,
                    title = $"Temperature Update - Coach {ct.CarriageId}",
                    description = $"{ct.Temperature:F1}°C, {ct.Humidity:F1}% humidity at {ct.SensorLocation}",
                    severity = ct.Temperature > 26 ? "high" : ct.Temperature < 20 ? "low" : "medium"
                })
                .ToListAsync();

            events.AddRange(recentTemps);

            // Get recent noise events
            var noiseQuery = _context.CarriageNoises.AsQueryable();
            if (coachId.HasValue)
            {
                noiseQuery = noiseQuery.Where(cn => cn.CarriageId == coachId.Value);
            }

            var recentNoise = await noiseQuery
                .OrderByDescending(cn => cn.Date)
                .Take(limit / 3)
                .Select(cn => new
                {
                    type = "noise",
                    timestamp = cn.Date,
                    title = $"Noise Update - Coach {cn.CarriageId}",
                    description = $"{cn.NoiseLevel:F1}dB at {cn.Location}",
                    severity = cn.NoiseLevel > 70 ? "high" : cn.NoiseLevel < 50 ? "low" : "medium"
                })
                .ToListAsync();

            events.AddRange(recentNoise);

            // Get recent seat events
            var seatQuery = _context.CarriageSeats.AsQueryable();
            if (coachId.HasValue)
            {
                seatQuery = seatQuery.Where(cs => cs.CarriageId == coachId.Value);
            }

            var recentSeats = await seatQuery
                .OrderByDescending(cs => cs.Date)
                .Take(limit / 3)
                .Select(cs => new
                {
                    type = "seat",
                    timestamp = cs.Date,
                    title = $"Seat Update - Coach {cs.CarriageId}",
                    description = $"Occupancy: {cs.OcupiedSeats}/{cs.TotalSeats} seats ({(cs.OcupiedSeats * 100.0 / cs.TotalSeats):F1}%)",
                    severity = (cs.OcupiedSeats * 100.0 / cs.TotalSeats) > 80 ? "high" : 
                               (cs.OcupiedSeats * 100.0 / cs.TotalSeats) > 50 ? "medium" : "low"
                })
                .ToListAsync();

            events.AddRange(recentSeats);

            // Sort all events by timestamp and take the requested limit
            var sortedEvents = events
                .OrderByDescending(e => ((dynamic)e).timestamp)
                .Take(limit)
                .ToList();

            return Ok(sortedEvents);
        }

        // Helper method to convert timeSpan string to minutes
        private int GetTimeRange(string timeSpan)
        {
            return timeSpan.ToLower() switch
            {
                "10min" => 10,
                "1hour" => 60,
                "6hours" => 360,
                "24hours" => 1440,
                _ => 60 // default to 1 hour
            };
        }
    }
}