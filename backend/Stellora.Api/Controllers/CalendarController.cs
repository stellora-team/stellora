using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Contracts.Calendar;
using Stellora.Api.Data;
using Stellora.Api.Helpers;

namespace Stellora.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/calendar")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class CalendarController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public CalendarController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<CalendarResponse>> Get(
        [FromQuery, Required] DateOnly? from,
        [FromQuery, Required] DateOnly? to,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        // ApiController проверяет Required до вызова метода.
        var start = from!.Value;
        var end = to!.Value;

        if (start > end)
        {
            ModelState.AddModelError(
                nameof(to),
                "End date must be on or after start date.");

            return ValidationProblem(ModelState);
        }

        var dayCount = end.DayNumber - start.DayNumber + 1;

        if (dayCount > 31)
        {
            ModelState.AddModelError(
                nameof(to),
                "The requested period must not exceed 31 days.");

            return ValidationProblem(ModelState);
        }

        var timeZoneId = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.TimeZone)
            .SingleOrDefaultAsync(cancellationToken);

        if (timeZoneId is null)
        {
            return Unauthorized();
        }

        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

        var habits = await _dbContext.Habits
            .AsNoTracking()
            .Where(habit => habit.UserId == userId)
            .OrderBy(habit => habit.CreatedAtUtc)
            .ThenBy(habit => habit.Id)
            .Select(habit => new
            {
                habit.Id,
                habit.Title,
                habit.CategoryId,
                habit.ScheduledDaysMask,
                habit.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        var completions = await (
            from completion in _dbContext.HabitCompletions.AsNoTracking()
            join habit in _dbContext.Habits.AsNoTracking()
                on completion.HabitId equals habit.Id
            where habit.UserId == userId
                  && completion.CompletedOn >= start
                  && completion.CompletedOn <= end
            select new
            {
                completion.HabitId,
                completion.CompletedOn
            }
        ).ToListAsync(cancellationToken);

        var completedDates = completions
            .Select(completion => (
                completion.HabitId,
                completion.CompletedOn))
            .ToHashSet();

        var calendarHabits = habits
            .Select(habit => new
            {
                habit.Id,
                habit.Title,
                habit.CategoryId,
                habit.ScheduledDaysMask,
                CreatedOn = DateOnly.FromDateTime(
                    TimeZoneInfo.ConvertTimeFromUtc(
                        habit.CreatedAtUtc,
                        timeZone))
            })
            .ToList();

        var days = new List<CalendarDayResponse>(dayCount);

        for (var offset = 0; offset < dayCount; offset++)
        {
            var date = start.AddDays(offset);
            var dayMask = HabitSchedule.GetDayMask(date);
            var items = new List<CalendarHabitResponse>();

            foreach (var habit in calendarHabits)
            {
                var isCompleted = completedDates.Contains(
                    (habit.Id, date));

                var isScheduled =
                    date >= habit.CreatedOn &&
                    (habit.ScheduledDaysMask & dayMask) != 0;

                if (!isScheduled && !isCompleted)
                {
                    continue;
                }

                items.Add(new CalendarHabitResponse(
                    habit.Id,
                    habit.Title,
                    habit.CategoryId,
                    isScheduled,
                    isCompleted));
            }

            days.Add(new CalendarDayResponse(date, items));
        }

        return Ok(new CalendarResponse(
            start,
            end,
            timeZoneId,
            days));
    }
}