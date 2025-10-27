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

        // GET: api/analytics/occupancy?carriageId=1&timeSpan=1hour
        [HttpGet("occupancy")]
        public async Task<IActionResult> GetOccupancy([FromQuery] int? carriageId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            // Get all seat data first
            var allSeats = await _context.CarriageSeats.ToListAsync();
            
            // Get the latest record for each carriage
            var latestSeats = allSeats
                .GroupBy(cs => cs.CarriageId)
                .Select(g => g.OrderByDescending(cs => cs.Date).First())
                .ToList();

            // Filter by carriageId if specified
            if (carriageId.HasValue)
            {
                latestSeats = latestSeats.Where(cs => cs.CarriageId == carriageId.Value).ToList();
            }

            var totalSeats = latestSeats.Any() ? latestSeats.Sum(s => s.TotalSeats) : 0;
            var totalOccupied = latestSeats.Any() ? latestSeats.Sum(s => s.OcupiedSeats) : 0;
            var occupancyRate = totalSeats > 0 ? (totalOccupied * 100.0 / totalSeats) : 0;

            return Ok(new
            {
                totalPassengers = totalOccupied,
                totalSeats = totalSeats,
                occupancyRate = Math.Round(occupancyRate, 1),
                activeCarriages = latestSeats.Count
            });
        }

        // GET: api/analytics/temperature?carriageId=1&timeSpan=1hour
        [HttpGet("temperature")]
        public async Task<IActionResult> GetTemperature([FromQuery] int? carriageId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            // Get all temperature data first
            var allTemps = await _context.CarriageTemperatures.ToListAsync();
            
            // Get the latest record for each carriage
            var latestTemps = allTemps
                .GroupBy(ct => ct.CarriageId)
                .Select(g => g.OrderByDescending(ct => ct.Date).First())
                .ToList();

            // Filter by carriageId if specified
            if (carriageId.HasValue)
            {
                latestTemps = latestTemps.Where(ct => ct.CarriageId == carriageId.Value).ToList();
            }

            var avgTemperature = latestTemps.Any() ? latestTemps.Average(t => t.Temperature) : 0;
            var avgHumidity = latestTemps.Any() ? latestTemps.Average(t => t.Humidity) : 0;

            return Ok(new
            {
                avgTemperature = Math.Round(avgTemperature, 1),
                avgHumidity = Math.Round(avgHumidity, 1),
                dataPoints = latestTemps.Count
            });
        }

        // GET: api/analytics/noise?carriageId=1&timeSpan=1hour
        [HttpGet("noise")]
        public async Task<IActionResult> GetNoise([FromQuery] int? carriageId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            // Get all noise data first
            var allNoise = await _context.CarriageNoises.ToListAsync();
            
            // Get the latest record for each carriage
            var latestNoise = allNoise
                .GroupBy(cn => cn.CarriageId)
                .Select(g => g.OrderByDescending(cn => cn.Date).First())
                .ToList();

            // Filter by carriageId if specified
            if (carriageId.HasValue)
            {
                latestNoise = latestNoise.Where(cn => cn.CarriageId == carriageId.Value).ToList();
            }

            var avgNoiseLevel = latestNoise.Any() ? latestNoise.Average(n => n.NoiseLevel) : 0;

            return Ok(new
            {
                avgNoiseLevel = Math.Round(avgNoiseLevel, 1),
                dataPoints = latestNoise.Count
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

        // GET: api/analytics/temperature/history?carriageId=1&timeSpan=1hour
        [HttpGet("temperature/history")]
        public async Task<IActionResult> GetTemperatureHistory([FromQuery] int? carriageId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            var query = _context.CarriageTemperatures
                .Where(ct => ct.Date >= startTime);

            if (carriageId.HasValue)
            {
                query = query.Where(ct => ct.CarriageId == carriageId.Value);
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

            // Pivot data by carriage
            var pivotedData = groupedData
                .GroupBy(x => x.timestamp)
                .Select(g => new Dictionary<string, object>
                {
                    ["timestamp"] = g.Key,
                    ["time"] = g.Key.ToString("HH:mm")
                }.Concat(g.Select(item => new KeyValuePair<string, object>(
                    $"carriage{item.carriageId}",
                    item.temperature
                ))).ToDictionary(kvp => kvp.Key, kvp => kvp.Value))
                .ToList();

            return Ok(pivotedData);
        }

        // GET: api/analytics/noise/history?carriageId=1&timeSpan=1hour
        [HttpGet("noise/history")]
        public async Task<IActionResult> GetNoiseHistory([FromQuery] int? carriageId, [FromQuery] string timeSpan = "1hour")
        {
            var timeRange = GetTimeRange(timeSpan);
            var startTime = DateTime.UtcNow.AddMinutes(-timeRange);

            var query = _context.CarriageNoises
                .Where(cn => cn.Date >= startTime);

            if (carriageId.HasValue)
            {
                query = query.Where(cn => cn.CarriageId == carriageId.Value);
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

            // Pivot data by carriage
            var pivotedData = groupedData
                .GroupBy(x => x.timestamp)
                .Select(g => new Dictionary<string, object>
                {
                    ["timestamp"] = g.Key,
                    ["time"] = g.Key.ToString("HH:mm")
                }.Concat(g.Select(item => new KeyValuePair<string, object>(
                    $"carriage{item.carriageId}",
                    item.noiseLevel
                ))).ToDictionary(kvp => kvp.Key, kvp => kvp.Value))
                .ToList();

            return Ok(pivotedData);
        }

        // GET: api/analytics/seats/availability?carriageId=1
        [HttpGet("seats/availability")]
        public async Task<IActionResult> GetSeatAvailability([FromQuery] int? carriageId)
        {
            var query = _context.CarriageSeats.AsQueryable();

            if (carriageId.HasValue)
            {
                query = query.Where(cs => cs.CarriageId == carriageId.Value);
            }

            // Get all seat data and process in memory to avoid EF Core translation issues
            var allSeats = await query.ToListAsync();
            
            // Group by CarriageId and get the latest record for each
            var latestSeats = allSeats
                .GroupBy(cs => cs.CarriageId)
                .Select(g => g.OrderByDescending(cs => cs.Date).First())
                .ToList();

            var result = latestSeats.Select(seat => new
            {
                carriage = $"Carriage {seat.CarriageId}",
                occupied = seat.OcupiedSeats,
                available = seat.TotalSeats - seat.OcupiedSeats
            }).ToList();

            return Ok(result);
        }

        // GET: api/analytics/events/recent?carriageId=1&limit=50
        [HttpGet("events/recent")]
        public async Task<IActionResult> GetRecentEvents([FromQuery] int? carriageId, [FromQuery] int limit = 50)
        {
            var events = new List<object>();

            // Get recent temperature events
            var tempQuery = _context.CarriageTemperatures.AsQueryable();
            if (carriageId.HasValue)
            {
                tempQuery = tempQuery.Where(ct => ct.CarriageId == carriageId.Value);
            }

            var recentTemps = await tempQuery
                .OrderByDescending(ct => ct.Date)
                .Take(limit / 3)
                .Select(ct => new
                {
                    type = "temperature",
                    timestamp = ct.Date,
                    title = $"Temperature Update - Carriage {ct.CarriageId}",
                    description = $"{ct.Temperature:F1}°C, {ct.Humidity:F1}% humidity at {ct.SensorLocation}",
                    severity = ct.Temperature > 26 ? "high" : ct.Temperature < 20 ? "low" : "medium"
                })
                .ToListAsync();

            events.AddRange(recentTemps);

            // Get recent noise events
            var noiseQuery = _context.CarriageNoises.AsQueryable();
            if (carriageId.HasValue)
            {
                noiseQuery = noiseQuery.Where(cn => cn.CarriageId == carriageId.Value);
            }

            var recentNoise = await noiseQuery
                .OrderByDescending(cn => cn.Date)
                .Take(limit / 3)
                .Select(cn => new
                {
                    type = "noise",
                    timestamp = cn.Date,
                    title = $"Noise Update - Carriage {cn.CarriageId}",
                    description = $"{cn.NoiseLevel:F1}dB at {cn.Location}",
                    severity = cn.NoiseLevel > 70 ? "high" : cn.NoiseLevel < 50 ? "low" : "medium"
                })
                .ToListAsync();

            events.AddRange(recentNoise);

            // Get recent seat events
            var seatQuery = _context.CarriageSeats.AsQueryable();
            if (carriageId.HasValue)
            {
                seatQuery = seatQuery.Where(cs => cs.CarriageId == carriageId.Value);
            }

            var recentSeats = await seatQuery
                .OrderByDescending(cs => cs.Date)
                .Take(limit / 3)
                .Select(cs => new
                {
                    type = "seat",
                    timestamp = cs.Date,
                    title = $"Seat Update - Carriage {cs.CarriageId}",
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