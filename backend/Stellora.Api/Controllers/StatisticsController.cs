using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Contracts.Statistics;
using Stellora.Api.Data;

namespace Stellora.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/statistics")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class StatisticsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public StatisticsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("habits")]
    public async Task<ActionResult<HabitStatisticsResponse>> GetHabits(
        [FromQuery, Required] DateOnly? from,
        [FromQuery, Required] DateOnly? to,
        CancellationToken cancellationToken,
        [FromQuery, Range(1, int.MaxValue)] int? categoryId = null)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

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

        if (dayCount > 366)
        {
            ModelState.AddModelError(
                nameof(to),
                "The requested period must not exceed 366 days.");

            return ValidationProblem(ModelState);
        }

        if (categoryId.HasValue)
        {
            var categoryExists = await _dbContext.Categories
                .AnyAsync(
                    category => category.Id == categoryId.Value,
                    cancellationToken);

            if (!categoryExists)
            {
                ModelState.AddModelError(
                    nameof(categoryId),
                    "Category does not exist.");

                return ValidationProblem(ModelState);
            }
        }

        var query =
            from completion in _dbContext.HabitCompletions.AsNoTracking()
            join habit in _dbContext.Habits.AsNoTracking()
                on completion.HabitId equals habit.Id
            where habit.UserId == userId
                  && completion.CompletedOn >= start
                  && completion.CompletedOn <= end
            select new
            {
                HabitId = habit.Id,
                habit.Title,
                habit.CategoryId,
                completion.CompletedOn
            };

        if (categoryId.HasValue)
        {
            query = query.Where(
                item => item.CategoryId == categoryId.Value);
        }

        // Одна агрегация даёт данные и для графика, и для итогов.
        var aggregates = await query
            .GroupBy(item => new
            {
                item.HabitId,
                item.Title,
                item.CategoryId,
                item.CompletedOn
            })
            .Select(group => new
            {
                group.Key.HabitId,
                group.Key.Title,
                group.Key.CategoryId,
                group.Key.CompletedOn,
                CompletedCount = group.Count()
            })
            .ToListAsync(cancellationToken);

        var countsByDay = aggregates
            .GroupBy(item => item.CompletedOn)
            .ToDictionary(
                group => group.Key,
                group => group.Sum(item => item.CompletedCount));

        var days = new List<HabitDailyStatisticsResponse>(dayCount);

        for (var offset = 0; offset < dayCount; offset++)
        {
            var date = start.AddDays(offset);

            days.Add(new HabitDailyStatisticsResponse(
                date,
                countsByDay.GetValueOrDefault(date)));
        }

        var habits = aggregates
            .GroupBy(item => new
            {
                item.HabitId,
                item.Title,
                item.CategoryId
            })
            .Select(group => new HabitCompletionStatisticsResponse(
                group.Key.HabitId,
                group.Key.Title,
                group.Key.CategoryId,
                group.Sum(item => item.CompletedCount)))
            .OrderByDescending(item => item.CompletedCount)
            .ThenBy(item => item.HabitId)
            .ToList();

        return Ok(new HabitStatisticsResponse(
            start,
            end,
            categoryId,
            days.Sum(day => day.CompletedCount),
            habits.Count,
            days,
            habits));
    }
}