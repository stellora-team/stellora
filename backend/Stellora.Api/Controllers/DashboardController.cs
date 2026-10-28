using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Contracts.Dashboard;
using Stellora.Api.Data;
using Stellora.Api.Helpers;

namespace Stellora.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public DashboardController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> GetDashboard(
        CancellationToken cancellationToken)
    {
        Response.Headers["Cache-Control"] = "no-store";

        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var user = await _dbContext.Users
            .AsNoTracking()
            .Where(candidate => candidate.Id == userId)
            .Select(candidate => new
            {
                candidate.DisplayName,
                candidate.TimeZone
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (user is null)
        {
            return Unauthorized();
        }

        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZone);
        var localNow = TimeZoneInfo.ConvertTime(
            DateTimeOffset.UtcNow,
            timeZone);

        var today = DateOnly.FromDateTime(localNow.DateTime);

        var todayMask = HabitSchedule.GetDayMask(today);

        var habitsQuery = _dbContext.Habits
            .AsNoTracking()
            .Where(habit => habit.UserId == userId);

        var scheduledQuery = habitsQuery
            .Where(habit => (habit.ScheduledDaysMask & todayMask) != 0);

        var totalCount = await habitsQuery
            .CountAsync(cancellationToken);

        var completedTodayCount = await habitsQuery
            .CountAsync(
                habit => _dbContext.HabitCompletions.Any(completion =>
                    completion.HabitId == habit.Id &&
                    completion.CompletedOn == today),
                cancellationToken);

        var scheduledTodayCount = await scheduledQuery
            .CountAsync(cancellationToken);

        var completedScheduledTodayCount = await scheduledQuery
            .CountAsync(
                habit => _dbContext.HabitCompletions.Any(completion =>
                    completion.HabitId == habit.Id &&
                    completion.CompletedOn == today),
                cancellationToken);

        var items = await scheduledQuery
            .OrderByDescending(habit => habit.CreatedAtUtc)
            .ThenByDescending(habit => habit.Id)
            .Take(5)
            .Select(habit => new DashboardHabitResponse(
                habit.Id,
                habit.Title,
                habit.CategoryId,
                _dbContext.HabitCompletions.Any(completion =>
                    completion.HabitId == habit.Id &&
                    completion.CompletedOn == today)))
            .ToListAsync(cancellationToken);

        return Ok(new DashboardResponse(
            user.DisplayName,
            user.TimeZone,
            today,
            localNow,
            new DashboardHabitsResponse(
                totalCount,
                completedTodayCount,
                scheduledTodayCount,
                completedScheduledTodayCount,
                items)));
    }
}