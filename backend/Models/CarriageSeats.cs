using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class CarriageSeats
    {
        public int CarriageId { get; set; }
        public DateTime Date { get; set; }
        public int TotalSeats { get; set; } = 24;
        public int OcupiedSeats { get; set; } = 0;
        public int OcupiedSeatsBitMap { get; set; } = 0;
    }
}