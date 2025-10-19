using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeparateTemperatureAndNoiseTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CarriageNoises",
                columns: table => new
                {
                    CarriageId = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    NoiseLevel = table.Column<float>(type: "REAL", nullable: false),
                    Location = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarriageNoises", x => new { x.CarriageId, x.Date });
                });

            migrationBuilder.CreateTable(
                name: "CarriageTemperatures",
                columns: table => new
                {
                    CarriageId = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Temperature = table.Column<float>(type: "REAL", nullable: false),
                    Humidity = table.Column<float>(type: "REAL", nullable: false),
                    SensorLocation = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarriageTemperatures", x => new { x.CarriageId, x.Date });
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarriageNoises");

            migrationBuilder.DropTable(
                name: "CarriageTemperatures");
        }
    }
}
