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

        // 1. Stats Overview - for stats-overview.tsx
        [HttpGet("overview")]
        public async Task<ActionResult<object>> GetStatsOverview()
        {
            try
            {
                // Get latest seat data for each carriage (simplified query)
                var allSeatData = await _context.CarriageSeats
                    .OrderByDescending(cs => cs.Date)
                    .ToListAsync();

                var latestSeatData = allSeatData
                    .GroupBy(cs => cs.CarriageId)
                    .Select(g => g.First())
                    .ToList();

                // Get latest temperature data for each carriage from new separate table
                var allTempData = await _context.CarriageTemperatures
                    .OrderByDescending(ct => ct.Date)
                    .ToListAsync();

                var latestTempData = allTempData
                    .GroupBy(ct => ct.CarriageId)
                    .Select(g => g.First())
                    .ToList();

                // Get latest noise data for each carriage from new separate table  
                var allNoiseData = await _context.CarriageNoises
                    .OrderByDescending(cn => cn.Date)
                    .ToListAsync();

                var latestNoiseData = allNoiseData
                    .GroupBy(cn => cn.CarriageId)
                    .Select(g => g.First())
                    .ToList();

                // Calculate metrics
                var totalCarriages = latestSeatData.Count;
                var totalSeats = latestSeatData.Sum(cs => cs.TotalSeats);
                var occupiedSeats = latestSeatData.Sum(cs => cs.OcupiedSeats);
                var occupancyRate = totalSeats > 0 ? (double)occupiedSeats / totalSeats * 100 : 0;
                
                var avgTemperature = latestTempData.Any() ? (double)latestTempData.Average(ct => ct.Temperature) : 22.0;
                var avgNoiseLevel = latestNoiseData.Any() ? (double)latestNoiseData.Average(cn => cn.NoiseLevel) : 45.0;

                // Calculate trends (compare with 1 hour ago)
                var oneHourAgo = DateTime.UtcNow.AddHours(-1);
                var previousSeatData = allSeatData
                    .Where(cs => cs.Date >= oneHourAgo && cs.Date < DateTime.UtcNow.AddMinutes(-30))
                    .GroupBy(cs => cs.CarriageId)
                    .Select(g => g.First())
                    .ToList();

                var previousOccupancy = previousSeatData.Any() 
                    ? (double)previousSeatData.Sum(cs => cs.OcupiedSeats) / previousSeatData.Sum(cs => cs.TotalSeats) * 100 
                    : occupancyRate;

                var occupancyTrend = occupancyRate - previousOccupancy;

                return Ok(new
                {
                    totalPassengers = occupiedSeats,
                    totalSeats = totalSeats,
                    occupancyRate = Math.Round(occupancyRate, 1),
                    occupancyTrend = Math.Round(occupancyTrend, 1),
                    activeCarriages = totalCarriages,
                    avgTemperature = Math.Round(avgTemperature, 1),
                    avgNoiseLevel = Math.Round(avgNoiseLevel, 1),
                    lastUpdated = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stats overview");
                return StatusCode(500, "Internal server error");
            }
        }

        // 2. Seat Availability - for seat-availability-chart.tsx
        [HttpGet("seats/availability")]
        public async Task<ActionResult<object>> GetSeatAvailability()
        {
            try
            {
                // Get all seat data first, then group in memory
                var allSeatData = await _context.CarriageSeats
                    .OrderByDescending(cs => cs.Date)
                    .ToListAsync();

                // Group by CarriageId and get the latest for each
                var latestSeatData = allSeatData
                    .GroupBy(cs => cs.CarriageId)
                    .Select(g => g.First()) // First() because we already ordered by Date descending
                    .OrderBy(cs => cs.CarriageId)
                    .ToList();

                var chartData = latestSeatData.Select(cs => new
                {
                    name = $"Coach {cs.CarriageId}",
                    coach = $"Coach {cs.CarriageId}",
                    occupied = cs.OcupiedSeats,
                    available = cs.TotalSeats - cs.OcupiedSeats,
                    total = cs.TotalSeats,
                    occupancyRate = cs.TotalSeats > 0 ? Math.Round((double)cs.OcupiedSeats / cs.TotalSeats * 100, 1) : 0
                }).ToList();

                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seat availability");
                return StatusCode(500, "Internal server error");
            }
        }

        // 3. Temperature Chart - for temperature-chart.tsx  
        [HttpGet("temperature/history")]
        public async Task<ActionResult<object>> GetTemperatureHistory([FromQuery] int hours = 24)
        {
            try
            {
                var since = DateTime.UtcNow.AddHours(-hours);
                
                var tempData = await _context.CarriageTemperatures
                    .Where(ct => ct.Date >= since)
                    .OrderBy(ct => ct.Date)
                    .ToListAsync();

                // Group by 5-minute intervals
                var chartData = tempData
                    .GroupBy(ct => new { 
                        FiveMinuteInterval = new DateTime(ct.Date.Year, ct.Date.Month, ct.Date.Day, ct.Date.Hour, (ct.Date.Minute / 5) * 5, 0),
                        CarriageId = ct.CarriageId 
                    })
                    .Select(g => new
                    {
                        time = g.Key.FiveMinuteInterval,
                        carriageId = g.Key.CarriageId,
                        temperature = Math.Round((double)g.Average(ct => ct.Temperature), 1)
                    })
                    .GroupBy(x => x.time)
                    .Select(g => {
                        var result = new Dictionary<string, object>
                        {
                            ["time"] = g.Key.ToString("HH:mm"),
                            ["timestamp"] = g.Key
                        };
                        
                        foreach (var item in g)
                        {
                            result[$"coach{item.carriageId}"] = item.temperature;
                        }
                        
                        return result;
                    })
                    .OrderBy(x => (DateTime)x["timestamp"])
                    .ToList();

                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting temperature history");
                return StatusCode(500, "Internal server error");
            }
        }

        // 4. Noise Monitoring - for noise-monitoring-chart.tsx
        [HttpGet("noise/monitoring")]
        public async Task<ActionResult<object>> GetNoiseMonitoring([FromQuery] int hours = 24)
        {
            try
            {
                var since = DateTime.UtcNow.AddHours(-hours);
                
                var noiseData = await _context.CarriageNoises
                    .Where(cn => cn.Date >= since)
                    .OrderBy(cn => cn.Date)
                    .ToListAsync();

                // Group by 5-minute intervals
                var chartData = noiseData
                    .GroupBy(cn => new { 
                        FiveMinuteInterval = new DateTime(cn.Date.Year, cn.Date.Month, cn.Date.Day, cn.Date.Hour, (cn.Date.Minute / 5) * 5, 0),
                        CarriageId = cn.CarriageId 
                    })
                    .Select(g => new
                    {
                        time = g.Key.FiveMinuteInterval,
                        carriageId = g.Key.CarriageId,
                        noiseLevel = Math.Round((double)g.Average(cn => cn.NoiseLevel), 1)
                    })
                    .GroupBy(x => x.time)
                    .Select(g => {
                        var result = new Dictionary<string, object>
                        {
                            ["time"] = g.Key.ToString("HH:mm"),
                            ["timestamp"] = g.Key
                        };
                        
                        foreach (var item in g)
                        {
                            result[$"coach{item.carriageId}"] = item.noiseLevel;
                        }
                        
                        return result;
                    })
                    .OrderBy(x => (DateTime)x["timestamp"])
                    .ToList();

                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting noise monitoring data");
                return StatusCode(500, "Internal server error");
            }
        }

        // 5. Recent Events - for recent-events.tsx
        [HttpGet("events/recent")]
        public async Task<ActionResult<object>> GetRecentEvents([FromQuery] int limit = 10)
        {
            try
            {
                var events = new List<object>();

                // Recent seat changes (actual boarding/disembarking events)
                var recentSeatEvents = await _context.CarriageSeats
                    .OrderByDescending(cs => cs.Date)
                    .Take(limit)
                    .Select(cs => new
                    {
                        id = $"seat_{cs.CarriageId}_{cs.Date:yyyyMMddHHmmss}",
                        type = "occupancy",
                        title = $"Seat Update - Coach {cs.CarriageId}",
                        description = $"Occupancy: {cs.OcupiedSeats}/{cs.TotalSeats} seats ({Math.Round((double)cs.OcupiedSeats / cs.TotalSeats * 100, 0)}%)",
                        time = cs.Date.ToString("HH:mm"),
                        timestamp = cs.Date,
                        severity = cs.OcupiedSeats > cs.TotalSeats * 0.8 ? "high" : 
                                 cs.OcupiedSeats > cs.TotalSeats * 0.6 ? "medium" : "low"
                    })
                    .ToListAsync();

                events.AddRange(recentSeatEvents);

                // Recent temperature readings (last few measurements)
                var recentTempEvents = await _context.CarriageTemperatures
                    .OrderByDescending(ct => ct.Date)
                    .Take(limit / 3)
                    .Select(ct => new
                    {
                        id = $"temp_{ct.CarriageId}_{ct.Date:yyyyMMddHHmmss}",
                        type = "temperature",
                        title = $"Temperature Update - Coach {ct.CarriageId}", 
                        description = $"{Math.Round(ct.Temperature, 1)}°C, {Math.Round(ct.Humidity, 0)}% humidity at {ct.SensorLocation}",
                        time = ct.Date.ToString("HH:mm"),
                        timestamp = ct.Date,
                        severity = ct.Temperature > 28 ? "high" : ct.Temperature < 18 ? "medium" : "low"
                    })
                    .ToListAsync();

                events.AddRange(recentTempEvents);

                // Recent noise readings (last few measurements)
                var recentNoiseEvents = await _context.CarriageNoises
                    .OrderByDescending(cn => cn.Date)
                    .Take(limit / 3)
                    .Select(cn => new
                    {
                        id = $"noise_{cn.CarriageId}_{cn.Date:yyyyMMddHHmmss}",
                        type = "noise",
                        title = $"Noise Update - Coach {cn.CarriageId}", 
                        description = $"{Math.Round(cn.NoiseLevel, 1)}dB at {cn.Location}",
                        time = cn.Date.ToString("HH:mm"),
                        timestamp = cn.Date,
                        severity = cn.NoiseLevel > 80 ? "high" : cn.NoiseLevel > 60 ? "medium" : "low"
                    })
                    .ToListAsync();

                events.AddRange(recentNoiseEvents);

                // Sort all events by timestamp and take the most recent
                var sortedEvents = events
                    .OrderByDescending(e => ((DateTime)((dynamic)e).timestamp))
                    .Take(limit)
                    .ToList();

                return Ok(sortedEvents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent events");
                return StatusCode(500, "Internal server error");
            }
        }

        // 6. Real-time Summary - for dashboard polling
        [HttpGet("realtime")]
        public async Task<ActionResult<object>> GetRealtime()
        {
            try
            {
                var overview = await GetStatsOverview();
                var availability = await GetSeatAvailability();
                var events = await GetRecentEvents(5);

                // Extract the actual data from the ActionResult
                var overviewData = overview.Result is OkObjectResult overviewResult ? overviewResult.Value : null;
                var availabilityData = availability.Result is OkObjectResult availabilityResult ? availabilityResult.Value : null;
                var eventsData = events.Result is OkObjectResult eventsResult ? eventsResult.Value : null;

                return Ok(new
                {
                    overview = overviewData,
                    seatAvailability = availabilityData,
                    recentEvents = eventsData,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting realtime data");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}