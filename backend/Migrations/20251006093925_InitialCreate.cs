using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CarriageNoiseAndTemps",
                columns: table => new
                {
                    CarriageId = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Temperature = table.Column<float>(type: "REAL", nullable: false),
                    NoiseLevel = table.Column<float>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarriageNoiseAndTemps", x => new { x.CarriageId, x.Date });
                });

            migrationBuilder.CreateTable(
                name: "CarriageSeats",
                columns: table => new
                {
                    CarriageId = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalSeats = table.Column<int>(type: "INTEGER", nullable: false),
                    OcupiedSeats = table.Column<int>(type: "INTEGER", nullable: false),
                    OcupiedSeatsBitMap = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarriageSeats", x => new { x.CarriageId, x.Date });
                });

            migrationBuilder.InsertData(
                table: "CarriageNoiseAndTemps",
                columns: new[] { "CarriageId", "Date", "NoiseLevel", "Temperature" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 10, 6, 11, 39, 25, 309, DateTimeKind.Local).AddTicks(7802), 30f, 22f },
                    { 1, new DateTime(2025, 10, 6, 11, 39, 25, 309, DateTimeKind.Local).AddTicks(8266), 40f, 24f }
                });

            migrationBuilder.InsertData(
                table: "CarriageSeats",
                columns: new[] { "CarriageId", "Date", "OcupiedSeats", "OcupiedSeatsBitMap", "TotalSeats" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 10, 6, 11, 39, 25, 307, DateTimeKind.Local).AddTicks(9040), 0, 0, 24 },
                    { 1, new DateTime(2025, 10, 6, 11, 39, 25, 309, DateTimeKind.Local).AddTicks(3939), 1, 1, 24 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarriageNoiseAndTemps");

            migrationBuilder.DropTable(
                name: "CarriageSeats");
        }
    }
}
