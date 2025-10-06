using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Define your DbSets for each entity you want to store
        public DbSet<CarriageSeats> CarriageSeats { get; set; }
        public DbSet<CarriageNoiseAndTemp> CarriageNoiseAndTemps { get; set; }

        // You can override OnModelCreating to configure your models further
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CarriageSeats>()
                .HasKey(cs => new { cs.CarriageId, cs.Date });

            modelBuilder.Entity<CarriageNoiseAndTemp>()
                .HasKey(cnt => new { cnt.CarriageId, cnt.Date });
        }
    }
}