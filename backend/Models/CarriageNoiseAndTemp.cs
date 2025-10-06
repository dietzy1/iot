using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class CarriageNoiseAndTemp
    {
        public int CarriageId { get; set; }
        public DateTime Date { get; set; }
        public float Temperature { get; set; }
        public float NoiseLevel { get; set; }
    }
}