using System;

namespace backend.Models
{
    public class CarriageTemperature
    {
        public int CarriageId { get; set; }
        public DateTime Date { get; set; }
        public float Temperature { get; set; }
        public float Humidity { get; set; }
        public string SensorLocation { get; set; } = string.Empty;
    }
}