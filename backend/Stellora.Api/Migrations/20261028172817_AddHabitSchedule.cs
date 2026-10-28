using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stellora.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHabitSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ScheduledDaysMask",
                table: "habits",
                type: "integer",
                nullable: false,
                defaultValue: 127);

            migrationBuilder.AddCheckConstraint(
                name: "ck_habits_scheduled_days_mask",
                table: "habits",
                sql: "\"ScheduledDaysMask\" BETWEEN 1 AND 127");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_habits_scheduled_days_mask",
                table: "habits");

            migrationBuilder.DropColumn(
                name: "ScheduledDaysMask",
                table: "habits");
        }
    }
}
