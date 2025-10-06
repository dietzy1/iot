using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class CarriageSeats
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CarriageId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int TotalSeats { get; set; } = 24;

        [Required]
        public int OcupiedSeats { get; set; } = 0;

        [Required]
        public int OcupiedSeatsBitMap { get; set; } = 0;
    }
}