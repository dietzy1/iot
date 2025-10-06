using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class CarriageNoiseAndTemp
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CarriageId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal Temperature { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal NoiseLevel { get; set; }
    }
}