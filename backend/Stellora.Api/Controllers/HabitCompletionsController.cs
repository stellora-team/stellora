using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Stellora.Api.Contracts.Habits;
using Stellora.Api.Data;
using Stellora.Api.Models;
using Stellora.Api.Helpers;

namespace Stellora.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/habits/{habitId:guid}/completions")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class HabitCompletionsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public HabitCompletionsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    private static DateOnly GetLocalDate(
        DateTimeOffset now,
        string timeZoneId)
    {
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        var localNow = TimeZoneInfo.ConvertTime(now, timeZone);

        return DateOnly.FromDateTime(localNow.DateTime);
    }

    [HttpPut("today")]
    public async Task<IActionResult> CompleteToday(
        Guid habitId,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var context = await GetOwnedHabitContext(
            habitId, userId, cancellationToken);

        if (context is null)
        {
            return NotFound();
        }

        var now = DateTimeOffset.UtcNow;
        var today = GetLocalDate(now, context.TimeZone);

        var alreadyCompleted = await _dbContext.HabitCompletions
            .AnyAsync(
                completion => completion.HabitId == habitId &&
                              completion.CompletedOn == today,
                cancellationToken);

        if (alreadyCompleted)
        {
            return NoContent();
        }
        
        var todayMask = HabitSchedule.GetDayMask(today);

        if ((context.ScheduledDaysMask & todayMask) == 0)
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Habit is not scheduled today",
                detail: "This habit cannot be completed on the current day.");
        }
        
        var completion = new HabitCompletion
        {
            HabitId = habitId,
            CompletedOn = today,
            CreatedAtUtc = now.UtcDateTime
        };

        _dbContext.HabitCompletions.Add(completion);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation,
                ConstraintName: "ux_habit_completions_habit_date"
            })
        {
            // Інший запит уже створив відмітку за цей день.
            _dbContext.Entry(completion).State = EntityState.Detached;
            return NoContent();
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.ForeignKeyViolation,
                ConstraintName: "FK_habit_completions_habits_HabitId"
            })
        {
            // Звичку видалили між перевіркою та збереженням.
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("today")]
    public async Task<IActionResult> UndoToday(
        Guid habitId,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var context = await GetOwnedHabitContext(
            habitId, userId, cancellationToken);

        if (context is null)
        {
            return NotFound();
        }

        var today = GetLocalDate(
            DateTimeOffset.UtcNow,
            context.TimeZone);

        await _dbContext.HabitCompletions
            .Where(completion =>
                completion.HabitId == habitId &&
                completion.CompletedOn == today &&
                _dbContext.Habits.Any(habit =>
                    habit.Id == completion.HabitId &&
                    habit.UserId == userId))
            .ExecuteDeleteAsync(cancellationToken);

        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<List<HabitCompletionResponse>>> GetHistory(
        Guid habitId,
        CancellationToken cancellationToken,
        [FromQuery, Range(1, 1_000_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 30)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var ownsHabit = await _dbContext.Habits
            .AnyAsync(
                habit => habit.Id == habitId &&
                         habit.UserId == userId,
                cancellationToken);

        if (!ownsHabit)
        {
            return NotFound();
        }

        var history = await _dbContext.HabitCompletions
            .AsNoTracking()
            .Where(completion =>
                completion.HabitId == habitId &&
                _dbContext.Habits.Any(habit =>
                    habit.Id == completion.HabitId &&
                    habit.UserId == userId))
            .OrderByDescending(completion => completion.CompletedOn)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(completion => new HabitCompletionResponse(
                completion.Id,
                completion.CompletedOn,
                completion.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Ok(history);
    }

    private sealed record OwnedHabitContext(
        string TimeZone,
        int ScheduledDaysMask);

    private Task<OwnedHabitContext?> GetOwnedHabitContext(
        Guid habitId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return (
            from habit in _dbContext.Habits
            join user in _dbContext.Users on habit.UserId equals user.Id
            where habit.Id == habitId && habit.UserId == userId
            select new OwnedHabitContext(
                user.TimeZone,
                habit.ScheduledDaysMask)
        ).SingleOrDefaultAsync(cancellationToken);
    }
}