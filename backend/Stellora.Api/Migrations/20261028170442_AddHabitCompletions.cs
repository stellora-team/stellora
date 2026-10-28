using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stellora.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHabitCompletions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "habit_completions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HabitId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompletedOn = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_habit_completions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_habit_completions_habits_HabitId",
                        column: x => x.HabitId,
                        principalTable: "habits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ux_habit_completions_habit_date",
                table: "habit_completions",
                columns: new[] { "HabitId", "CompletedOn" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "habit_completions");
        }
    }
}
