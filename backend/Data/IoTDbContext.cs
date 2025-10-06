using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class IoTDbContext : DbContext
    {
        public IoTDbContext(DbContextOptions<IoTDbContext> options) : base(options)
        {
        }

        public DbSet<CarriageSeats> CarriageSeats { get; set; }
        public DbSet<CarriageNoiseAndTemp> CarriageNoiseAndTemp { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure indexes for better query performance
            modelBuilder.Entity<CarriageSeats>()
                .HasIndex(e => new { e.CarriageId, e.Date })
                .HasDatabaseName("IX_CarriageSeats_CarriageId_Date");

            modelBuilder.Entity<CarriageNoiseAndTemp>()
                .HasIndex(e => new { e.CarriageId, e.Date })
                .HasDatabaseName("IX_CarriageNoiseAndTemp_CarriageId_Date");
        }
    }
}