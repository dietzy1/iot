using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class NoSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "CarriageNoiseAndTemps",
                keyColumns: new[] { "CarriageId", "Date" },
                keyValues: new object[] { 1, new DateTime(2025, 10, 6, 11, 39, 25, 309, DateTimeKind.Local).AddTicks(7802) });

            migrationBuilder.DeleteData(
                table: "CarriageNoiseAndTemps",
                keyColumns: new[] { "CarriageId", "Date" },
                keyValues: new object[] { 1, new DateTime(2025, 10, 6, 11, 39, 25, 309, DateTimeKind.Local).AddTicks(8266) });

            migrationBuilder.DeleteData(
                table: "CarriageSeats",
                keyColumns: new[] { "CarriageId", "Date" },
                keyValues: new object[] { 1, new DateTime(2025, 10, 6, 11, 39, 25, 307, DateTimeKind.Local).AddTicks(9040) });

            migrationBuilder.DeleteData(
                table: "CarriageSeats",
                keyColumns: new[] { "CarriageId", "Date" },
                keyValues: new object[] { 1, new DateTime(2025, 10, 6, 11, 39, 25, 309, DateTimeKind.Local).AddTicks(3939) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
