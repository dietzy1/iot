using System;

namespace backend.Models
{
    public class CarriageNoise
    {
        public int CarriageId { get; set; }
        public DateTime Date { get; set; }
        public float NoiseLevel { get; set; }
        public string Location { get; set; } = string.Empty;
    }
}